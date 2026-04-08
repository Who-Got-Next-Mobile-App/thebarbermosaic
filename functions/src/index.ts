/**
 * BarberFlow Cloud Functions (PRD §15)
 *
 * Deploy: firebase deploy --only functions
 * Requires: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (webhook), SENDGRID_API_KEY (email, optional)
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import Stripe from 'stripe';

initializeApp();
const db = getFirestore();

function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    logger.warn('STRIPE_SECRET_KEY is not set');
    return null;
  }
  return new Stripe(key);
}

// ─── allocateTax (internal) ───────────────────────────────────────────────────

export async function allocateTax(input: {
  barberId: string;
  paymentId: string;
  appointmentId: string;
  grossAmountCents: number;
  withholdRate: number;
}): Promise<void> {
  const { barberId, paymentId, appointmentId, grossAmountCents, withholdRate } = input;
  const now = new Date();
  const quarter = `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
  const withheldAmount = Math.round(grossAmountCents * withholdRate);

  await db.collection('tax_allocations').add({
    barberId,
    paymentId,
    appointmentId,
    grossAmount: grossAmountCents,
    withholdRate,
    withheldAmount,
    quarter,
    year: now.getFullYear(),
    status: 'held',
    filedAt: null,
    createdAt: FieldValue.serverTimestamp(),
  });
}

// ─── processPayment (callable) ────────────────────────────────────────────────

export const processPayment = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required');
    }

    const { appointmentId, paymentMethodId, tipAmount = 0 } = request.data as {
      appointmentId: string;
      paymentMethodId?: string;
      tipAmount?: number;
    };

    if (!appointmentId) {
      throw new HttpsError('invalid-argument', 'appointmentId is required');
    }

    const apptRef = db.collection('appointments').doc(appointmentId);
    const apptSnap = await apptRef.get();
    if (!apptSnap.exists) {
      throw new HttpsError('not-found', 'Appointment not found');
    }

    const appt = apptSnap.data()!;
    if (appt.clientId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Not your appointment');
    }

    const barberSnap = await db.collection('barbers').doc(appt.barberId).get();
    if (!barberSnap.exists) {
      throw new HttpsError('failed-precondition', 'Professional not found');
    }
    const barber = barberSnap.data()!;

    const stripe = stripeClient();
    const grossAmount = Number(appt.servicePrice) + Number(tipAmount || 0);

    let stripePaymentIntentId = 'pi_stub_pending';
    if (stripe && barber.stripeAccountId && paymentMethodId) {
      const platformFee = Math.round(appt.servicePrice * 0.03);
      const pi = await stripe.paymentIntents.create({
        amount: grossAmount,
        currency: 'usd',
        customer: undefined,
        payment_method: paymentMethodId,
        confirm: true,
        application_fee_amount: platformFee,
        transfer_data: { destination: barber.stripeAccountId },
      });
      stripePaymentIntentId = pi.id;
    } else if (!stripe) {
      logger.warn('processPayment: running without Stripe; marking payment pending for manual reconciliation');
    }

    const paymentRef = db.collection('payments').doc();
    await paymentRef.set({
      id: paymentRef.id,
      appointmentId,
      barberId: appt.barberId,
      clientId: appt.clientId,
      studioId: appt.studioId ?? null,
      grossAmount,
      stripeFee: 0,
      platformFee: Math.round(appt.servicePrice * 0.03),
      taxAllocated: 0,
      tipAmount: tipAmount || 0,
      barberPayout: 0,
      depositAmount: appt.depositPaid ?? 0,
      stripePaymentIntentId,
      stripeTransferId: null,
      stripeRefundId: null,
      status: stripe ? 'succeeded' : 'pending',
      refundReason: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    if (barber.subscriptionTier === 'taxflow') {
      const rate = typeof barber.taxWithholdRate === 'number' ? barber.taxWithholdRate : 0.165;
      await allocateTax({
        barberId: appt.barberId,
        paymentId: paymentRef.id,
        appointmentId,
        grossAmountCents: appt.servicePrice,
        withholdRate: rate,
      });
    }

    await apptRef.update({
      paymentId: paymentRef.id,
      status: 'confirmed',
      confirmedAt: FieldValue.serverTimestamp(),
      tipAmount: tipAmount || 0,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { paymentId: paymentRef.id, stripePaymentIntentId };
  },
);

// ─── completeAppointment (callable) ───────────────────────────────────────────

export const completeAppointment = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required');
    }

    const { appointmentId } = request.data as { appointmentId: string };
    if (!appointmentId) {
      throw new HttpsError('invalid-argument', 'appointmentId is required');
    }

    const ref = db.collection('appointments').doc(appointmentId);
    const snap = await ref.get();
    if (!snap.exists) {
      throw new HttpsError('not-found', 'Appointment not found');
    }
    const data = snap.data()!;
    if (data.barberId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Only the professional can complete');
    }

    await ref.update({
      status: 'completed',
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Tip prompt + review prompt are sent via FCM from sendNotification (implement with FCM tokens)
    return { ok: true };
  },
);

// ─── createReview (callable) ─────────────────────────────────────────────────

export const createReview = onCall(
  { region: 'us-central1', cors: true },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in required');
    }

    const { appointmentId, rating, comment } = request.data as {
      appointmentId: string;
      rating: number;
      comment?: string | null;
    };

    if (!appointmentId || rating == null || rating < 1 || rating > 5) {
      throw new HttpsError('invalid-argument', 'appointmentId and rating 1–5 required');
    }

    const apptRef = db.collection('appointments').doc(appointmentId);
    const apptSnap = await apptRef.get();
    if (!apptSnap.exists) {
      throw new HttpsError('not-found', 'Appointment not found');
    }
    const appt = apptSnap.data()!;
    if (appt.clientId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Only the client can review');
    }
    if (appt.status !== 'completed') {
      throw new HttpsError('failed-precondition', 'Appointment must be completed');
    }
    if (appt.reviewId) {
      throw new HttpsError('already-exists', 'Review already submitted');
    }

    const profession = appt.serviceIds?.length ? 'barber' : 'barber'; // default; extend from service doc if needed

    const reviewRef = db.collection('reviews').doc();
    await reviewRef.set({
      id: reviewRef.id,
      appointmentId,
      barberId: appt.barberId,
      clientId: appt.clientId,
      rating,
      comment: comment ?? null,
      verified: true,
      barberReply: null,
      barberRepliedAt: null,
      profession,
      createdAt: FieldValue.serverTimestamp(),
    });

    const barberRef = db.collection('barbers').doc(appt.barberId);
    await db.runTransaction(async (tx) => {
      const b = await tx.get(barberRef);
      if (!b.exists) return;
      const prevCount = b.data()?.reviewCount ?? 0;
      const prevRating = b.data()?.rating ?? 0;
      const newCount = prevCount + 1;
      const newAvg = (prevRating * prevCount + rating) / newCount;
      tx.update(barberRef, {
        reviewCount: newCount,
        rating: Math.round(newAvg * 100) / 100,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await apptRef.update({
      reviewId: reviewRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { reviewId: reviewRef.id };
  },
);

// ─── sendReminder (scheduled hourly) ──────────────────────────────────────────

export const sendReminder = onSchedule(
  { schedule: 'every 60 minutes', region: 'us-central1', timeZone: 'America/New_York' },
  async () => {
    // Reminder windows (24h / 1h) require querying `startTime` consistently with the app
    // (ISO strings vs Firestore Timestamps) plus composite indexes. Wire FCM + SendGrid here.
    logger.info('sendReminder tick — implement appointment window queries + notifications');
  },
);

// ─── recalculatePlatformBadges (weekly) ───────────────────────────────────────

export const recalculatePlatformBadges = onSchedule(
  { schedule: '0 0 * * 0', region: 'us-central1', timeZone: 'America/New_York' },
  async () => {
    const barbers = await db.collection('barbers').limit(500).get();
    const batch = db.batch();
    let n = 0;
    for (const doc of barbers.docs) {
      const data = doc.data();
      const platformBadges: string[] = [];
      const rating = data.rating ?? 0;
      const reviewCount = data.reviewCount ?? 0;
      if (rating >= 4.8 && reviewCount >= 50) platformBadges.push('top_rated');
      const createdAt = data.createdAt?.toDate?.() as Date | undefined;
      if (createdAt && Date.now() - createdAt.getTime() < 90 * 24 * 60 * 60 * 1000) {
        platformBadges.push('new_barber');
      }
      if (data.cancellationFeePercent > 0 || data.depositRequired) {
        platformBadges.push('no_show_protected');
      }
      if (data.subscriptionTier === 'taxflow') platformBadges.push('taxflow_active');
      batch.update(doc.ref, {
        platformBadges,
        updatedAt: FieldValue.serverTimestamp(),
      });
      n++;
      if (n >= 400) break;
    }
    await batch.commit();
    logger.info('recalculatePlatformBadges updated', n);
  },
);

// ─── sendRebookPrompt (daily) ─────────────────────────────────────────────────

export const sendRebookPrompt = onSchedule(
  { schedule: '0 9 * * *', region: 'us-central1', timeZone: 'America/New_York' },
  async () => {
    logger.info('sendRebookPrompt tick');
    // TODO: query completed appointments by pair, compare rebookIntervalWeeks
  },
);

// ─── generateQuarterlyTaxSummary (day after quarter end) ──────────────────────

export const generateQuarterlyTaxSummary = onSchedule(
  { schedule: '0 6 1 Jan,Apr,Jul,Oct *', region: 'us-central1', timeZone: 'America/New_York' },
  async () => {
    logger.info('generateQuarterlyTaxSummary tick');
    // TODO: aggregate tax_allocations for prior quarter, notify TaxFlow subscribers
  },
);

// ─── generateAnnualIncomeReport (Jan 1) ───────────────────────────────────────

export const generateAnnualIncomeReport = onSchedule(
  { schedule: '0 6 1 1 *', region: 'us-central1', timeZone: 'America/New_York' },
  async () => {
    logger.info('generateAnnualIncomeReport tick');
    // TODO: PDF to Storage, email link
  },
);

// ─── stripeWebhook (HTTP) ─────────────────────────────────────────────────────

export const stripeWebhook = onRequest(
  { region: 'us-central1', cors: false },
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = stripeClient();

    if (req.method !== 'POST' || !stripe || !secret || typeof sig !== 'string') {
      res.status(400).send('Bad request');
      return;
    }

    let event: Stripe.Event;
    try {
      const rawBody =
        (req as { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
      event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    } catch (e) {
      logger.error('Webhook signature failed', e);
      res.status(400).send('Invalid signature');
      return;
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
        logger.info('Stripe event', event.type, event.id);
        break;
      default:
        logger.info('Unhandled Stripe event', event.type);
    }

    res.json({ received: true });
  },
);

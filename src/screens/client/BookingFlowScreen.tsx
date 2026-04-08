/**
 * BookingFlowScreen — 5-step client booking flow
 *
 * Step 1: Choose a service
 * Step 2: Pick a date
 * Step 3: Pick a time slot
 * Step 4: Add details (note + inspiration photo)
 * Step 5: Review & pay
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { db, storage } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useBookingStore } from '../../store/bookingStore';
import {
  ClientStackParamList,
  Service,
  Barber,
  DayAvailability,
  Appointment,
} from '../../types';
import { colors, spacing, fontSize, borderRadius, shadow } from '../../theme';
import { formatCents } from '../../utils/taxCalc';

type Nav = NativeStackNavigationProp<ClientStackParamList>;
type RouteType = RouteProp<ClientStackParamList, 'BookingFlow'>;

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isoToDate(iso: string): Date {
  return new Date(iso);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function buildTimeSlots(
  startTime: string,
  endTime: string,
  durationMins: number,
  blocked: string[],
  dateStr: string,
): string[] {
  const slots: string[] = [];
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  const blockedSet = new Set(blocked);

  for (let m = startMinutes; m + durationMins <= endMinutes; m += 30) {
    const hh = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    const timeStr = `${hh}:${mm}`;
    const isoSlot = `${dateStr}T${timeStr}:00`;
    if (!blockedSet.has(isoSlot)) {
      slots.push(timeStr);
    }
  }
  return slots;
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function formatHour(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

const StepBar: React.FC<{ step: number }> = ({ step }) => (
  <View style={sbStyles.row}>
    {[1, 2, 3, 4, 5].map((n) => (
      <View key={n} style={sbStyles.item}>
        <View style={[sbStyles.dot, step >= n && sbStyles.dotActive]}>
          {step > n ? (
            <Ionicons name="checkmark" size={12} color="#fff" />
          ) : (
            <Text style={[sbStyles.num, step === n && sbStyles.numActive]}>{n}</Text>
          )}
        </View>
        {n < 5 && <View style={[sbStyles.line, step > n && sbStyles.lineActive]} />}
      </View>
    ))}
  </View>
);

const sbStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md },
  item: { flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  num: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  numActive: { color: '#fff' },
  line: { width: 28, height: 2, backgroundColor: colors.border },
  lineActive: { backgroundColor: colors.primary },
});

// ─── Step 1: Select Service ───────────────────────────────────────────────────

const Step1Services: React.FC<{
  barberId: string;
  onSelect: (s: Service) => void;
}> = ({ barberId, onSelect }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocs(
      query(
        collection(db, 'barbers', barberId, 'services'),
        where('isActive', '==', true),
      ),
    )
      .then((snap) => setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service))))
      .finally(() => setLoading(false));
  }, [barberId]);

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />;

  return (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Choose a Service</Text>
      <Text style={styles.stepSub}>What would you like done today?</Text>
      {services.map((svc) => (
        <TouchableOpacity key={svc.id} style={styles.serviceRow} onPress={() => onSelect(svc)} activeOpacity={0.7}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{svc.name}</Text>
            {svc.description ? <Text style={styles.serviceDesc}>{svc.description}</Text> : null}
            <Text style={styles.serviceMeta}>{svc.durationMins} min</Text>
          </View>
          <View style={styles.servicePriceCol}>
            <Text style={styles.servicePrice}>{formatCents(svc.price)}</Text>
            {svc.depositPercent > 0 && (
              <Text style={styles.depositBadge}>{svc.depositPercent}% deposit</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
      {services.length === 0 && (
        <Text style={styles.emptyText}>No services available at this time.</Text>
      )}
    </ScrollView>
  );
};

// ─── Step 2: Pick a Date ──────────────────────────────────────────────────────

const Step2Date: React.FC<{
  barberId: string;
  onSelect: (dateStr: string) => void;
}> = ({ barberId, onSelect }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [availability, setAvailability] = useState<DayAvailability[]>([]);

  useEffect(() => {
    getDocs(collection(db, 'barbers', barberId, 'availability')).then((snap) =>
      setAvailability(snap.docs.map((d) => ({ id: d.id, ...d.data() } as DayAvailability))),
    );
  }, [barberId]);

  const availableDays = new Set(
    availability.filter((a) => a.isAvailable).map((a) => a.dayOfWeek),
  );

  const calDays = buildCalendarDays(year, month);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const isDisabled = (day: number): boolean => {
    const d = new Date(year, month, day);
    if (d < today && !(d.toDateString() === today.toDateString())) return true;
    return !availableDays.has(d.getDay());
  };

  const padDay = (n: number) => String(n).padStart(2, '0');
  const padMonth = (n: number) => String(n + 1).padStart(2, '0');

  return (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Pick a Date</Text>
      <View style={styles.calHeader}>
        <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.calMonth}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.calGrid}>
        {DAYS.map((d) => (
          <Text key={d} style={styles.calDayLabel}>{d}</Text>
        ))}
        {calDays.map((day, idx) => {
          if (day === null) return <View key={`empty-${idx}`} style={styles.calCell} />;
          const disabled = isDisabled(day);
          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[styles.calCell, disabled && styles.calCellDisabled]}
              onPress={() => !disabled && onSelect(`${year}-${padMonth(month)}-${padDay(day)}`)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text style={[styles.calDayNum, disabled && styles.calDayNumDisabled]}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.calHint}>Greyed dates are unavailable</Text>
    </ScrollView>
  );
};

// ─── Step 3: Pick a Time ──────────────────────────────────────────────────────

const Step3Time: React.FC<{
  barberId: string;
  dateStr: string;
  durationMins: number;
  onSelect: (time: string) => void;
}> = ({ barberId, dateStr, durationMins, onSelect }) => {
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    const dow = new Date(dateStr + 'T12:00:00').getDay();
    getDocs(
      query(
        collection(db, 'barbers', barberId, 'availability'),
        where('dayOfWeek', '==', dow),
        where('isAvailable', '==', true),
      ),
    ).then((snap) => {
      if (snap.empty) { setSlots([]); setLoading(false); return; }
      const avail = snap.docs[0].data() as DayAvailability;
      const built = buildTimeSlots(avail.startTime, avail.endTime, durationMins, avail.blockedSlots ?? [], dateStr);
      setSlots(built);
    }).finally(() => setLoading(false));
  }, [barberId, dateStr, durationMins]);

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />;

  return (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Pick a Time</Text>
      <Text style={styles.stepSub}>{formatDate(dateStr + 'T12:00:00')}</Text>
      {slots.length === 0 ? (
        <Text style={styles.emptyText}>No available slots for this date. Try another day.</Text>
      ) : (
        <View style={styles.slotsGrid}>
          {slots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.slotChip, selectedSlot === slot && styles.slotChipSelected]}
              onPress={() => { setSelectedSlot(slot); onSelect(slot); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextSelected]}>
                {formatHour(slot)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

// ─── Step 4: Add Details ──────────────────────────────────────────────────────

const Step4Details: React.FC<{
  note: string;
  photoURL: string | null;
  onNoteChange: (n: string) => void;
  onPhotoChange: (url: string | null) => void;
  uid: string;
}> = ({ note, photoURL, onNoteChange, onPhotoChange, uid }) => {
  const [uploading, setUploading] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to upload inspiration images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const resp = await fetch(asset.uri);
      const blob = await resp.blob();
      const storageRef = ref(storage, `clients/${uid}/inspiration/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      onPhotoChange(url);
    } catch {
      Alert.alert('Upload failed', 'Could not upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Add Details</Text>
      <Text style={styles.stepSub}>Help your stylist prepare for your visit</Text>

      <Text style={styles.fieldLabel}>Note to your stylist (optional)</Text>
      <TextInput
        style={styles.textArea}
        value={note}
        onChangeText={onNoteChange}
        placeholder="Any special requests, allergies, or preferences..."
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={300}
      />
      <Text style={styles.charCount}>{note.length}/300</Text>

      <Text style={styles.fieldLabel}>Inspiration photo (optional)</Text>
      {photoURL ? (
        <View style={styles.inspPhotoContainer}>
          <Image source={{ uri: photoURL }} style={styles.inspPhoto} />
          <TouchableOpacity style={styles.removePhoto} onPress={() => onPhotoChange(null)}>
            <Ionicons name="close-circle" size={26} color={colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.photoUploadBtn} onPress={pickPhoto} disabled={uploading} activeOpacity={0.7}>
          {uploading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <Ionicons name="image-outline" size={28} color={colors.primary} />
              <Text style={styles.photoUploadText}>Upload inspiration photo</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

// ─── Step 5: Confirm + Pay ────────────────────────────────────────────────────

const Step5Confirm: React.FC<{
  barber: Barber;
  service: Service;
  dateStr: string;
  timeStr: string;
  note: string;
  photoURL: string | null;
  promoCode: string;
  promoDiscount: number;
  onPromoChange: (c: string) => void;
  onApplyPromo: () => Promise<void>;
  onBook: () => Promise<void>;
  booking: boolean;
}> = ({
  barber, service, dateStr, timeStr, note, photoURL,
  promoCode, promoDiscount, onPromoChange, onApplyPromo,
  onBook, booking,
}) => {
  const gross = service.price;
  const depositAmount = service.depositPercent > 0 ? Math.round(gross * service.depositPercent / 100) : gross;
  const discountAmount = promoDiscount;
  const totalDue = Math.max(0, depositAmount - discountAmount);

  const startISO = `${dateStr}T${timeStr}:00`;

  return (
    <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Confirm Booking</Text>

      {/* Barber + service summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Professional</Text>
          <Text style={styles.summaryValue}>{barber.displayName}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service</Text>
          <Text style={styles.summaryValue}>{service.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date & Time</Text>
          <Text style={styles.summaryValue}>
            {formatDate(startISO)}{'\n'}{formatHour(timeStr)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration</Text>
          <Text style={styles.summaryValue}>{service.durationMins} min</Text>
        </View>
        {note ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Your note</Text>
            <Text style={[styles.summaryValue, { flex: 1, textAlign: 'right' }]}>{note}</Text>
          </View>
        ) : null}
        {photoURL ? (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Inspiration</Text>
            <Image source={{ uri: photoURL }} style={styles.summaryThumb} />
          </View>
        ) : null}
      </View>

      {/* Promo code */}
      <Text style={styles.fieldLabel}>Promo code</Text>
      <View style={styles.promoRow}>
        <TextInput
          style={styles.promoInput}
          value={promoCode}
          onChangeText={onPromoChange}
          placeholder="Enter code"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.promoBtn} onPress={onApplyPromo} activeOpacity={0.7}>
          <Text style={styles.promoBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Payment breakdown */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service price</Text>
          <Text style={styles.summaryValue}>{formatCents(gross)}</Text>
        </View>
        {service.depositPercent > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Deposit due today ({service.depositPercent}%)</Text>
            <Text style={styles.summaryValue}>{formatCents(depositAmount)}</Text>
          </View>
        )}
        {discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.success }]}>Promo discount</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>-{formatCents(discountAmount)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>
            {service.depositPercent > 0 ? 'Total due today' : 'Total due'}
          </Text>
          <Text style={styles.totalAmount}>{formatCents(totalDue)}</Text>
        </View>
      </View>

      <Text style={styles.paymentNotice}>
        Payment will be processed securely via Stripe. Apple Pay and Google Pay supported.
      </Text>

      <TouchableOpacity
        style={[styles.bookBtn, booking && styles.bookBtnDisabled]}
        onPress={onBook}
        disabled={booking}
        activeOpacity={0.7}
      >
        {booking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.bookBtnText}>Confirm & Pay {formatCents(totalDue)}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.cancelNote}>
        Free cancellation up to {barber.cancellationWindowHours}h before your appointment.
      </Text>
    </ScrollView>
  );
};

// ─── Main Booking Flow Screen ─────────────────────────────────────────────────

export const BookingFlowScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const { barberId } = route.params;
  const { firebaseUser, clientProfile } = useAuth();

  const {
    barber, selectedService, selectedDate, selectedTime,
    clientNote, inspirationPhotoURL, promoCode, promoDiscount, step,
    setBarber, setSelectedService, setSelectedDate, setSelectedTime,
    setClientNote, setInspirationPhoto, setPromoCode, setPromoDiscount,
    setStep, resetBooking,
  } = useBookingStore();

  const [loading, setLoading] = useState(!barber);
  const [booking, setBooking] = useState(false);

  // Load barber if not already in store
  useEffect(() => {
    if (barber && barber.uid === barberId) { setLoading(false); return; }
    getDoc(doc(db, 'barbers', barberId)).then((snap) => {
      if (snap.exists()) setBarber({ uid: snap.id, ...snap.data() } as Barber);
    }).finally(() => setLoading(false));
  }, [barberId]);

  // Reset store when screen unmounts
  useEffect(() => () => { resetBooking(); }, []);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3 | 4 | 5);
    else navigation.goBack();
  }, [step]);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const snap = await getDocs(
        query(
          collection(db, 'barbers', barberId, 'promoCodes'),
          where('code', '==', promoCode.trim().toUpperCase()),
          where('isActive', '==', true),
        ),
      );
      if (snap.empty) { Alert.alert('Invalid code', 'This promo code is not valid.'); return; }
      const promo = snap.docs[0].data();
      const service = selectedService!;
      let discount = 0;
      if (promo.discountType === 'percent') {
        discount = Math.round(service.price * promo.discountValue / 100);
      } else {
        discount = promo.discountValue;
      }
      setPromoDiscount(discount);
      Alert.alert('Code applied!', `You saved ${formatCents(discount)}.`);
    } catch {
      Alert.alert('Error', 'Could not validate promo code. Please try again.');
    }
  };

  const handleBook = async () => {
    if (!barber || !selectedService || !selectedDate || !selectedTime || !firebaseUser || !clientProfile) return;
    setBooking(true);
    try {
      const startISO = `${selectedDate}T${selectedTime}:00`;
      const startDate = new Date(startISO);
      const endDate = new Date(startDate.getTime() + selectedService.durationMins * 60000);

      const depositAmount = selectedService.depositPercent > 0
        ? Math.round(selectedService.price * selectedService.depositPercent / 100)
        : selectedService.price;

      const apptData: Omit<Appointment, 'id'> = {
        barberId: barber.uid,
        clientId: firebaseUser.uid,
        studioId: barber.studioId,
        serviceIds: [selectedService.id],
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceDurationMins: selectedService.durationMins,
        barberDisplayName: barber.displayName,
        clientDisplayName: clientProfile.displayName,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        status: 'pending',
        confirmedAt: null,
        completedAt: null,
        cancelledAt: null,
        cancelReason: null,
        cancelledBy: null,
        paymentId: null,
        depositPaid: 0, // Cloud Function will update after payment
        remainingBalance: selectedService.price - depositAmount,
        clientNote: clientNote || null,
        inspirationPhotoURL: inspirationPhotoURL,
        reviewId: null,
        tipAmount: 0,
        messageThreadId: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const apptRef = await addDoc(collection(db, 'appointments'), apptData);

      resetBooking();
      navigation.replace('BookingConfirmation', { appointmentId: apptRef.id });
    } catch (err) {
      console.error('Booking error:', err);
      Alert.alert('Booking failed', 'Something went wrong. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading || !barber) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={step === 1 ? 'close' : 'arrow-back'} size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{barber.displayName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <StepBar step={step} />

      {step === 1 && (
        <Step1Services
          barberId={barberId}
          onSelect={(s) => { setSelectedService(s); setStep(2); }}
        />
      )}
      {step === 2 && (
        <Step2Date
          barberId={barberId}
          onSelect={(d) => { setSelectedDate(d); setStep(3); }}
        />
      )}
      {step === 3 && selectedService && selectedDate && (
        <Step3Time
          barberId={barberId}
          dateStr={selectedDate}
          durationMins={selectedService.durationMins}
          onSelect={(t) => { setSelectedTime(t); setStep(4); }}
        />
      )}
      {step === 4 && (
        <Step4Details
          note={clientNote}
          photoURL={inspirationPhotoURL}
          onNoteChange={setClientNote}
          onPhotoChange={setInspirationPhoto}
          uid={firebaseUser?.uid ?? ''}
        />
      )}
      {step === 5 && barber && selectedService && selectedDate && selectedTime && (
        <Step5Confirm
          barber={barber}
          service={selectedService}
          dateStr={selectedDate}
          timeStr={selectedTime}
          note={clientNote}
          photoURL={inspirationPhotoURL}
          promoCode={promoCode}
          promoDiscount={promoDiscount}
          onPromoChange={setPromoCode}
          onApplyPromo={applyPromo}
          onBook={handleBook}
          booking={booking}
        />
      )}

      {/* Next button for steps 4 */}
      {step === 4 && (
        <View style={styles.nextBar}>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => setStep(5)}
            activeOpacity={0.8}
          >
            <Text style={styles.nextBtnText}>Continue to Review</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm,
  },
  headerTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },

  stepContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  stepTitle: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '800', marginBottom: spacing.xs },
  stepSub: { color: colors.textMuted, fontSize: fontSize.md, marginBottom: spacing.lg },

  // Services
  serviceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg,
    marginBottom: spacing.sm, ...shadow.sm,
  },
  serviceInfo: { flex: 1, marginRight: spacing.md },
  serviceName: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: 2 },
  serviceDesc: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: 4 },
  serviceMeta: { color: colors.textMuted, fontSize: fontSize.sm },
  servicePriceCol: { alignItems: 'flex-end' },
  servicePrice: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '700' },
  depositBadge: {
    color: colors.text, backgroundColor: colors.primaryMuted,
    fontSize: fontSize.xs, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: borderRadius.full, marginTop: 4,
  },

  // Calendar
  calHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  calMonth: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  calDayLabel: {
    width: `${100 / 7}%`, textAlign: 'center',
    color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.sm,
  },
  calCell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  calCellDisabled: { opacity: 0.3 },
  calDayNum: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  calDayNumDisabled: { color: colors.textMuted },
  calHint: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', marginTop: spacing.sm },

  // Time slots
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  slotChip: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  slotChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  slotTextSelected: { color: '#fff' },

  // Details
  fieldLabel: { color: colors.textMuted, fontSize: fontSize.sm, fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.md },
  textArea: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border,
    color: colors.text, fontSize: fontSize.md, padding: spacing.md,
    minHeight: 100, textAlignVertical: 'top',
  },
  charCount: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'right', marginTop: 4 },
  photoUploadBtn: {
    height: 120, backgroundColor: colors.surface, borderRadius: borderRadius.lg,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  photoUploadText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '600' },
  inspPhotoContainer: { position: 'relative', marginTop: spacing.sm },
  inspPhoto: { width: '100%', height: 200, borderRadius: borderRadius.lg },
  removePhoto: { position: 'absolute', top: spacing.sm, right: spacing.sm },

  // Confirm
  summaryCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg,
    marginBottom: spacing.md, ...shadow.sm,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  summaryLabel: { color: colors.textMuted, fontSize: fontSize.md, flex: 1 },
  summaryValue: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', textAlign: 'right' },
  summaryThumb: { width: 60, height: 60, borderRadius: borderRadius.md },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.xs, paddingTop: spacing.sm },
  totalLabel: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  totalAmount: { color: colors.primary, fontSize: fontSize.xl, fontWeight: '800' },

  promoRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  promoInput: {
    flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.border, color: colors.text,
    fontSize: fontSize.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  promoBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg, justifyContent: 'center',
  },
  promoBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },

  paymentNotice: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', marginBottom: spacing.lg },
  bookBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg, alignItems: 'center', marginBottom: spacing.md,
  },
  bookBtnDisabled: { opacity: 0.7 },
  bookBtnText: { color: '#fff', fontSize: fontSize.xl, fontWeight: '800' },
  cancelNote: { color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', marginBottom: spacing.xl },

  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', marginTop: spacing.xxl },

  nextBar: {
    padding: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  nextBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.xl,
    paddingVertical: spacing.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  nextBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '800' },
});

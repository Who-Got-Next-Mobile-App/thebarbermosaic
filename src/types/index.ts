// ─── Enums & Unions ─────────────────────────────────────────────────────────

export type Profession =
  | 'barber'
  | 'hair_stylist'
  | 'nail_tech'
  | 'lash_tech'
  | 'makeup_artist';

export type ProfileType = 'solo' | 'studio';

export type UserRole = 'barber' | 'client' | 'admin';

export type SubscriptionTier = 'base' | 'taxflow';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type PaymentStatus = 'pending' | 'succeeded' | 'refunded' | 'failed';

export type TaxAllocationStatus = 'held' | 'ready_to_file' | 'filed';

export type MessageType = 'text' | 'image';

export type SenderRole = 'barber' | 'client';

export type NotificationChannel = 'push' | 'email';

export type NotificationType =
  | 'booking_confirmation'
  | 'appointment_reminder'
  | 'receipt'
  | 'tax_alert'
  | 'rebook_prompt'
  | 'message'
  | 'tip_received'
  | 'review_received'
  | 'no_show_fee'
  | 'payout'
  | 'subscription_renewal'
  | 'promo_redeemed'
  | 'new_review'
  | 'quarterly_summary'
  | 'annual_report'
  | 'quarterly_deadline';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

// ─── Badge Types ─────────────────────────────────────────────────────────────

export type PlatformBadgeId =
  | 'top_rated'
  | 'new_barber'
  | 'fast_responder'
  | 'high_retention'
  | 'no_show_protected'
  | 'taxflow_active';

export type BarberBadgeId =
  | 'fades_tapers'
  | 'beard_specialist'
  | 'locs_twists'
  | 'line_art_designs'
  | 'classic_cuts'
  | 'womens_cuts'
  | 'color_highlights'
  | 'scalp_treatments'
  | 'straight_razor';

export type HairStylistBadgeId =
  | 'silk_press'
  | 'braids_cornrows'
  | 'weaves_extensions'
  | 'natural_hair'
  | 'color_specialist'
  | 'protective_styles'
  | 'wigs_installs'
  | 'locs_maintenance';

export type NailTechBadgeId =
  | 'acrylics'
  | 'gel_gel_x'
  | 'nail_art_designs'
  | 'press_ons'
  | 'natural_nail_care'
  | 'dip_powder'
  | 'pedicures'
  | 'nail_extensions';

export type LashTechBadgeId =
  | 'classic_lashes'
  | 'volume_lashes'
  | 'hybrid_lashes'
  | 'mega_volume'
  | 'lash_lifts_tints'
  | 'lash_extensions'
  | 'lash_removal'
  | 'bottom_lashes';

export type MakeupArtistBadgeId =
  | 'bridal_makeup'
  | 'editorial_fashion'
  | 'glam_evening'
  | 'natural_everyday'
  | 'sfx'
  | 'airbrush_makeup'
  | 'contouring_specialist'
  | 'melanin_specialist';

export type AccessibilityBadgeId =
  | 'autism_friendly'
  | 'wheelchair_accessible'
  | 'mobile_home_visits'
  | 'quiet_environment'
  | 'senior_friendly'
  | 'multilingual';

export type ClientExperienceBadgeId =
  | 'kids_specialist'
  | 'accepts_walk_ins'
  | 'late_night_hours'
  | 'same_day_available'
  | 'competition_winner'
  | 'industry_educator';

export type ShopVibeBadgeId =
  | 'faith_based'
  | 'black_owned'
  | 'woman_owned'
  | 'lgbtq_friendly'
  | 'no_talk_zone'
  | 'gamer_friendly';

export type SelfSelectBadgeId =
  | BarberBadgeId
  | HairStylistBadgeId
  | NailTechBadgeId
  | LashTechBadgeId
  | MakeupArtistBadgeId
  | AccessibilityBadgeId
  | ClientExperienceBadgeId
  | ShopVibeBadgeId;

export type BadgeId = PlatformBadgeId | SelfSelectBadgeId;

export type BadgeCategory =
  | 'platform'
  | 'barber'
  | 'hair_stylist'
  | 'nail_tech'
  | 'lash_tech'
  | 'makeup_artist'
  | 'accessibility'
  | 'client_experience'
  | 'shop_vibe';

export interface BadgeDefinition {
  id: BadgeId;
  label: string;
  emoji: string;
  description: string;
  category: BadgeCategory;
  professions?: Profession[]; // if undefined, applies to all
  isPlatformAssigned?: boolean;
}

// ─── Autism-Friendly Details ─────────────────────────────────────────────────

export interface AutismFriendlyDetails {
  quietEnvironment: boolean;
  scissorsOnly: boolean;
  parentsInChair: boolean;
  extendedTime: boolean;
  fidgetToolsAllowed: boolean;
  additionalNotes: string;
}

// ─── Availability ────────────────────────────────────────────────────────────

export interface DayAvailability {
  id?: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  isAvailable: boolean;
  blockedSlots: string[]; // ISO timestamp strings
}

// ─── Service ─────────────────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  description: string;
  profession: Profession;
  price: number; // in cents
  durationMins: number;
  depositPercent: number;
  isActive: boolean;
  createdAt: string;
}

// ─── Portfolio Photo ──────────────────────────────────────────────────────────

export interface PortfolioPhoto {
  id: string;
  imageURL: string;
  profession: Profession;
  caption: string;
  order: number;
  createdAt: string;
}

// ─── Promo Code ──────────────────────────────────────────────────────────────

export interface PromoCode {
  id: string;
  barberId: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number; // percent 0-100, or cents
  expiresAt: string | null;
  redemptionCount: number;
  totalDiscountGiven: number; // cents
  isActive: boolean;
  createdAt: string;
}

// ─── Barber (Professional) ────────────────────────────────────────────────────

export interface Barber {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  photoURL: string;
  bio: string;
  professions: Profession[];
  profileType: ProfileType;
  studioId: string | null;
  bookingSlug: string;
  location: { latitude: number; longitude: number } | null;
  address: string;
  city: string;
  state: string;
  selectedBadges: SelfSelectBadgeId[];
  platformBadges: PlatformBadgeId[];
  stripeAccountId: string;
  stripeOnboardingComplete: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  taxflowTrialEndsAt: string | null;
  taxWithholdRate: number; // default 0.165
  rating: number;
  reviewCount: number;
  isActive: boolean;
  acceptsWalkIns: boolean;
  cancellationWindowHours: number;
  cancellationFeePercent: number;
  depositRequired: boolean;
  depositPercent: number;
  autismFriendlyDetails: AutismFriendlyDetails | null;
  rebookIntervalWeeks: number;
  onboardingComplete: boolean;
  fcmToken: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Studio ───────────────────────────────────────────────────────────────────

export interface Studio {
  id: string;
  ownerUid: string;
  name: string;
  description: string;
  photoURL: string;
  coverPhotoURL: string;
  address: string;
  city: string;
  state: string;
  location: { latitude: number; longitude: number } | null;
  phone: string;
  email: string;
  website: string | null;
  studioPhotos: string[];
  studioBadges: SelfSelectBadgeId[];
  professionalIds: string[];
  rating: number;
  reviewCount: number;
  boothRentAmount: number; // cents per month
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Client ───────────────────────────────────────────────────────────────────

export interface Client {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  photoURL: string;
  favoriteBarbers: string[];
  stripeCustomerId: string;
  defaultPaymentMethodId: string;
  professionPreferences: Profession[];
  notifPrefs: {
    email: boolean;
    push: boolean;
  };
  referralCode: string;
  referredBy: string | null;
  referralCredits: number; // cents
  onboardingComplete: boolean;
  locationEnabled: boolean;
  lastKnownZip: string | null;
  fcmToken: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Appointment ──────────────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  barberId: string;
  clientId: string;
  studioId: string | null;
  serviceIds: string[];
  // Snapshots
  serviceName: string;
  servicePrice: number; // cents
  serviceDurationMins: number;
  barberDisplayName: string;
  clientDisplayName: string;
  // Scheduling
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  // Status
  status: AppointmentStatus;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  cancelledBy: 'barber' | 'client' | null;
  // Payment
  paymentId: string | null;
  depositPaid: number; // cents
  remainingBalance: number; // cents
  // Client communication
  clientNote: string | null;
  inspirationPhotoURL: string | null;
  // Review
  reviewId: string | null;
  tipAmount: number; // cents
  // Messaging
  messageThreadId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  appointmentId: string;
  barberId: string;
  clientId: string;
  studioId: string | null;
  grossAmount: number; // cents
  stripeFee: number; // cents
  platformFee: number; // cents
  taxAllocated: number; // cents
  tipAmount: number; // cents
  barberPayout: number; // cents
  depositAmount: number; // cents
  stripePaymentIntentId: string;
  stripeTransferId: string | null;
  stripeRefundId: string | null;
  status: PaymentStatus;
  refundReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Tax Allocation ───────────────────────────────────────────────────────────

export interface TaxAllocation {
  id: string;
  barberId: string;
  paymentId: string;
  appointmentId: string;
  grossAmount: number; // cents
  withholdRate: number; // e.g. 0.165
  withheldAmount: number; // cents
  quarter: string; // "2025-Q1"
  year: number;
  status: TaxAllocationStatus;
  filedAt: string | null;
  createdAt: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  appointmentId: string;
  barberId: string;
  clientId: string;
  rating: number; // 1-5
  comment: string | null;
  verified: boolean;
  barberReply: string | null;
  barberRepliedAt: string | null;
  profession: Profession;
  createdAt: string;
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export interface MessageThread {
  id: string;
  appointmentId: string;
  barberId: string;
  clientId: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageBy: string; // uid
  unreadCount: Record<string, number>; // uid → count
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderRole: SenderRole;
  type: MessageType;
  text: string | null;
  imageURL: string | null;
  readBy: string[]; // uids
  createdAt: string;
}

// ─── Notifications Log ────────────────────────────────────────────────────────

export interface NotificationLog {
  id: string;
  userId: string;
  userRole: UserRole;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  status: 'sent' | 'failed';
  relatedId: string | null;
  sentAt: string;
}

// ─── Platform Config ──────────────────────────────────────────────────────────

export interface PlatformConfig {
  taxWithholdRate: number; // 0.165
  platformFeeRate: number; // 0.03
  stripeFeeRate: number; // 0.029
  stripeFeeFixed: number; // 30 cents
  basePlanPriceCents: number; // 3999
  taxflowAddonPriceCents: number; // 2999
  taxflowTrialDays: number; // 30
  irsQuarterlyDeadlines: {
    Q1: string;
    Q2: string;
    Q3: string;
    Q4: string;
  };
  referralCreditCents: number;
  maxPortfolioPhotos: number; // 30
  maxBadgesDisplayed: number; // 6
}

// ─── Client Note (Private, barber-only) ──────────────────────────────────────

export interface ClientNote {
  uid: string; // client uid
  displayName: string;
  photoURL: string;
  visitCount: number;
  lastVisitDate: string | null;
  totalSpentCents: number;
  notes: string; // private barber notes
  hairType: string;
  preferences: string;
  sensitivities: string;
  updatedAt: string;
}

// ─── Discovery / Search ───────────────────────────────────────────────────────

export interface DiscoveryFilters {
  professions: Profession[];
  radiusMiles: number | null; // null = any
  minRating: number | null;
  maxPricePerServiceCents: number | null;
  badges: SelfSelectBadgeId[];
  availableToday: boolean;
  availableThisWeek: boolean;
  specificDate: string | null;
  acceptsWalkIns: boolean;
  sortBy: 'distance' | 'rating' | 'price' | 'availability';
}

// ─── Booking Flow State ───────────────────────────────────────────────────────

export interface BookingFlowState {
  barberId: string;
  barber: Barber | null;
  selectedService: Service | null;
  selectedDate: string | null; // YYYY-MM-DD
  selectedTime: string | null; // HH:MM
  clientNote: string;
  inspirationPhotoURL: string | null;
  promoCode: string;
  promoDiscount: number; // cents
  step: 1 | 2 | 3 | 4 | 5;
}

// ─── Auth Custom Claims ───────────────────────────────────────────────────────

export interface AuthClaims {
  role: UserRole;
  profileType?: ProfileType;
  subscriptionStatus?: SubscriptionStatus;
}

// ─── Navigation Param Lists ───────────────────────────────────────────────────

export type AuthStackParamList = {
  Welcome: undefined;
  ProCreateAccount: undefined;
  ClientCreateAccount: undefined;
};

export type ProOnboardingParamList = {
  ChooseProfession: undefined;
  BuildProfile: undefined;
  PickBadges: undefined;
  AddServices: undefined;
  SetAvailability: undefined;
  ConnectBank: undefined;
  PainQuestion: undefined;
  TheRealNumber: { painAnswer: 'covered' | 'surprised' | 'didnt_file' };
  FreeTrialOffer: { monthlyIncome: number };
  YouAreLive: undefined;
};

export type ClientOnboardingParamList = {
  WhatAreYouLookingFor: undefined;
  EnableLocation: undefined;
  TurnOnNotifications: undefined;
};

export type ProMainTabParamList = {
  DashboardTab: undefined;
  CalendarTab: undefined;
  ClientsTab: undefined;
  IncomeTab: undefined;
  ProProfileTab: undefined;
};

export type ClientMainTabParamList = {
  DiscoveryTab: undefined;
  BookingsTab: undefined;
  MessagesTab: undefined;
  ClientProfileTab: undefined;
};

export type ProStackParamList = {
  ProTabs: undefined;
  AppointmentDetail: { appointmentId: string };
  ServiceManager: undefined;
  AddEditService: { serviceId?: string };
  AvailabilityManager: undefined;
  BadgeManager: undefined;
  Portfolio: undefined;
  PromoCodeManager: undefined;
  TaxFlowDashboard: undefined;
  StudioDashboard: undefined;
  ClientDetail: { clientUid: string };
  Settings: undefined;
};

export type ClientStackParamList = {
  ClientTabs: undefined;
  ProfessionalProfile: { barberId: string };
  BookingFlow: { barberId: string };
  BookingConfirmation: { appointmentId: string };
  AppointmentHistoryDetail: { appointmentId: string };
  TipScreen: { appointmentId: string };
  ReviewScreen: { appointmentId: string };
  MessageThread: { threadId: string; appointmentId: string };
  ClientSettings: undefined;
  Favorites: undefined;
};

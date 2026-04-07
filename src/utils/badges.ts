import {
  BadgeDefinition,
  BadgeId,
  Profession,
  SelfSelectBadgeId,
  PlatformBadgeId,
} from '../types';

// ─── All 65 Badge Definitions ─────────────────────────────────────────────────

export const ALL_BADGES: BadgeDefinition[] = [
  // Platform-assigned (6) — auto, never count toward 6-badge cap
  {
    id: 'top_rated',
    label: 'Top Rated',
    emoji: '⭐',
    description: '4.8+ star average with 50+ verified reviews',
    category: 'platform',
    isPlatformAssigned: true,
  },
  {
    id: 'new_barber',
    label: 'New to BarberFlow',
    emoji: '🆕',
    description: 'First 90 days on the platform',
    category: 'platform',
    isPlatformAssigned: true,
  },
  {
    id: 'fast_responder',
    label: 'Fast Responder',
    emoji: '⚡',
    description: 'Confirms appointments within 30 minutes on average',
    category: 'platform',
    isPlatformAssigned: true,
  },
  {
    id: 'high_retention',
    label: 'High Retention',
    emoji: '🔁',
    description: '70%+ of clients rebook within 6 weeks',
    category: 'platform',
    isPlatformAssigned: true,
  },
  {
    id: 'no_show_protected',
    label: 'No-Show Protected',
    emoji: '🛡️',
    description: 'Has deposit or cancellation policy enabled',
    category: 'platform',
    isPlatformAssigned: true,
  },
  {
    id: 'taxflow_active',
    label: 'TaxFlow™ Active',
    emoji: '💼',
    description: 'Currently subscribed to TaxFlow™',
    category: 'platform',
    isPlatformAssigned: true,
  },

  // Barber Specialties (9)
  {
    id: 'fades_tapers',
    label: 'Fades & Tapers',
    emoji: '✂️',
    description: 'Skin fades, mid fades, high fades, tapers',
    category: 'barber',
    professions: ['barber'],
  },
  {
    id: 'beard_specialist',
    label: 'Beard Specialist',
    emoji: '🧔',
    description: 'Beard shaping, lineups, hot towel shaves',
    category: 'barber',
    professions: ['barber'],
  },
  {
    id: 'locs_twists',
    label: 'Locs & Twists',
    emoji: '🌀',
    description: 'Starter locs, retwists, loc maintenance',
    category: 'barber',
    professions: ['barber'],
  },
  {
    id: 'line_art_designs',
    label: 'Line Art & Designs',
    emoji: '✏️',
    description: 'Custom hair designs, razor art, portraits',
    category: 'barber',
    professions: ['barber'],
  },
  {
    id: 'classic_cuts',
    label: 'Classic Cuts',
    emoji: '💈',
    description: 'Traditional barbering, pompadours, scissor work',
    category: 'barber',
    professions: ['barber'],
  },
  {
    id: 'womens_cuts',
    label: "Women's Cuts",
    emoji: '👩',
    description: 'Short styles, TWAs, women\'s fades',
    category: 'barber',
    professions: ['barber'],
  },
  {
    id: 'color_highlights',
    label: 'Color & Highlights',
    emoji: '🎨',
    description: 'Hair color, bleaching, creative color work',
    category: 'barber',
    professions: ['barber'],
  },
  {
    id: 'scalp_treatments',
    label: 'Scalp Treatments',
    emoji: '💆',
    description: 'Scalp massages, dandruff treatments, hot oil',
    category: 'barber',
    professions: ['barber'],
  },
  {
    id: 'straight_razor',
    label: 'Straight Razor',
    emoji: '🔪',
    description: 'Traditional straight razor shave certified',
    category: 'barber',
    professions: ['barber'],
  },

  // Hair Stylist Specialties (8)
  {
    id: 'silk_press',
    label: 'Silk Press',
    emoji: '🔥',
    description: 'Dominican blowouts, silk press, thermal styling',
    category: 'hair_stylist',
    professions: ['hair_stylist'],
  },
  {
    id: 'braids_cornrows',
    label: 'Braids & Cornrows',
    emoji: '🪢',
    description: 'Box braids, cornrows, knotless, feed-ins',
    category: 'hair_stylist',
    professions: ['hair_stylist'],
  },
  {
    id: 'weaves_extensions',
    label: 'Weaves & Extensions',
    emoji: '💁',
    description: 'Sew-ins, quick weaves, tape-ins, clip-ins',
    category: 'hair_stylist',
    professions: ['hair_stylist'],
  },
  {
    id: 'natural_hair',
    label: 'Natural Hair Specialist',
    emoji: '🌿',
    description: 'Wash-n-go, twist-outs, shrinkage management',
    category: 'hair_stylist',
    professions: ['hair_stylist'],
  },
  {
    id: 'color_specialist',
    label: 'Color Specialist',
    emoji: '🎨',
    description: 'Balayage, highlights, color correction',
    category: 'hair_stylist',
    professions: ['hair_stylist'],
  },
  {
    id: 'protective_styles',
    label: 'Protective Styles',
    emoji: '🛡️',
    description: 'Faux locs, passion twists, jumbo braids',
    category: 'hair_stylist',
    professions: ['hair_stylist'],
  },
  {
    id: 'wigs_installs',
    label: 'Wigs & Wig Installs',
    emoji: '👑',
    description: 'Custom wig making, HD lace installs, wig styling',
    category: 'hair_stylist',
    professions: ['hair_stylist'],
  },
  {
    id: 'locs_maintenance',
    label: 'Locs & Loc Maintenance',
    emoji: '🌀',
    description: 'Starter locs, retwists, interlocking, loc styling',
    category: 'hair_stylist',
    professions: ['hair_stylist'],
  },

  // Nail Tech Specialties (8)
  {
    id: 'acrylics',
    label: 'Acrylics',
    emoji: '💅',
    description: 'Full sets, fills, sculpted nails',
    category: 'nail_tech',
    professions: ['nail_tech'],
  },
  {
    id: 'gel_gel_x',
    label: 'Gel & Gel-X',
    emoji: '💎',
    description: 'Hard gel, soft gel, gel-x extensions',
    category: 'nail_tech',
    professions: ['nail_tech'],
  },
  {
    id: 'nail_art_designs',
    label: 'Nail Art & Designs',
    emoji: '🎨',
    description: 'Hand-painted art, stamping, 3D nail art',
    category: 'nail_tech',
    professions: ['nail_tech'],
  },
  {
    id: 'press_ons',
    label: 'Press-Ons',
    emoji: '🌸',
    description: 'Custom press-on sets, sizing, application',
    category: 'nail_tech',
    professions: ['nail_tech'],
  },
  {
    id: 'natural_nail_care',
    label: 'Natural Nail Care',
    emoji: '🌱',
    description: 'Manicures, cuticle care, nail health',
    category: 'nail_tech',
    professions: ['nail_tech'],
  },
  {
    id: 'dip_powder',
    label: 'Dip Powder',
    emoji: '✨',
    description: 'SNS, dip powder application and removal',
    category: 'nail_tech',
    professions: ['nail_tech'],
  },
  {
    id: 'pedicures',
    label: 'Pedicures',
    emoji: '🦶',
    description: 'Spa pedicures, gel pedicures, callus care',
    category: 'nail_tech',
    professions: ['nail_tech'],
  },
  {
    id: 'nail_extensions',
    label: 'Nail Extensions',
    emoji: '💍',
    description: 'Forms, tips, length extensions',
    category: 'nail_tech',
    professions: ['nail_tech'],
  },

  // Lash Tech Specialties (8)
  {
    id: 'classic_lashes',
    label: 'Classic Lashes',
    emoji: '👁️',
    description: 'One extension per natural lash, natural look',
    category: 'lash_tech',
    professions: ['lash_tech'],
  },
  {
    id: 'volume_lashes',
    label: 'Volume Lashes',
    emoji: '🌟',
    description: 'Fan lashes for fullness and drama',
    category: 'lash_tech',
    professions: ['lash_tech'],
  },
  {
    id: 'hybrid_lashes',
    label: 'Hybrid Lashes',
    emoji: '🔀',
    description: 'Mix of classic and volume',
    category: 'lash_tech',
    professions: ['lash_tech'],
  },
  {
    id: 'mega_volume',
    label: 'Mega Volume',
    emoji: '💥',
    description: 'Ultra-full, dramatic lash sets',
    category: 'lash_tech',
    professions: ['lash_tech'],
  },
  {
    id: 'lash_lifts_tints',
    label: 'Lash Lifts & Tints',
    emoji: '✨',
    description: 'Natural lash lift and tint service',
    category: 'lash_tech',
    professions: ['lash_tech'],
  },
  {
    id: 'lash_extensions',
    label: 'Lash Extensions',
    emoji: '💫',
    description: 'Full extension sets, various styles',
    category: 'lash_tech',
    professions: ['lash_tech'],
  },
  {
    id: 'lash_removal',
    label: 'Lash Removal',
    emoji: '🧹',
    description: 'Safe removal of existing extensions',
    category: 'lash_tech',
    professions: ['lash_tech'],
  },
  {
    id: 'bottom_lashes',
    label: 'Bottom Lashes',
    emoji: '👇',
    description: 'Lower lash extension application',
    category: 'lash_tech',
    professions: ['lash_tech'],
  },

  // Makeup Artist Specialties (8)
  {
    id: 'bridal_makeup',
    label: 'Bridal Makeup',
    emoji: '💍',
    description: 'Wedding day glam, trial runs, bridal parties',
    category: 'makeup_artist',
    professions: ['makeup_artist'],
  },
  {
    id: 'editorial_fashion',
    label: 'Editorial & Fashion',
    emoji: '📸',
    description: 'Runway, print, fashion shoot makeup',
    category: 'makeup_artist',
    professions: ['makeup_artist'],
  },
  {
    id: 'glam_evening',
    label: 'Glam & Evening Looks',
    emoji: '💄',
    description: 'Full glam, night out, event makeup',
    category: 'makeup_artist',
    professions: ['makeup_artist'],
  },
  {
    id: 'natural_everyday',
    label: 'Natural & Everyday',
    emoji: '🌸',
    description: 'No-makeup makeup, everyday looks',
    category: 'makeup_artist',
    professions: ['makeup_artist'],
  },
  {
    id: 'sfx',
    label: 'Special Effects (SFX)',
    emoji: '🎭',
    description: 'Wounds, prosthetics, horror, theatrical',
    category: 'makeup_artist',
    professions: ['makeup_artist'],
  },
  {
    id: 'airbrush_makeup',
    label: 'Airbrush Makeup',
    emoji: '💨',
    description: 'Airbrush application for flawless finish',
    category: 'makeup_artist',
    professions: ['makeup_artist'],
  },
  {
    id: 'contouring_specialist',
    label: 'Contouring Specialist',
    emoji: '🔺',
    description: 'Sculpting, contouring, highlighting techniques',
    category: 'makeup_artist',
    professions: ['makeup_artist'],
  },
  {
    id: 'melanin_specialist',
    label: 'Melanin Skin Specialist',
    emoji: '🤎',
    description: 'Expertise in dark skin tones, undertones, coverage',
    category: 'makeup_artist',
    professions: ['makeup_artist'],
  },

  // Accessibility Badges (6) — all professions
  {
    id: 'autism_friendly',
    label: 'Autism-Friendly',
    emoji: '🧩',
    description: 'Sensory accommodations, quiet environment, extended time',
    category: 'accessibility',
  },
  {
    id: 'wheelchair_accessible',
    label: 'Wheelchair Accessible',
    emoji: '♿',
    description: 'Shop and chair fully accommodate wheelchair users',
    category: 'accessibility',
  },
  {
    id: 'mobile_home_visits',
    label: 'Mobile / Home Visits',
    emoji: '🏠',
    description: 'Professional comes to client\'s location',
    category: 'accessibility',
  },
  {
    id: 'quiet_environment',
    label: 'Quiet Environment',
    emoji: '🔇',
    description: 'Low noise, no loud music, calm atmosphere',
    category: 'accessibility',
  },
  {
    id: 'senior_friendly',
    label: 'Senior-Friendly',
    emoji: '👴',
    description: 'Patient with elderly clients, slower pace',
    category: 'accessibility',
  },
  {
    id: 'multilingual',
    label: 'Multilingual',
    emoji: '🌐',
    description: 'Serves clients in languages beyond English',
    category: 'accessibility',
  },

  // Client Experience Badges (6) — all professions
  {
    id: 'kids_specialist',
    label: 'Kids Specialist',
    emoji: '👶',
    description: 'Patient with children, good with first-timers',
    category: 'client_experience',
  },
  {
    id: 'accepts_walk_ins',
    label: 'Accepts Walk-Ins',
    emoji: '🚶',
    description: 'Takes clients without appointments when available',
    category: 'client_experience',
  },
  {
    id: 'late_night_hours',
    label: 'Late Night Hours',
    emoji: '🌙',
    description: 'Available after 7pm for evening appointments',
    category: 'client_experience',
  },
  {
    id: 'same_day_available',
    label: 'Same-Day Available',
    emoji: '📅',
    description: 'Regularly has same-day booking slots open',
    category: 'client_experience',
  },
  {
    id: 'competition_winner',
    label: 'Competition Winner',
    emoji: '🏆',
    description: 'Has placed in a recognized industry competition',
    category: 'client_experience',
  },
  {
    id: 'industry_educator',
    label: 'Industry Educator',
    emoji: '🎓',
    description: 'Licensed to teach or mentors other professionals',
    category: 'client_experience',
  },

  // Shop Vibe Badges (6) — all professions
  {
    id: 'faith_based',
    label: 'Faith-Based Space',
    emoji: '🙏',
    description: 'Christian, Muslim, or other faith-centered atmosphere',
    category: 'shop_vibe',
  },
  {
    id: 'black_owned',
    label: 'Black-Owned',
    emoji: '👨🏿',
    description: 'Black-owned business',
    category: 'shop_vibe',
  },
  {
    id: 'woman_owned',
    label: 'Woman-Owned',
    emoji: '👩',
    description: 'Woman-owned business',
    category: 'shop_vibe',
  },
  {
    id: 'lgbtq_friendly',
    label: 'LGBTQ+ Friendly',
    emoji: '🏳️‍🌈',
    description: 'Safe and welcoming space for LGBTQ+ clients',
    category: 'shop_vibe',
  },
  {
    id: 'no_talk_zone',
    label: 'No-Talk Zone',
    emoji: '🤫',
    description: 'Respects clients who prefer no conversation',
    category: 'shop_vibe',
  },
  {
    id: 'gamer_friendly',
    label: 'Gamer-Friendly',
    emoji: '🎮',
    description: 'Screens in shop, gaming culture vibe',
    category: 'shop_vibe',
  },
];

// ─── Badge Lookup Map ─────────────────────────────────────────────────────────

export const BADGE_MAP: Record<BadgeId, BadgeDefinition> = ALL_BADGES.reduce(
  (acc, badge) => {
    acc[badge.id] = badge;
    return acc;
  },
  {} as Record<BadgeId, BadgeDefinition>,
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getBadge(id: BadgeId): BadgeDefinition | undefined {
  return BADGE_MAP[id];
}

/** Returns self-select badges visible for a given set of professions */
export function getBadgesForProfessions(professions: Profession[]): BadgeDefinition[] {
  return ALL_BADGES.filter((b) => {
    if (b.isPlatformAssigned) return false;
    if (!b.professions) return true; // applies to all
    return b.professions.some((p) => professions.includes(p));
  });
}

/** Returns only the 6 platform-assigned badge definitions */
export const PLATFORM_BADGES = ALL_BADGES.filter((b) => b.isPlatformAssigned);

/** Returns only self-select badge definitions (no platform badges) */
export const SELF_SELECT_BADGES = ALL_BADGES.filter((b) => !b.isPlatformAssigned);

export const MAX_SELF_SELECT_BADGES = 6;

/** Check if a professional has reached the self-select badge cap */
export function atBadgeCap(selected: SelfSelectBadgeId[]): boolean {
  return selected.length >= MAX_SELF_SELECT_BADGES;
}

/** Grouped categories for the badge picker UI */
export const BADGE_CATEGORY_LABELS: Record<string, string> = {
  barber: 'Barber Specialties',
  hair_stylist: 'Hair Stylist Specialties',
  nail_tech: 'Nail Tech Specialties',
  lash_tech: 'Lash Tech Specialties',
  makeup_artist: 'Makeup Artist Specialties',
  accessibility: 'Accessibility',
  client_experience: 'Client Experience',
  shop_vibe: 'Shop Vibe',
};

export const PROFESSION_LABELS: Record<string, string> = {
  barber: 'Barber',
  hair_stylist: 'Hair Stylist',
  nail_tech: 'Nail Tech',
  lash_tech: 'Lash Tech',
  makeup_artist: 'Makeup Artist',
};

export const PROFESSION_EMOJIS: Record<string, string> = {
  barber: '✂️',
  hair_stylist: '💇',
  nail_tech: '💅',
  lash_tech: '👁️',
  makeup_artist: '💄',
};

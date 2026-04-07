// BarberFlow — Design System Colors
export const colors = {
  // Primary — Rich Gold
  primary: '#C9A227',
  primaryDark: '#A68521',
  primaryLight: '#E5C76B',
  primaryMuted: 'rgba(201, 162, 39, 0.15)',

  // Secondary — Deep Charcoal
  secondary: '#1A1A1A',
  secondaryLight: '#2D2D2D',

  // Accent — Warm Bronze
  accent: '#CD7F32',
  accentLight: '#D4A574',

  // Backgrounds
  background: '#0D0D0D',
  backgroundLight: '#1A1A1A',
  surface: '#242424',
  surfaceLight: '#2F2F2F',
  surfaceElevated: '#383838',

  // Text
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#666666',
  textInverse: '#0D0D0D',

  // Status
  success: '#4CAF50',
  successMuted: 'rgba(76, 175, 80, 0.15)',
  warning: '#FFC107',
  warningMuted: 'rgba(255, 193, 7, 0.15)',
  error: '#F44336',
  errorMuted: 'rgba(244, 67, 54, 0.15)',
  info: '#2196F3',
  infoMuted: 'rgba(33, 150, 243, 0.15)',

  // Appointment Status Colors
  statusPending: '#FFC107',
  statusConfirmed: '#4CAF50',
  statusCompleted: '#2196F3',
  statusCancelled: '#666666',
  statusNoShow: '#F44336',

  // Borders
  border: '#333333',
  borderLight: '#444444',
  borderFocus: '#C9A227',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',

  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Tab bar
  tabActive: '#C9A227',
  tabInactive: '#666666',
};

export type ColorKey = keyof typeof colors;

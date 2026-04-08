import { PlatformConfig, Quarter } from '../types';

// ─── Default rates (matches platform_config/default) ─────────────────────────

export const DEFAULT_TAX_WITHHOLD_RATE = 0.165;
export const DEFAULT_PLATFORM_FEE_RATE = 0.03;
export const DEFAULT_STRIPE_FEE_RATE = 0.029;
export const DEFAULT_STRIPE_FEE_FIXED = 30; // cents
export const SE_TAX_RATE = 0.153; // IRS self-employment tax
export const MIN_WITHHOLD_RATE = 0.10;
export const MAX_WITHHOLD_RATE = 0.35;

// ─── Fee Breakdown ────────────────────────────────────────────────────────────

export interface FeeBreakdown {
  grossAmount: number; // cents — what client pays
  stripeFee: number; // cents
  platformFee: number; // cents
  taxAllocated: number; // cents — TaxFlow™ withholding (0 if not active)
  tipAmount: number; // cents
  barberPayout: number; // cents
}

export function calculateFees(
  grossAmountCents: number,
  tipAmountCents: number,
  taxflowActive: boolean,
  withholdRate: number = DEFAULT_TAX_WITHHOLD_RATE,
  config?: Partial<PlatformConfig>,
): FeeBreakdown {
  const stripeRate = config?.stripeFeeRate ?? DEFAULT_STRIPE_FEE_RATE;
  const stripeFixed = config?.stripeFeeFixed ?? DEFAULT_STRIPE_FEE_FIXED;
  const platformRate = config?.platformFeeRate ?? DEFAULT_PLATFORM_FEE_RATE;

  const stripeFee = Math.round(grossAmountCents * stripeRate + stripeFixed);
  const platformFee = Math.round(grossAmountCents * platformRate);
  const taxAllocated = taxflowActive
    ? Math.round(grossAmountCents * withholdRate)
    : 0;

  const barberPayout =
    grossAmountCents - stripeFee - platformFee - taxAllocated + tipAmountCents;

  return {
    grossAmount: grossAmountCents,
    stripeFee,
    platformFee,
    taxAllocated,
    tipAmount: tipAmountCents,
    barberPayout,
  };
}

// ─── TaxFlow™ Screen Calculations ────────────────────────────────────────────

export interface TaxEstimate {
  monthlyIncome: number; // dollars
  annualIncome: number; // dollars
  estimatedSeTax: number; // dollars — annual SE tax owed
  monthlySetAside: number; // dollars — what they'd need manually
  weeklySetAside: number; // dollars — what they'd need manually
  taxflowMonthly: number; // dollars — TaxFlow™ cost
}

export function estimateTaxBurden(monthlyIncomeDollars: number): TaxEstimate {
  const annualIncome = monthlyIncomeDollars * 12;
  const estimatedSeTax = annualIncome * SE_TAX_RATE;
  const monthlySetAside = estimatedSeTax / 12;
  const weeklySetAside = estimatedSeTax / 52;

  return {
    monthlyIncome: monthlyIncomeDollars,
    annualIncome,
    estimatedSeTax,
    monthlySetAside,
    weeklySetAside,
    taxflowMonthly: 29.99,
  };
}

// ─── Quarter Helpers ──────────────────────────────────────────────────────────

export function getCurrentQuarter(): Quarter {
  const month = new Date().getMonth() + 1; // 1-12
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
}

export function getQuarterString(): string {
  return `${new Date().getFullYear()}-${getCurrentQuarter()}`;
}

export function getQuarterDeadline(quarter: Quarter): string {
  const deadlines: Record<Quarter, string> = {
    Q1: 'January 15',
    Q2: 'April 15',
    Q3: 'June 15',
    Q4: 'September 15',
  };
  return deadlines[quarter];
}

export function getDaysUntilDeadline(quarter: Quarter): number {
  const year = new Date().getFullYear();
  const deadlineDates: Record<Quarter, [number, number]> = {
    Q1: [0, 15], // Jan 15
    Q2: [3, 15], // Apr 15
    Q3: [5, 15], // Jun 15
    Q4: [8, 15], // Sep 15
  };
  const [month, day] = deadlineDates[quarter];
  const deadline = new Date(year, month, day);
  const now = new Date();
  const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

// ─── Currency Helpers ─────────────────────────────────────────────────────────

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDollars(dollars: number): string {
  return `$${dollars.toFixed(2)}`;
}

export function formatDollarsShort(dollars: number): string {
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`;
  }
  return `$${Math.round(dollars)}`;
}

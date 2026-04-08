import { create } from 'zustand';
import { BookingFlowState, Service, Barber } from '../types';

type BookingStore = BookingFlowState & {
  setBarber: (barber: Barber) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  setClientNote: (note: string) => void;
  setInspirationPhoto: (url: string | null) => void;
  setPromoCode: (code: string) => void;
  setPromoDiscount: (discount: number) => void;
  setStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  resetBooking: () => void;
};

const initialState: BookingFlowState = {
  barberId: '',
  barber: null,
  selectedService: null,
  selectedDate: null,
  selectedTime: null,
  clientNote: '',
  inspirationPhotoURL: null,
  promoCode: '',
  promoDiscount: 0,
  step: 1,
};

export const useBookingStore = create<BookingStore>((set) => ({
  ...initialState,

  setBarber: (barber) => set({ barber, barberId: barber.uid }),
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedTime: null }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setClientNote: (note) => set({ clientNote: note }),
  setInspirationPhoto: (url) => set({ inspirationPhotoURL: url }),
  setPromoCode: (code) => set({ promoCode: code }),
  setPromoDiscount: (discount) => set({ promoDiscount: discount }),
  setStep: (step) => set({ step }),
  resetBooking: () => set(initialState),
}));

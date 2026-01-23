import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Booking, Service, TimeSlot, BookingStatus } from '../types';
import { useAuth } from './AuthContext';

interface BookingContextType {
  selectedService: Service | null;
  selectedDate: string | null;
  selectedTime: string | null;
  setSelectedService: (service: Service | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  createBooking: (notes?: string) => Promise<string>;
  getAvailableSlots: (date: string) => Promise<TimeSlot[]>;
  getUserBookings: () => Promise<Booking[]>;
  cancelBooking: (bookingId: string) => Promise<void>;
  loading: boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createBooking = async (notes?: string): Promise<string> => {
    if (!user || !userProfile || !selectedService || !selectedDate || !selectedTime) {
      throw new Error('Missing booking information');
    }

    setLoading(true);
    try {
      // Calculate end time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(hours, minutes + selectedService.duration);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      const booking: Omit<Booking, 'id'> = {
        clientId: user.uid,
        clientName: userProfile.name,
        clientPhone: (userProfile as any).phone || '',
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceDuration: selectedService.duration,
        date: selectedDate,
        startTime: selectedTime,
        endTime,
        status: 'pending',
        notes,
        paymentStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), {
        ...booking,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Reset selections
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);

      return docRef.id;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSlots = async (date: string): Promise<TimeSlot[]> => {
    // Get existing bookings for the date
    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('date', '==', date),
      where('status', 'in', ['pending', 'confirmed'])
    );
    
    const snapshot = await getDocs(bookingsQuery);
    const bookedTimes = snapshot.docs.map(doc => doc.data().startTime);

    // Generate time slots (9 AM to 7 PM, 30-minute intervals)
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 19; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        slots.push({
          time,
          available: !bookedTimes.includes(time),
        });
      }
    }

    return slots;
  };

  const getUserBookings = async (): Promise<Booking[]> => {
    if (!user) return [];

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('clientId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(bookingsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Booking[];
  };

  const cancelBooking = async (bookingId: string): Promise<void> => {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'cancelled' as BookingStatus,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <BookingContext.Provider value={{
      selectedService,
      selectedDate,
      selectedTime,
      setSelectedService,
      setSelectedDate,
      setSelectedTime,
      createBooking,
      getAvailableSlots,
      getUserBookings,
      cancelBooking,
      loading,
    }}>
      {children}
    </BookingContext.Provider>
  );
};


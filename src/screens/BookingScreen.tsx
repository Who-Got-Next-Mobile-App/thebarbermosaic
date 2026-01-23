import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { useBooking } from '../context/BookingContext';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { formatPrice, formatDuration } from '../utils/services';
import { TimeSlot } from '../types';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

interface BookingScreenProps {
  navigation: any;
}

export const BookingScreen: React.FC<BookingScreenProps> = ({ navigation }) => {
  const {
    selectedService,
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    createBooking,
    getAvailableSlots,
    loading,
  } = useBooking();

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [notes, setNotes] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const loadTimeSlots = async (date: string) => {
    setLoadingSlots(true);
    try {
      const slots = await getAvailableSlots(date);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error loading time slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    setSelectedTime(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }

    try {
      const bookingId = await createBooking(notes);
      Alert.alert(
        'Booking Confirmed!',
        `Your appointment for ${selectedService.name} has been booked.`,
        [
          {
            text: 'View Bookings',
            onPress: () => navigation.navigate('BookingsList'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message || 'Please try again');
    }
  };

  if (!selectedService) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Book Appointment</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Please select a service first</Text>
          <TouchableOpacity
            style={styles.selectServiceButton}
            onPress={() => navigation.navigate('Services')}
          >
            <Text style={styles.selectServiceButtonText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Selected Service */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{selectedService.name}</Text>
            <View style={styles.serviceDetails}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.detailText}>{formatDuration(selectedService.duration)}</Text>
            </View>
          </View>
          <Text style={styles.servicePrice}>{formatPrice(selectedService.price)}</Text>
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <Calendar
            minDate={today}
            maxDate={maxDate}
            onDayPress={handleDayPress}
            markedDates={{
              [selectedDate || '']: {
                selected: true,
                selectedColor: colors.primary,
              },
            }}
            theme={{
              backgroundColor: colors.surface,
              calendarBackground: colors.surface,
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.black,
              todayTextColor: colors.primary,
              dayTextColor: colors.text,
              textDisabledColor: colors.textMuted,
              dotColor: colors.primary,
              arrowColor: colors.primary,
              monthTextColor: colors.text,
              textDayFontWeight: '500',
              textMonthFontWeight: '700',
              textDayHeaderFontWeight: '600',
            }}
            style={styles.calendar}
          />
        </View>

        {/* Time Slots */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            {loadingSlots ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : (
              <View style={styles.timeSlotsGrid}>
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.time}
                    style={[
                      styles.timeSlot,
                      !slot.available && styles.timeSlotUnavailable,
                      selectedTime === slot.time && styles.timeSlotSelected,
                    ]}
                    onPress={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        !slot.available && styles.timeSlotTextUnavailable,
                        selectedTime === slot.time && styles.timeSlotTextSelected,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any special requests?"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Confirm Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedDate || !selectedTime) && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmBooking}
            disabled={!selectedDate || !selectedTime || loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  selectServiceButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  selectServiceButtonText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  servicePrice: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  calendar: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  loader: {
    padding: spacing.xl,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  timeSlot: {
    width: '23%',
    marginRight: '2%',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeSlotUnavailable: {
    backgroundColor: colors.backgroundLight,
    borderColor: colors.backgroundLight,
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  timeSlotTextUnavailable: {
    color: colors.textMuted,
  },
  timeSlotTextSelected: {
    color: colors.black,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bottomSection: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.black,
    letterSpacing: 1,
  },
});


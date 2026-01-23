import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useBooking } from '../context/BookingContext';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { Booking, BookingStatus } from '../types';
import { format, parseISO, isPast, isToday } from 'date-fns';

interface BookingsListScreenProps {
  navigation: any;
}

export const BookingsListScreen: React.FC<BookingsListScreenProps> = ({ navigation }) => {
  const { getUserBookings, cancelBooking } = useBooking();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [])
  );

  const loadBookings = async () => {
    try {
      const data = await getUserBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your ${booking.serviceName} appointment?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(booking.id);
              await loadBookings();
              Alert.alert('Cancelled', 'Your booking has been cancelled.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'completed':
        return colors.info;
      case 'cancelled':
        return colors.error;
      case 'no_show':
        return colors.textMuted;
      default:
        return colors.textSecondary;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = parseISO(booking.date);
    const isPastBooking = isPast(bookingDate) && !isToday(bookingDate);
    
    if (filter === 'upcoming') {
      return !isPastBooking && booking.status !== 'cancelled' && booking.status !== 'completed';
    } else {
      return isPastBooking || booking.status === 'completed' || booking.status === 'cancelled';
    }
  });

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const bookingDate = parseISO(item.date);
    const canCancel = !isPast(bookingDate) && 
                      item.status !== 'cancelled' && 
                      item.status !== 'completed';

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateDay}>{format(bookingDate, 'd')}</Text>
            <Text style={styles.dateMonth}>{format(bookingDate, 'MMM')}</Text>
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.serviceName}>{item.serviceName}</Text>
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.timeText}>
                {item.startTime} - {item.endTime}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.bookingFooter}>
          <Text style={styles.priceText}>${item.servicePrice.toFixed(2)}</Text>
          {canCancel && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
        <Text style={styles.title}>My Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'upcoming' && styles.filterTabActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'past' && styles.filterTabActive]}
          onPress={() => setFilter('past')}
        >
          <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No {filter} bookings</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'upcoming' 
                ? 'Book your next appointment now!'
                : 'Your past appointments will appear here.'
              }
            </Text>
            {filter === 'upcoming' && (
              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => navigation.navigate('Services')}
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateContainer: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    minWidth: 50,
  },
  dateDay: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
  },
  dateMonth: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  serviceName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.black,
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  priceText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
  },
  cancelButtonText: {
    fontSize: fontSize.sm,
    color: colors.error,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  bookButtonText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: fontSize.md,
  },
});


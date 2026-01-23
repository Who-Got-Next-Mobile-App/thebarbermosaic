import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { Booking } from '../types';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { userProfile } = useAuth();
  const { getUserBookings } = useBooking();
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    loadUpcomingBooking();
    if (userProfile && 'loyaltyPoints' in userProfile) {
      setLoyaltyPoints((userProfile as any).loyaltyPoints || 0);
    }
  }, [userProfile]);

  const loadUpcomingBooking = async () => {
    try {
      const bookings = await getUserBookings();
      const upcoming = bookings.find(
        b => b.status === 'confirmed' || b.status === 'pending'
      );
      setUpcomingBooking(upcoming || null);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const formatBookingDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{userProfile?.name?.split(' ')[0] || 'Client'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Quick Book Button */}
      <TouchableOpacity
        style={styles.quickBookButton}
        onPress={() => navigation.navigate('Services')}
      >
        <View style={styles.quickBookContent}>
          <Ionicons name="cut" size={32} color={colors.black} />
          <View style={styles.quickBookText}>
            <Text style={styles.quickBookTitle}>Book Appointment</Text>
            <Text style={styles.quickBookSubtitle}>Find an available slot</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color={colors.black} />
      </TouchableOpacity>

      {/* Upcoming Appointment */}
      {upcomingBooking && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
          <TouchableOpacity 
            style={styles.appointmentCard}
            onPress={() => navigation.navigate('BookingsList')}
          >
            <View style={styles.appointmentHeader}>
              <View style={styles.appointmentDate}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
                <Text style={styles.appointmentDateText}>
                  {formatBookingDate(upcomingBooking.date)}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                upcomingBooking.status === 'confirmed' && styles.statusConfirmed,
              ]}>
                <Text style={styles.statusText}>
                  {upcomingBooking.status.charAt(0).toUpperCase() + upcomingBooking.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.serviceName}>{upcomingBooking.serviceName}</Text>
            <View style={styles.appointmentTime}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.timeText}>
                {upcomingBooking.startTime} - {upcomingBooking.endTime}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Loyalty Points */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loyalty Rewards</Text>
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <Ionicons name="star" size={24} color={colors.primary} />
            <Text style={styles.loyaltyPoints}>{loyaltyPoints}</Text>
            <Text style={styles.loyaltyLabel}>Points</Text>
          </View>
          <View style={styles.loyaltyProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((loyaltyPoints / 100) * 100, 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {100 - loyaltyPoints} points until free service
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Services')}
          >
            <Ionicons name="list" size={28} color={colors.primary} />
            <Text style={styles.actionText}>Services</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('BookingsList')}
          >
            <Ionicons name="calendar-outline" size={28} color={colors.primary} />
            <Text style={styles.actionText}>My Bookings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Reviews')}
          >
            <Ionicons name="star-outline" size={28} color={colors.primary} />
            <Text style={styles.actionText}>Reviews</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="settings-outline" size={28} color={colors.primary} />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Need Help?</Text>
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          <Text style={styles.contactButtonText}>Message Barber</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
  },
  profileButton: {
    padding: spacing.xs,
  },
  quickBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  quickBookContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickBookText: {
    marginLeft: spacing.md,
  },
  quickBookTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.black,
  },
  quickBookSubtitle: {
    fontSize: fontSize.sm,
    color: colors.black,
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  appointmentCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appointmentDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentDateText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.warning,
  },
  statusConfirmed: {
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.black,
  },
  serviceName: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  loyaltyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loyaltyPoints: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  loyaltyLabel: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  loyaltyProgress: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  contactSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.xxl,
  },
  contactTitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  contactButtonText: {
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
});


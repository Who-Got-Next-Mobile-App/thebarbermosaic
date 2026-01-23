import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '../theme';
import { Client } from '../types';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { userProfile, signOut } = useAuth();
  const client = userProfile as Client;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress,
    showArrow = true,
    danger = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={danger ? colors.error : colors.primary} 
        />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {client?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color={colors.black} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{client?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{client?.email || ''}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{client?.totalVisits || 0}</Text>
          <Text style={styles.statLabel}>Visits</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{client?.loyaltyPoints || 0}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {client?.lastVisit ? 'Recent' : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Last Visit</Text>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem
          icon="person-outline"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => Alert.alert('Coming Soon', 'Edit profile feature coming soon!')}
        />
        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          subtitle="Manage your notification preferences"
          onPress={() => Alert.alert('Coming Soon', 'Notifications settings coming soon!')}
        />
        <MenuItem
          icon="card-outline"
          title="Payment Methods"
          subtitle="Manage your saved cards"
          onPress={() => Alert.alert('Coming Soon', 'Payment methods coming soon!')}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <MenuItem
          icon="cut-outline"
          title="Preferred Services"
          subtitle="Set your favorite services"
          onPress={() => Alert.alert('Coming Soon', 'Preferred services coming soon!')}
        />
        <MenuItem
          icon="gift-outline"
          title="Loyalty Rewards"
          subtitle="View available rewards"
          onPress={() => Alert.alert('Coming Soon', 'Loyalty rewards coming soon!')}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Support</Text>
        <MenuItem
          icon="help-circle-outline"
          title="Help Center"
          subtitle="Get answers to common questions"
          onPress={() => Alert.alert('Help', 'Contact support at support@thebarbermosaic.com')}
        />
        <MenuItem
          icon="chatbubble-outline"
          title="Contact Barber"
          subtitle="Send a message"
          onPress={() => Alert.alert('Coming Soon', 'Messaging feature coming soon!')}
        />
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon="log-out-outline"
          title="Sign Out"
          onPress={handleSignOut}
          showArrow={false}
          danger
        />
      </View>

      {/* Version */}
      <Text style={styles.version}>Version 1.0.0</Text>
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.black,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconDanger: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  menuTitleDanger: {
    color: colors.error,
  },
  menuSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.textMuted,
    paddingVertical: spacing.xl,
  },
});


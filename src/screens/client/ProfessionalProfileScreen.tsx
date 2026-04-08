import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { doc, getDoc, getDocs, collection, updateDoc, arrayUnion, arrayRemove, orderBy, query, limit } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import {
  ClientStackParamList,
  Barber,
  Service,
  PortfolioPhoto,
  Review,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/config';
import { BadgeChip } from '../../components';
import { ServiceCard } from '../../components';
import { StarRatingDisplay } from '../../components';
import { PROFESSION_LABELS } from '../../utils/badges';
import { formatCents } from '../../utils/taxCalc';
import { colors, fontSize, spacing, borderRadius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ClientStackParamList, 'ProfessionalProfile'>;
  route: RouteProp<ClientStackParamList, 'ProfessionalProfile'>;
};

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - spacing.lg * 2 - spacing.sm * 2) / 3;

export const ProfessionalProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { barberId } = route.params;
  const { clientProfile, updateClientProfile } = useAuth();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioPhoto[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    setIsFavorited(clientProfile?.favoriteBarbers?.includes(barberId) ?? false);
    getDoc(doc(db, 'barbers', barberId)).then((snap) => {
      if (snap.exists()) setBarber({ uid: snap.id, ...snap.data() } as Barber);
    });
    getDocs(query(collection(db, 'barbers', barberId, 'services'), orderBy('createdAt', 'asc'))).then((snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service)).filter((s) => s.isActive));
    });
    getDocs(query(collection(db, 'barbers', barberId, 'portfolio'), orderBy('order', 'asc'), limit(9))).then((snap) => {
      setPortfolio(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PortfolioPhoto)));
    });
    getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(5))).then((snap) => {
      setReviews(snap.docs.filter((d) => d.data().barberId === barberId).map((d) => ({ id: d.id, ...d.data() } as Review)));
    });
  }, [barberId, clientProfile?.favoriteBarbers]);

  const toggleFavorite = async () => {
    if (!clientProfile) return;
    try {
      const newState = !isFavorited;
      setIsFavorited(newState);
      await updateClientProfile({
        favoriteBarbers: newState
          ? [...(clientProfile.favoriteBarbers ?? []), barberId]
          : (clientProfile.favoriteBarbers ?? []).filter((id) => id !== barberId),
      });
    } catch {}
  };

  const handleShare = async () => {
    if (!barber) return;
    await Share.share({
      message: `Check out ${barber.displayName} on BarberFlow! barberflow.com/book/${barber.bookingSlug}`,
    });
  };

  if (!barber) return <SafeAreaView style={styles.container} />;

  const professionLabels = barber.professions.map((p) => PROFESSION_LABELS[p]).join(' · ');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          {barber.photoURL ? (
            <Image source={{ uri: barber.photoURL }} style={styles.coverPhoto} />
          ) : (
            <View style={[styles.coverPhoto, styles.coverPlaceholder]}>
              <Ionicons name="person" size={48} color={colors.textMuted} />
            </View>
          )}

          {/* Nav buttons */}
          <View style={styles.navButtons}>
            <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.navRight}>
              <TouchableOpacity style={styles.navBtn} onPress={toggleFavorite}>
                <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={20} color={isFavorited ? colors.error : colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{barber.displayName}</Text>
            {barber.acceptsWalkIns && (
              <View style={styles.walkInBadge}>
                <Text style={styles.walkInText}>Walk-ins</Text>
              </View>
            )}
          </View>
          <Text style={styles.professions}>{professionLabels}</Text>
          <StarRatingDisplay rating={barber.rating} reviewCount={barber.reviewCount} size={16} />
          {barber.city && <Text style={styles.location}>📍 {barber.city}, {barber.state}</Text>}

          {/* Badges */}
          {(barber.selectedBadges.length > 0 || barber.platformBadges.length > 0) && (
            <View style={styles.badgeSection}>
              <View style={styles.badgeRow}>
                {barber.platformBadges.map((id) => <BadgeChip key={id} badgeId={id} platform />)}
                {barber.selectedBadges.map((id) => <BadgeChip key={id} badgeId={id} selected />)}
              </View>
            </View>
          )}

          {barber.bio ? <Text style={styles.bio}>{barber.bio}</Text> : null}
        </View>

        {/* Book Now sticky */}
        <View style={styles.bookBar}>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => navigation.navigate('BookingFlow', { barberId: barber.uid })}
          >
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
            <View style={styles.portfolioGrid}>
              {portfolio.map((p) => (
                <Image key={p.id} source={{ uri: p.imageURL }} style={styles.portfolioPhoto} />
              ))}
            </View>
          </View>
        )}

        {/* Services */}
        {services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            {services.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                onPress={() => navigation.navigate('BookingFlow', { barberId: barber.uid })}
              />
            ))}
          </View>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <StarRatingDisplay rating={r.rating} size={14} />
                  <Text style={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                </View>
                {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
                {r.barberReply ? (
                  <View style={styles.replyCard}>
                    <Text style={styles.replyLabel}>Response from {barber.displayName}</Text>
                    <Text style={styles.replyText}>{r.barberReply}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { position: 'relative' },
  coverPhoto: { width: '100%', height: 280, backgroundColor: colors.surfaceLight },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  navButtons: { position: 'absolute', top: spacing.lg, left: spacing.lg, right: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navRight: { flexDirection: 'row', gap: spacing.sm },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  profileInfo: { padding: spacing.lg, gap: spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  displayName: { color: colors.text, fontSize: 24, fontWeight: '800', flex: 1 },
  walkInBadge: { backgroundColor: colors.success, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  walkInText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  professions: { color: colors.textSecondary, fontSize: fontSize.md },
  location: { color: colors.textMuted, fontSize: fontSize.sm },
  badgeSection: { marginTop: spacing.xs },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  bio: { color: colors.textSecondary, fontSize: fontSize.md, lineHeight: 22 },
  bookBar: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  bookBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.full, paddingVertical: spacing.md, alignItems: 'center' },
  bookBtnText: { color: colors.black, fontSize: fontSize.lg, fontWeight: '700' },
  section: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  sectionTitle: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  portfolioPhoto: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: borderRadius.xs },
  reviewCard: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewDate: { color: colors.textMuted, fontSize: fontSize.xs },
  reviewComment: { color: colors.text, fontSize: fontSize.md, lineHeight: 20 },
  replyCard: { backgroundColor: colors.surfaceLight, borderRadius: borderRadius.sm, padding: spacing.sm, gap: 2 },
  replyLabel: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '600' },
  replyText: { color: colors.textSecondary, fontSize: fontSize.sm },
});

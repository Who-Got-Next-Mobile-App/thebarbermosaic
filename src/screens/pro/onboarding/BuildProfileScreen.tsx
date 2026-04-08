import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';
import { ProOnboardingParamList } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db, storage } from '../../../firebase/config';
import { Input, Button, ScreenHeader } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ProOnboardingParamList, 'BuildProfile'>;
};

export const BuildProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { barberProfile, updateBarberProfile, firebaseUser } = useAuth();
  const [displayName, setDisplayName] = useState(barberProfile?.displayName ?? '');
  const [bio, setBio] = useState(barberProfile?.bio ?? '');
  const [city, setCity] = useState(barberProfile?.city ?? '');
  const [state, setState] = useState(barberProfile?.state ?? '');
  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [photoURI, setPhotoURI] = useState(barberProfile?.photoURL ?? '');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-generate slug from display name
  useEffect(() => {
    if (displayName && !slug) {
      const auto = displayName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      setSlug(auto);
    }
  }, [displayName]);

  // Check slug availability after 600ms debounce
  useEffect(() => {
    if (!slug) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const q = query(collection(db, 'barbers'), where('bookingSlug', '==', slug));
        const snap = await getDocs(q);
        const taken = snap.docs.some(d => d.id !== firebaseUser?.uid);
        setSlugStatus(taken ? 'taken' : 'available');
      } catch {
        setSlugStatus('idle');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [slug, firebaseUser?.uid]);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setUploading(true);
      try {
        const resp = await fetch(uri);
        const blob = await resp.blob();
        const storageRef = ref(storage, `profiles/${firebaseUser?.uid}/photo.jpg`);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        setPhotoURI(url);
      } catch {
        Alert.alert('Upload failed', 'Could not upload photo. Try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleContinue = async () => {
    if (!displayName.trim()) { Alert.alert('Name required', 'Please enter your display name.'); return; }
    if (slugStatus === 'taken') { Alert.alert('Slug taken', 'That booking URL is taken. Please choose another.'); return; }
    setLoading(true);
    try {
      await updateBarberProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        city: city.trim(),
        state: state.trim(),
        bookingSlug: slug,
        photoURL: photoURI,
      });
      navigation.navigate('PickBadges');
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStudio = barberProfile?.profileType === 'studio';

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Build Your Profile" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.step}>Step 2 of 10</Text>

        {/* Photo upload */}
        <TouchableOpacity style={styles.photoArea} onPress={pickPhoto} activeOpacity={0.8}>
          {uploading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : photoURI ? (
            <Image source={{ uri: photoURI }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
              <Text style={styles.photoHint}>Add photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Input label="Display Name *" value={displayName} onChangeText={setDisplayName} placeholder="How clients see you" />
        <Input
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell clients about yourself (optional)"
          multiline
          numberOfLines={3}
          maxLength={140}
          characterCount={bio.length}
          maxCharacters={140}
          style={styles.bioInput}
        />
        <Input label="City *" value={city} onChangeText={setCity} placeholder="Atlanta" />
        <Input label="State *" value={state} onChangeText={setState} placeholder="GA" autoCapitalize="characters" maxLength={2} />

        {isStudio && (
          <Input label="Shop Name" value={shopName} onChangeText={setShopName} placeholder="Studio name" />
        )}

        {/* Booking slug */}
        <View style={styles.slugWrapper}>
          <Input
            label="Booking URL"
            value={slug}
            onChangeText={(v) => setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="your-name"
            autoCapitalize="none"
            rightIcon={
              slugStatus === 'available' ? 'checkmark-circle' :
              slugStatus === 'taken' ? 'close-circle' :
              slugStatus === 'checking' ? 'reload' : undefined
            }
          />
          <Text style={[styles.slugPreview, slugStatus === 'taken' && styles.slugTaken, slugStatus === 'available' && styles.slugAvailable]}>
            barberflow.com/book/{slug || '...'}
            {slugStatus === 'checking' && '  Checking...'}
            {slugStatus === 'available' && '  ✓ Available'}
            {slugStatus === 'taken' && '  ✗ Already taken'}
          </Text>
        </View>

        <Button label="Continue" onPress={handleContinue} loading={loading} disabled={loading || uploading || slugStatus === 'taken'} fullWidth style={styles.btn} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  step: { color: colors.textMuted, fontSize: fontSize.sm, marginBottom: spacing.md },
  photoArea: { alignSelf: 'center', marginBottom: spacing.xl },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  photoHint: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: 4 },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  slugWrapper: { marginBottom: spacing.md },
  slugPreview: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: -spacing.sm + 2 },
  slugAvailable: { color: colors.success },
  slugTaken: { color: colors.error },
  btn: { marginTop: spacing.md },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ClientOnboardingParamList } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { useDiscoveryStore } from '../../../store/discoveryStore';
import { Button } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

type Props = {
  navigation: NativeStackNavigationProp<ClientOnboardingParamList, 'EnableLocation'>;
};

export const EnableLocationScreen: React.FC<Props> = ({ navigation }) => {
  const { updateClientProfile } = useAuth();
  const { setUserLocation, setUserZip } = useDiscoveryStore();
  const [showZip, setShowZip] = useState(false);
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    try {
      // React Native Geolocation requires native module setup
      // Using a mock here — in production use expo-location or react-native-geolocation-service
      setUserLocation({ latitude: 33.749, longitude: -84.388 }); // Atlanta default
      await updateClientProfile({ locationEnabled: true });
      navigation.navigate('TurnOnNotifications');
    } catch {
      Alert.alert('Location unavailable', 'Could not get your location. Please enter your zip code.');
      setShowZip(true);
    } finally {
      setLoading(false);
    }
  };

  const submitZip = async () => {
    if (zip.length < 5) { Alert.alert('Invalid zip', 'Please enter a 5-digit zip code.'); return; }
    setLoading(true);
    try {
      setUserZip(zip);
      await updateClientProfile({ lastKnownZip: zip, locationEnabled: false });
      navigation.navigate('TurnOnNotifications');
    } catch {
      navigation.navigate('TurnOnNotifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBlock}>
          <Ionicons name="location" size={72} color={colors.primary} />
        </View>

        <Text style={styles.title}>Find professionals near you</Text>
        <Text style={styles.body}>
          We use your location to show you the closest available professionals. Your location is never shared with anyone.
        </Text>

        {!showZip ? (
          <>
            <Button
              label="Enable Location"
              onPress={requestLocation}
              loading={loading}
              fullWidth
              style={styles.mainBtn}
            />
            <TouchableOpacity onPress={() => setShowZip(true)} style={styles.zipLink}>
              <Text style={styles.zipLinkText}>Enter zip code instead</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.zipBlock}>
            <Text style={styles.zipLabel}>Enter your zip code</Text>
            <TextInput
              style={styles.zipInput}
              value={zip}
              onChangeText={(v) => setZip(v.replace(/\D/g, '').slice(0, 5))}
              keyboardType="number-pad"
              maxLength={5}
              placeholder="00000"
              placeholderTextColor={colors.textMuted}
            />
            <Button label="Continue" onPress={submitZip} loading={loading} fullWidth />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  iconBlock: { marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  body: { color: colors.textSecondary, fontSize: fontSize.md, textAlign: 'center', lineHeight: 24 },
  mainBtn: {},
  zipLink: { marginTop: spacing.md },
  zipLinkText: { color: colors.primary, fontSize: fontSize.md, textDecorationLine: 'underline' },
  zipBlock: { width: '100%', gap: spacing.md },
  zipLabel: { color: colors.textSecondary, fontSize: fontSize.md, fontWeight: '500' },
  zipInput: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontSize: 24, fontWeight: '700', textAlign: 'center', borderWidth: 1, borderColor: colors.border, letterSpacing: 8 },
});

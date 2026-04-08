import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';
import { ProStackParamList, PortfolioPhoto } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { db, storage } from '../../../firebase/config';
import { ScreenHeader } from '../../../components';
import { colors, fontSize, spacing, borderRadius } from '../../../theme';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - spacing.lg * 2 - spacing.sm * 2) / 3;
const MAX_PHOTOS = 30;

export const PortfolioScreen: React.FC = () => {
  const navigation = useNavigation();
  const { firebaseUser } = useAuth();
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    return onSnapshot(
      query(collection(db, 'barbers', firebaseUser.uid, 'portfolio'), orderBy('order', 'asc')),
      (snap) => setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PortfolioPhoto))),
    );
  }, [firebaseUser]);

  const pickAndUpload = async () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit reached', `You can upload up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (result.canceled) return;
    setUploading(true);
    try {
      for (const asset of result.assets.slice(0, MAX_PHOTOS - photos.length)) {
        const resp = await fetch(asset.uri);
        const blob = await resp.blob();
        const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const storageRef = ref(storage, `portfolios/${firebaseUser!.uid}/${filename}`);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        await addDoc(collection(db, 'barbers', firebaseUser!.uid, 'portfolio'), {
          imageURL: url,
          profession: 'barber',
          caption: '',
          order: photos.length,
          createdAt: serverTimestamp(),
        });
      }
    } catch {
      Alert.alert('Upload failed', 'Some photos could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = (photo: PortfolioPhoto) => {
    Alert.alert('Delete Photo?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'barbers', firebaseUser!.uid, 'portfolio', photo.id));
            // Also delete from Storage
            const storageRef = ref(storage, photo.imageURL);
            await deleteObject(storageRef).catch(() => {});
          } catch {}
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={`Portfolio (${photos.length}/${MAX_PHOTOS})`}
        onBack={() => navigation.goBack()}
        rightAction={{ icon: 'add', onPress: pickAndUpload }}
      />
      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.photoWrapper}
            onLongPress={() => deletePhoto(item)}
          >
            <Image source={{ uri: item.imageURL }} style={styles.photo} />
          </TouchableOpacity>
        )}
        ListFooterComponent={
          photos.length < MAX_PHOTOS ? (
            <TouchableOpacity style={styles.addTile} onPress={pickAndUpload}>
              {uploading ? (
                <Text style={styles.uploadingText}>Uploading...</Text>
              ) : (
                <>
                  <Ionicons name="camera-outline" size={24} color={colors.textMuted} />
                  <Text style={styles.addTileText}>Add Photos</Text>
                  <Text style={styles.addTileSub}>Long-press to delete</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="images-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No portfolio photos yet</Text>
            <Text style={styles.emptySub}>Tap + to upload your work</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  grid: { padding: spacing.lg },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  photoWrapper: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: borderRadius.sm, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  addTile: { width: PHOTO_SIZE, height: PHOTO_SIZE, backgroundColor: colors.surface, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', gap: 4 },
  addTileText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '500' },
  addTileSub: { color: colors.textMuted, fontSize: 9 },
  uploadingText: { color: colors.primary, fontSize: fontSize.xs },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md },
  emptySub: { color: colors.textMuted, fontSize: fontSize.sm },
});

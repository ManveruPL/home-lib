import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field-label';

import { shrinkPickedCover } from '../covers';

import { BookCover } from './book-cover';

type CoverFieldProps = {
  value: string;
  onChange: (uri: string) => void;
};

// Crop to the 2:3 book-cover ratio; covers are shown small, so full quality is not needed.
const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: 'images',
  allowsEditing: true,
  aspect: [2, 3],
  quality: 0.8,
};

export function CoverField({ value, onChange }: CoverFieldProps) {
  const { t } = useTranslation();

  const handleResult = async (result: ImagePicker.ImagePickerResult) => {
    const asset = result.canceled ? undefined : result.assets[0];
    if (!asset) return;
    // The picked file lives in the cache; saveBook copies it into permanent storage.
    onChange(await shrinkPickedCover(asset.uri, asset.width));
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('scan.permissionTitle'), t('book.coverCameraPermission'), [
        { text: t('common.cancel'), style: 'cancel' },
        ...(permission.canAskAgain
          ? []
          : [{ text: t('scan.openSettings'), onPress: () => void Linking.openSettings() }]),
      ]);
      return;
    }
    await handleResult(await ImagePicker.launchCameraAsync(PICKER_OPTIONS));
  };

  const pickFromGallery = async () => {
    // Android's system photo picker needs no permission.
    await handleResult(await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS));
  };

  return (
    <View className="gap-2">
      <FieldLabel>{t('book.fields.coverImage')}</FieldLabel>
      <View className="flex-row items-center gap-4">
        <BookCover
          uri={value || null}
          width={96}
          accessibilityLabel={t('book.fields.coverImage')}
        />
        <View className="flex-1 gap-2">
          <Button
            label={t('book.takeCoverPhoto')}
            icon="photo-camera"
            variant="tonal"
            onPress={() => void takePhoto()}
          />
          <Button
            label={t('book.pickCoverFromGallery')}
            icon="photo-library"
            variant="outlined"
            onPress={() => void pickFromGallery()}
          />
          {value ? (
            <Button
              label={t('book.removeCover')}
              icon="hide-image"
              variant="text"
              onPress={() => onChange('')}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

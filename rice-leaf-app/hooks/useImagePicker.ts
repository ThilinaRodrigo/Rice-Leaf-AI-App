import * as ImagePicker from 'expo-image-picker';

export const useImagePicker = () => {

  const pickImageFromGallery = async () =>{

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.granted === false) {
      alert("Permission to access gallery is required!");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    if (asset.base64) {
      return `data:image/jpeg;base64,${asset.base64}`;
    }

    return asset.uri;
  }

  const pickImageFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (permission.granted === false) {
      alert("Permission to access camera is required!");
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    if (asset.base64) {
      return `data:image/jpeg;base64,${asset.base64}`;
    }

    return asset.uri;
  };

  return { pickImageFromGallery, pickImageFromCamera };
}
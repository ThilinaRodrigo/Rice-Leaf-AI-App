import * as ImagePicker from 'expo-image-picker';

export const useImagePicker = () => {

  const pickImageFromGallery = async () =>{

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.granted === false) {
      alert("Permission to access gallery is required!");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  }

  return { pickImageFromGallery };
  
}
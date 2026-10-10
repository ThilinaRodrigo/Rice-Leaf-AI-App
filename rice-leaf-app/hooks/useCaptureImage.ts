import { useCallback, useRef } from "react";
import { CameraView } from "expo-camera";
import { router } from "expo-router";

type UseCapturePhotoOptions = {
  navigateTo?: string;
};

export function useCapturePhoto(options?: UseCapturePhotoOptions) {
  const cameraRef = useRef<CameraView | null>(null);

  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      // Full-resolution camera frames can exceed the backend's upload limit
      // (MAX_IMAGE_SIZE_MB), unlike gallery picks, so compress harder here.
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.4,
      });

      const imageUri = photo?.uri;

      if (imageUri && options?.navigateTo) {
        router.push({
          pathname: options.navigateTo as any,
          params: { imageUri },
        });
      }

      return imageUri;
      
    } catch (error) {
      console.error("Failed to capture photo:", error);
    }
  }, [options?.navigateTo]);

  return {
    cameraRef,
    capturePhoto,
  };
}

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
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
        base64: true,
      });

      const imageParam = photo?.base64
        ? `data:image/jpeg;base64,${photo.base64}`
        : photo?.uri;

      if (imageParam && options?.navigateTo) {
        router.push({
          pathname: options.navigateTo as any,
          params: { imageUri: imageParam },
        });
      }

      return imageParam;
      
    } catch (error) {
      console.error("Failed to capture photo:", error);
    }
  }, [options?.navigateTo]);

  return {
    cameraRef,
    capturePhoto,
  };
}

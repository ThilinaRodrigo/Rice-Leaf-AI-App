import * as ImageManipulator from "expo-image-manipulator";
import { Image } from "react-native";

/**
 * Gets image dimensions (width & height in pixels)
 */
export const getImageDimensions = (
  uri: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
};

export interface DisplayBox {
  /** Box left/top relative to the top-left corner of the displayed photo (screen px) */
  x: number;
  y: number;
  /** Square box side length (screen px) */
  size: number;
}

/**
 * Crops the original image to a square box the user placed over the displayed
 * (resizeMode="contain") photo.
 *
 * @param imageUri - local URI of the photo
 * @param box - box position/size in screen px, relative to the displayed photo
 * @param displayScale - screen px per original image px (displayed width / image width)
 * @returns cropped image URI (or the original URI if cropping fails)
 */
export const cropImageToDisplayBox = async (
  imageUri: string,
  box: DisplayBox,
  displayScale: number
): Promise<string> => {
  try {
    const { width: imgWidth, height: imgHeight } = await getImageDimensions(imageUri);
    if (imgWidth <= 0 || imgHeight <= 0 || displayScale <= 0) return imageUri;

    let originX = box.x / displayScale;
    let originY = box.y / displayScale;
    let side = box.size / displayScale;

    originX = Math.max(0, Math.min(originX, imgWidth - 10));
    originY = Math.max(0, Math.min(originY, imgHeight - 10));
    const width = Math.max(10, Math.min(side, imgWidth - originX));
    const height = Math.max(10, Math.min(side, imgHeight - originY));

    const result = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX: Math.round(originX),
            originY: Math.round(originY),
            width: Math.round(width),
            height: Math.round(height),
          },
        },
      ],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
    );

    return result.uri;
  } catch (error) {
    console.error("Failed to crop image:", error);
    return imageUri;
  }
};

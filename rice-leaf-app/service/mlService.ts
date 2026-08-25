import { API_BASE_URL } from "@/constant/api";
import { Platform } from "react-native";

export const predictImage = async (uri: string): Promise<any> => {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const imageResponse = await fetch(uri);
    if (!imageResponse.ok) {
      throw new Error("Unable to read the selected image");
    }

    formData.append("file", await imageResponse.blob(), "leaf.jpg");
  } else {
    formData.append("file", {
      uri,
      name: "leaf.jpg",
      type: "image/jpeg",
    } as any);
  }

  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  const responseText = await res.text();

  if (!res.ok) {
    throw new Error(`Prediction failed (${res.status}): ${responseText}`);
  }

  return JSON.parse(responseText);
};

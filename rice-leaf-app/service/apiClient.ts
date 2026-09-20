import { API_BASE_URL } from "@/constant/api";
import { Platform } from "react-native";

// 1. Scan / Analyze Leaf Image
export const analyzeLeafImage = async (imageUri: string, userToken?: string) => {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const imageResponse = await fetch(imageUri);
    if (!imageResponse.ok) {
      throw new Error("Unable to read the selected image file");
    }
    const blob = await imageResponse.blob();
    formData.append("file", blob, "rice_leaf.jpg");
  } else {
    formData.append("file", {
      uri: imageUri,
      name: "rice_leaf.jpg",
      type: "image/jpeg",
    } as any);
  }

  const headers: Record<string, string> = {};
  if (userToken) {
    headers["Authorization"] = `Bearer ${userToken}`;
  }

  const res = await fetch(`${API_BASE_URL}/scans/analyze`, {
    method: "POST",
    headers,
    body: formData,
  });

  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(`Analysis failed (${res.status}): ${responseText}`);
  }

  return JSON.parse(responseText);
};

// 2. Marketplace Products
export const fetchMarketProducts = async (category?: string, search?: string) => {
  const params = new URLSearchParams();
  if (category && category !== "All") params.append("category", category);
  if (search) params.append("search", search);

  const url = `${API_BASE_URL}/products?${params.toString()}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  return await res.json();
};

// 3. AI Agronomy Chat Assistant
export const sendChatMessage = async (message: string, userToken?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (userToken) {
    headers["Authorization"] = `Bearer ${userToken}`;
  }

  const res = await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    throw new Error(`Failed sending chat message (${res.status})`);
  }

  return await res.json();
};

// 4. Disease Remedies Knowledge Base
export const fetchDiseasesList = async () => {
  const res = await fetch(`${API_BASE_URL}/diseases`);
  if (!res.ok) {
    throw new Error(`Failed to fetch diseases list`);
  }
  return await res.json();
};

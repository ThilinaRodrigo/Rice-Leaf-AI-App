import { API_BASE_URL } from "@/constant/api";
import { Platform } from "react-native";

// 1. Scan / Analyze Leaf Image
export const analyzeLeafImage = async (imageUri: string, userToken?: string): Promise<any> => {
  const formData = new FormData();

  if (Platform.OS === "web") {
    // Web: fetch the image as a blob first
    const imageResponse = await fetch(imageUri);
    if (!imageResponse.ok) {
      throw new Error("Unable to read the selected image file");
    }
    const blob = await imageResponse.blob();
    formData.append("file", blob, "rice_leaf.jpg");

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

  } else {
    // Native (Android / iOS): Use XMLHttpRequest — fully supports {uri, name, type} FormData entries
    return new Promise((resolve, reject) => {
      const targetUrl = `${API_BASE_URL}/scans/analyze`;
      console.log("=== DEBUG: API_BASE_URL =", API_BASE_URL);
      console.log("=== DEBUG: Full upload URL =", targetUrl);
      console.log("=== DEBUG: imageUri =", imageUri);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", targetUrl);

      if (userToken) {
        xhr.setRequestHeader("Authorization", `Bearer ${userToken}`);
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error("Invalid JSON response from server"));
          }
        } else {
          reject(new Error(`Analysis failed (${xhr.status}): ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during image upload"));
      xhr.ontimeout = () => reject(new Error("Request timed out"));
      xhr.timeout = 30000;

      const nativeForm = new FormData();
      nativeForm.append("file", {
        uri: imageUri,
        name: "rice_leaf.jpg",
        type: "image/jpeg",
      } as any);

      xhr.send(nativeForm);
    });
  }
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

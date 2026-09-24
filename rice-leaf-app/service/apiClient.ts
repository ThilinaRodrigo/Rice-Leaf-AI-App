import { API_BASE_URL } from "@/constant/api";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

// Helper to convert scoped Expo Go ExperienceData URIs or base64 strings into readable root cache files
async function getReadableNativeFileUri(rawUri: string): Promise<{ uri: string; isTemp: boolean }> {
  if (!FileSystem.cacheDirectory) {
    return { uri: rawUri, isTemp: false };
  }

  const tempPath = `${FileSystem.cacheDirectory}upload_leaf_${Date.now()}.jpg`;

  // 1. If rawUri is already a base64 data URI or plain base64 string
  if (rawUri.startsWith("data:image/") || !rawUri.startsWith("file://")) {
    try {
      const base64Data = rawUri.includes(",") ? rawUri.split(",")[1] : rawUri;
      await FileSystem.writeAsStringAsync(tempPath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("=== DEBUG: Written base64 data directly to root cache file =", tempPath);
      return { uri: tempPath, isTemp: true };
    } catch (err) {
      console.warn("=== DEBUG: Base64 direct write failed:", err);
    }
  }

  // 2. Otherwise read rawUri directly (rawUri matches Expo Go's internal experience whitelist with %40anonymous%2F)
  try {
    const base64Data = await FileSystem.readAsStringAsync(rawUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Write to root cacheDirectory which has unrestricted native read permissions
    await FileSystem.writeAsStringAsync(tempPath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log("=== DEBUG: Successfully created root cache file from rawUri =", tempPath);
    return { uri: tempPath, isTemp: true };
  } catch (err) {
    console.warn("=== DEBUG: Base64 cache copy failed for rawUri:", err);
  }

  return { uri: rawUri, isTemp: false };
}

// 1. Scan / Analyze Leaf Image
export const analyzeLeafImage = async (imageUri: string, userToken?: string): Promise<any> => {
  const targetUrl = `${API_BASE_URL}/scans/analyze`;
  console.log("=== DEBUG: API_BASE_URL =", API_BASE_URL);
  console.log("=== DEBUG: Full upload URL =", targetUrl);
  console.log("=== DEBUG: Raw imageUri =", imageUri);

  const headers: Record<string, string> = {};
  if (userToken) {
    headers["Authorization"] = `Bearer ${userToken}`;
  }

  if (Platform.OS === "web") {
    // Web: fetch image blob first
    const formData = new FormData();
    const imageResponse = await fetch(imageUri);
    if (!imageResponse.ok) {
      throw new Error("Unable to read the selected image file");
    }
    const blob = await imageResponse.blob();
    formData.append("file", blob, "rice_leaf.jpg");

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    const responseText = await res.text();
    console.log("=== DEBUG: Web Upload status =", res.status);
    console.log("=== DEBUG: Web Upload response =", responseText);

    if (!res.ok) {
      throw new Error(`Analysis failed (${res.status}): ${responseText}`);
    }

    return JSON.parse(responseText);
  } else {
    // Native (Android / iOS)
    const { uri: uploadUri, isTemp } = await getReadableNativeFileUri(imageUri);
    console.log("=== DEBUG: Uploading native URI =", uploadUri);

    try {
      const uploadResult = await FileSystem.uploadAsync(targetUrl, uploadUri, {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "file",
        mimeType: "image/jpeg",
        headers,
      });

      console.log("=== DEBUG: Upload status =", uploadResult.status);
      console.log("=== DEBUG: Upload response =", uploadResult.body);

      if (uploadResult.status >= 200 && uploadResult.status < 300) {
        return JSON.parse(uploadResult.body);
      }
      throw new Error(`Analysis failed (${uploadResult.status}): ${uploadResult.body}`);
    } catch (uploadErr) {
      console.warn("FileSystem.uploadAsync failed, attempting XMLHttpRequest fallback:", uploadErr);

      // Fallback: XMLHttpRequest with FormData
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", targetUrl);

        if (userToken) {
          xhr.setRequestHeader("Authorization", `Bearer ${userToken}`);
        }

        xhr.onload = () => {
          console.log("=== DEBUG: XHR Upload status =", xhr.status);
          console.log("=== DEBUG: XHR Upload response =", xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              resolve(xhr.responseText);
            }
          } else {
            reject(new Error(`Analysis failed (${xhr.status}): ${xhr.responseText}`));
          }
        };

        xhr.onerror = (err) => {
          console.error("=== DEBUG: XHR Upload error =", err);
          reject(new Error("Network error occurred during image upload"));
        };

        const formData = new FormData();
        formData.append("file", {
          uri: uploadUri,
          name: "rice_leaf.jpg",
          type: "image/jpeg",
        } as any);

        xhr.send(formData);
      });
    } finally {
      if (isTemp) {
        try {
          await FileSystem.deleteAsync(uploadUri, { idempotent: true });
        } catch (e) {
          // Ignore cleanup error
        }
      }
    }
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

// 5. Auth API Functions
export const registerUser = async (payload: {
  full_name: string;
  email?: string;
  nic?: string;
  password: string;
  role: "farmer" | "shop_owner" | "sys_admin";
  phone?: string;
  shop_name?: string;
  district?: string;
  city?: string;
  whatsapp_number?: string;
}) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }
  return data;
};

export const loginUser = async (payload: {
  identifier?: string;
  email?: string;
  password: string;
}) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }
  return data;
};

export const fetchUserProfile = async (userToken: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch user profile");
  }
  return data;
};

export const changePassword = async (currentPassword: string, newPassword: string, userToken: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to change password");
  }
  return data;
};

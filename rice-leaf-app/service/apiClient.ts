import { API_BASE_URL } from "@/constant/api";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

// Helper to convert scoped Expo Go ExperienceData URIs or base64 strings into readable root cache files
async function getReadableNativeFileUri(rawUri: string): Promise<{ uri: string; isTemp: boolean }> {
  if (!FileSystem.cacheDirectory || !rawUri) {
    return { uri: rawUri, isTemp: false };
  }

  const tempPath = `${FileSystem.cacheDirectory}upload_file_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;

  // 1. If input is base64 data URI or raw base64 string
  if (rawUri.startsWith("data:image/") || (!rawUri.startsWith("file://") && !rawUri.startsWith("/") && !rawUri.startsWith("content://"))) {
    try {
      const base64Data = rawUri.includes(",") ? rawUri.split(",")[1] : rawUri;
      await FileSystem.writeAsStringAsync(tempPath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("=== DEBUG: Written base64 data to cache file =", tempPath);
      return { uri: tempPath, isTemp: true };
    } catch (err) {
      console.warn("=== DEBUG: Base64 direct write failed:", err);
    }
  }

  // 2. Decode URI string to eliminate double encoding issues (%2540 -> %40)
  let cleanUri = rawUri;
  try {
    cleanUri = decodeURIComponent(rawUri);
  } catch (e) {
    cleanUri = rawUri;
  }
  if (!cleanUri.startsWith("file://") && !cleanUri.startsWith("content://")) {
    cleanUri = `file://${cleanUri}`;
  }

  // 3. Try copyAsync
  try {
    await FileSystem.copyAsync({
      from: cleanUri,
      to: tempPath,
    });
    console.log("=== DEBUG: Successfully copied file to root cache =", tempPath);
    return { uri: tempPath, isTemp: true };
  } catch (copyErr) {
    console.warn("=== DEBUG: FileSystem.copyAsync failed, trying base64 fallback:", copyErr);
  }

  // 4. Try reading as base64 and writing to temp file
  try {
    const base64Data = await FileSystem.readAsStringAsync(cleanUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await FileSystem.writeAsStringAsync(tempPath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log("=== DEBUG: Successfully copied file via base64 write =", tempPath);
    return { uri: tempPath, isTemp: true };
  } catch (err) {
    console.warn("=== DEBUG: Base64 cache copy failed for cleanUri:", err);
  }

  return { uri: cleanUri, isTemp: false };
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
export const fetchDiseasesList = async (lang?: string) => {
  const url = lang ? `${API_BASE_URL}/diseases?lang=${encodeURIComponent(lang)}` : `${API_BASE_URL}/diseases`;
  const res = await fetch(url);
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

// 6. Shop Owner Ads API Functions
export const uploadAdImage = async (imageUri: string, userToken: string): Promise<string> => {
  const targetUrl = `${API_BASE_URL}/shop/ads/upload`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${userToken}`,
  };

  if (Platform.OS === "web") {
    const formData = new FormData();
    const imageResponse = await fetch(imageUri);
    const blob = await imageResponse.blob();
    formData.append("image", blob, "ad_image.jpg");

    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed uploading ad image");
    return data.image_url;
  } else {
    const { uri: uploadUri, isTemp } = await getReadableNativeFileUri(imageUri);
    console.log("=== DEBUG: Uploading ad image native URI =", uploadUri);

    try {
      // 1. Try standard fetch with FormData
      try {
        const formData = new FormData();
        formData.append("image", {
          uri: uploadUri,
          name: "ad_image.jpg",
          type: "image/jpeg",
        } as any);

        const res = await fetch(targetUrl, {
          method: "POST",
          headers,
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          console.log("=== DEBUG: Fetch FormData Ad upload success =", data);
          return data.image_url;
        }
      } catch (formDataErr) {
        console.warn("=== DEBUG: Fetch FormData upload failed, attempting Base64 JSON fallback:", formDataErr);
      }

      // 2. Fallback: Base64 JSON POST request
      let base64String = imageUri;
      if (imageUri.startsWith("file://") || imageUri.startsWith("content://") || uploadUri.startsWith("file://")) {
        const readPath = uploadUri.startsWith("file://") ? uploadUri : imageUri;
        try {
          base64String = await FileSystem.readAsStringAsync(readPath, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (readErr) {
          console.warn("=== DEBUG: Failed reading base64 for fallback:", readErr);
        }
      }

      const jsonRes = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          image_base64: base64String,
          filename: "ad_image.jpg",
        }),
      });

      const jsonText = await jsonRes.text();
      console.log("=== DEBUG: Base64 JSON upload status =", jsonRes.status, jsonText);

      if (!jsonRes.ok) {
        throw new Error(`Ad image upload failed (${jsonRes.status}): ${jsonText}`);
      }

      const parsed = JSON.parse(jsonText);
      return parsed.image_url;
    } finally {
      if (isTemp) {
        try {
          await FileSystem.deleteAsync(uploadUri, { idempotent: true });
        } catch (e) {}
      }
    }
  }
};

export const createShopAd = async (
  payload: {
    shop_name: string;
    contact_phone: string;
    title: string;
    category?: string;
    description: string;
    price_unit: string;
    image_url: string;
    disease_tags: string[];
  },
  userToken: string
) => {
  const res = await fetch(`${API_BASE_URL}/shop/ads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed creating shop advertisement");
  }
  return data;
};

export const updateShopAd = async (
  adId: string,
  payload: {
    shop_name: string;
    contact_phone: string;
    title: string;
    category?: string;
    description: string;
    price_unit: string;
    image_url: string;
    disease_tags: string[];
  },
  userToken: string
) => {
  const res = await fetch(`${API_BASE_URL}/shop/ads/${adId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed updating advertisement");
  }
  return data;
};

export const fetchMyShopAds = async (userToken: string) => {
  const res = await fetch(`${API_BASE_URL}/shop/ads/my-ads`, {
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch shop ads");
  }
  return data;
};

export const deleteShopAd = async (adId: string, userToken: string) => {
  const res = await fetch(`${API_BASE_URL}/shop/ads/${adId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${userToken}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to delete ad");
  }
  return data;
};

export const fetchApprovedMarketplaceAds = async (diseaseTag?: string) => {
  const url = diseaseTag
    ? `${API_BASE_URL}/marketplace/ads?disease_tag=${encodeURIComponent(diseaseTag)}`
    : `${API_BASE_URL}/marketplace/ads`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error("Failed to fetch marketplace ads");
  }
  return data;
};

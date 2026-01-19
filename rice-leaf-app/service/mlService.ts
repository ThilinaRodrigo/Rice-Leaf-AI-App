import { API_BASE_URL } from "@/constant/api";

export const predictImage = async (uri: string): Promise<any> => {
  
  const formData = new FormData();

  formData.append("file", {
    uri,
    name: "leaf.jpg",
    type: "image/jpeg",
  } as any);

  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!res.ok) {
    throw new Error("Prediction failed");
  }

  return await res.json();
};

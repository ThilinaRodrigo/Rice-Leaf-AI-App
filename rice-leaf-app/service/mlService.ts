import { analyzeLeafImage } from "./apiClient";

export const predictImage = async (uri: string): Promise<any> => {
  try {
    const data = await analyzeLeafImage(uri);
    // If returned from Go Backend with { scan, disease }
    if (data.scan) {
      return {
        class_id: data.scan.class_id,
        label: data.scan.label,
        confidence: data.scan.confidence,
        disease: data.disease,
      };
    }
    return data;
  } catch (err) {
    console.error("Go Backend diagnosis error:", err);
    throw err;
  }
};

import { Droplet, Thermometer, Calendar, ShieldCheck, Zap, AlertTriangle } from "lucide-react-native";

export const DISEASE_DATA: Record<number, any> = {
  0: {
    name: "Bacterial Leaf Blight (BLB)",
    category: "Bacterial (Xanthomonas oryzae)",
    description: "One of the most destructive diseases in Sri Lanka. It causes yellowing and drying of leaves (Kresek). Common in both Yala and Maha seasons, especially after heavy rains and strong winds.",
    factors: [
      { icon: Droplet, label: "Humidity", value: "High", color: "#3B82F6" },
      { icon: Zap, label: "Weather", value: "Strong Winds", color: "#64748B" },
      { icon: Thermometer, label: "Temp", value: "25-34°C", color: "#F97316" }
    ],
    actions: [
      { title: "Stop Water Supply", subtitle: "Drain the field immediately to stop spread" },
      { title: "Apply Potassium Fertilizer", subtitle: "Helps manage further spread (DOA recommendation)" },
      { title: "Avoid Excess Nitrogen", subtitle: "Reduce Urea application temporarily" }
    ]
  },
  1: {
    name: "Brown Spot",
    category: "Fungal (Bipolaris oryzae)",
    description: "Often called a 'poor man’s disease' in Sri Lanka because it indicates nutritional deficiency (low Potassium) or iron toxicity in the soil.",
    factors: [
      { icon: AlertTriangle, label: "Soil", value: "Nutrient Low", color: "#EF4444" },
      { icon: Droplet, label: "Humidity", value: "86-100%", color: "#3B82F6" },
      { icon: Thermometer, label: "Temp", value: "16-36°C", color: "#F97316" }
    ],
    actions: [
      { title: "Add Burnt Paddy Husk", subtitle: "250kg per acre during land preparation" },
      { title: "Apply Organic Fertilizer", subtitle: "To improve long-term soil quality" },
      { title: "Seed Treatment", subtitle: "Dip in hot water (53-54°C) for 10-12 mins" }
    ]
  },
  2: {
    name: "Healthy Leaf",
    category: "Optimal Condition",
    description: "The crop shows no signs of infection. Maintain standard Sri Lankan Department of Agriculture (DOA) fertilization guidelines using the Leaf Color Chart (LCC).",
    factors: [
      { icon: ShieldCheck, label: "Status", value: "Disease Free", color: "#22C55E" },
      { icon: Calendar, label: "Season", value: "Maha/Yala", color: "#A855F7" },
      { icon: Droplet, label: "Water", value: "Adequate", color: "#3B82F6" }
    ],
    actions: [
      { title: "Use Leaf Color Chart", subtitle: "To apply Urea only when necessary" },
      { title: "Regular Weeding", subtitle: "Prevents secondary hosts for pests" }
    ]
  },
  3: {
    name: "Leaf Scald",
    category: "Fungal (Microdochium oryzae)",
    description: "Commonly occurs late in the season on mature leaves. It creates a 'scalded' appearance starting from the leaf tips.",
    factors: [
      { icon: Calendar, label: "Stage", value: "Late Growth", color: "#A855F7" },
      { icon: Droplet, label: "Rainfall", value: "Heavy", color: "#3B82F6" },
      { icon: Zap, label: "Spacing", value: "High Density", color: "#64748B" }
    ],
    actions: [
      { title: "Apply Mancozeb", subtitle: "Foliar spray to reduce severity" },
      { title: "Split Nitrogen Dosage", subtitle: "Do not apply all Urea at once" },
      { title: "Remove Rice Stubbles", subtitle: "Plow under after harvest to kill fungi" }
    ]
  },
  4: {
    name: "Narrow Brown Spot",
    category: "Fungal (Cercospora janseana)",
    description: "Symptoms are short, linear brown lesions. In Sri Lanka, this is often seen as rice plants approach maturity.",
    factors: [
      { icon: Calendar, label: "Season", value: "Approaching Maturity", color: "#A855F7" },
      { icon: Droplet, label: "Humidity", value: "High", color: "#3B82F6" },
      { icon: Thermometer, label: "Temp", value: "Warm", color: "#F97316" }
    ],
    actions: [
      { title: "Apply Propiconazole", subtitle: "Apply between booting and heading stages" },
      { title: "Check Variety Resistance", subtitle: "Consult local Agrarian Service Center" },
      { title: "Burnt Paddy Husk", subtitle: "Apply to soil for next season" }
    ]
  }
};
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
    ],
    translations: {
      si: {
        name: "බැක්ටීරියා පත්‍ර අංගමාරය (කොළ පාළුව)",
        category: "බැක්ටීරියා ආසාදනය (Xanthomonas oryzae)",
        description: "ශ්‍රී ලංකාවේ ගොයම් වගාවට දැඩි හානි පමුණුවන රෝගයකි. පත්‍ර කහ පැහැ වී වියළී යයි. යල සහ මහ දෙකන්නයේදීම තද වැසි සහ සුළං සහිත කාලගුණයේදී වේගයෙන් පැතිරේ.",
        factors: [
          { icon: Droplet, label: "තෙතමනය", value: "අධිකයි", color: "#3B82F6" },
          { icon: Zap, label: "සුළඟ", value: "තද සුළං", color: "#64748B" },
          { icon: Thermometer, label: "උෂ්ණත්වය", value: "25-34°C", color: "#F97316" }
        ],
        actions: [
          { title: "ජල සම්පාදනය නවත්වන්න", subtitle: "රෝගය පැතිරීම වැළැක්වීමට වහාම කුඹුරේ ජලය හිස් කරන්න" },
          { title: "පොටෑසියම් පොහොර යොදන්න", subtitle: "කෘෂිකර්ම දෙපාර්තමේන්තුවේ උපදෙස් පරිදි පොටෑෂ් යොදන්න" },
          { title: "යූරියා භාවිතය සීමා කරන්න", subtitle: "නයිට්‍රජන් පොහොර වැඩිපුර යෙදීම තාවකාලිකව නවත්වන්න" }
        ]
      }
    }
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
    ],
    translations: {
      si: {
        name: "දුඹුරු ලප රෝගය (තලදැමුණු ලප)",
        category: "දිලීර ආසාදනය (Bipolaris oryzae)",
        description: "පසෙහි පොටෑසියම් වැනි පෝෂක ඌණතාවයන් පවතින විට සහ පසෙහි යකඩ විෂතාවය ඇති විට බහුලව වැළඳෙන රෝගයකි.",
        factors: [
          { icon: AlertTriangle, label: "පස", value: "පෝෂණ ඌණයි", color: "#EF4444" },
          { icon: Droplet, label: "තෙතමනය", value: "86-100%", color: "#3B82F6" },
          { icon: Thermometer, label: "උෂ්ණත්වය", value: "16-36°C", color: "#F97316" }
        ],
        actions: [
          { title: "දහයියා අළු යොදන්න", subtitle: "බිම් සකස් කිරීමේදී අක්කරයකට දහයියා අළු කිලෝග්‍රෑම් 250ක් යොදන්න" },
          { title: "කාබනික පොහොර යොදන්න", subtitle: "පසේ සාරවත්බව දීර්ඝකාලීනව වැඩිදියුණු කරන්න" },
          { title: "බීජ ප්‍රතිකාර", subtitle: "වපුරන බීජ සෙල්සියස් 53-54 උණු වතුරේ විනාඩි 10-12ක් ගිල්වා තබන්න" }
        ]
      }
    }
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
    ],
    translations: {
      si: {
        name: "නීරෝගී ගොයම් පත්‍රය",
        category: "ප්‍රශස්ත මට්ටම",
        description: "ගොයම් වගාවේ කිසිදු රෝග ලක්ෂණයක් නොමැත. කෘෂිකර්ම දෙපාර්තමේන්තුවේ පත්‍ර වර්ණ සටහන (LCC) භාවිතයෙන් නියමිත පරිදි පොහොර යොදන්න.",
        factors: [
          { icon: ShieldCheck, label: "තත්ත්වය", value: "රෝගී නැත", color: "#22C55E" },
          { icon: Calendar, label: "කන්නය", value: "යල/මහ", color: "#A855F7" },
          { icon: Droplet, label: "ජලය", value: "ප්‍රමාණවත්", color: "#3B82F6" }
        ],
        actions: [
          { title: "පත්‍ර වර්ණ සටහන භාවිතා කරන්න", subtitle: "යූරියා පොහොර අවශ්‍ය විට පමණක් නිවැරදි ප්‍රමාණයට යොදන්න" },
          { title: "නිසි ලෙස වල් මර්දනය කරන්න", subtitle: "කෘමීන් බෝවීම වැළැක්වීමට වල් පැළෑටි ඉවත් කරන්න" }
        ]
      }
    }
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
    ],
    translations: {
      si: {
        name: "පත්‍ර පිළිස්සුම් රෝගය (Leaf Scald)",
        category: "දිලීර ආසාදනය (Microdochium oryzae)",
        description: "ගොයම් පැළ වැඩුණු පසු පත්‍ර අගින් පිළිස්සුණු ස්වභාවයක් සහිතව හටගන්නා දිලීර රෝගයකි.",
        factors: [
          { icon: Calendar, label: "අවස්ථාව", value: "පසු වර්ධනය", color: "#A855F7" },
          { icon: Droplet, label: "වර්ෂාපතනය", value: "අධිකයි", color: "#3B82F6" },
          { icon: Zap, label: "පරතරය", value: "ඝනත්වයෙන් වැඩියි", color: "#64748B" }
        ],
        actions: [
          { title: "මැන්කොසෙබ් (Mancozeb) යොදන්න", subtitle: "දිලීරනාශක දියර විදින්න" },
          { title: "යූරියා කොටස් වශයෙන් යොදන්න", subtitle: "එක්වරම වැඩිපුර යූරියා යෙදීමෙන් වළකින්න" }
        ]
      }
    }
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
    ],
    translations: {
      si: {
        name: "සිහින් දුඹුරු ලප රෝගය (Narrow Brown Spot)",
        category: "දිලීර ආසාදනය (Cercospora janseana)",
        description: "ගොයම් කරල් පීදෙන අවධියේදී පත්‍ර මත කෙටි සිහින් දුඹුරු රේඛා ලෙස මතු වන රෝගයකි.",
        factors: [
          { icon: Calendar, label: "අවස්ථාව", value: "පීදෙන කාලය", color: "#A855F7" },
          { icon: Droplet, label: "තෙතමනය", value: "අධිකයි", color: "#3B82F6" },
          { icon: Thermometer, label: "උෂ්ණත්වය", value: "උණුසුම්", color: "#F97316" }
        ],
        actions: [
          { title: "ප්‍රොපිකොනසෝල් (Propiconazole) යොදන්න", subtitle: "ගොයම් කරල් පීදීමට පෙර යොදන්න" },
          { title: "ගොවිජන සේවා මධ්‍යස්ථානය හමුවන්න", subtitle: "දේශීය උපදෙස් ලබාගන්න" }
        ]
      }
    }
  }
};
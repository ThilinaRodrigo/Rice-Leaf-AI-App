import React from 'react';
import { Header } from '../components/Header';
import { CheckCircle, ShieldCheck } from 'lucide-react';

export const DiseasesManager: React.FC = () => {
  const diseases = [
    {
      class_id: 0,
      name: 'Bacterial Leaf Blight (BLB)',
      category: 'Bacterial (Xanthomonas oryzae)',
      description:
        'One of the most destructive diseases in Sri Lanka. It causes yellowing and drying of leaves (Kresek). Common in both Yala and Maha seasons, especially after heavy rains and strong winds.',
      actions: [
        'Stop Water Supply: Drain the field immediately to stop spread',
        'Apply Potassium Fertilizer: Helps manage further spread (DOA recommendation)',
        'Avoid Excess Nitrogen: Reduce Urea application temporarily',
      ],
    },
    {
      class_id: 1,
      name: 'Brown Spot',
      category: 'Fungal (Bipolaris oryzae)',
      description:
        'Often called a poor mans disease in Sri Lanka because it indicates nutritional deficiency (low Potassium) or iron toxicity in the soil.',
      actions: [
        'Add Burnt Paddy Husk: 250kg per acre during land preparation',
        'Apply Organic Fertilizer: To improve long-term soil quality',
        'Seed Treatment: Dip in hot water (53-54°C) for 10-12 mins',
      ],
    },
    {
      class_id: 2,
      name: 'Healthy Leaf',
      category: 'Optimal Condition',
      description:
        'The crop shows no signs of infection. Maintain standard Sri Lankan Department of Agriculture (DOA) fertilization guidelines using the Leaf Color Chart (LCC).',
      actions: [
        'Use Leaf Color Chart: To apply Urea only when necessary',
        'Regular Weeding: Prevents secondary hosts for pests',
      ],
    },
    {
      class_id: 3,
      name: 'Leaf Scald',
      category: 'Fungal (Microdochium oryzae)',
      description:
        'Commonly occurs late in the season on mature leaves. It creates a scalded appearance starting from the leaf tips.',
      actions: [
        'Apply Mancozeb: Foliar spray to reduce severity',
        'Split Nitrogen Dosage: Do not apply all Urea at once',
        'Remove Rice Stubbles: Plow under after harvest to kill fungi',
      ],
    },
    {
      class_id: 4,
      name: 'Narrow Brown Spot',
      category: 'Fungal (Cercospora janseana)',
      description:
        'Symptoms are short, linear brown lesions. In Sri Lanka, this is often seen as rice plants approach maturity.',
      actions: [
        'Apply Propiconazole: Apply between booting and heading stages',
        'Check Variety Resistance: Consult local Agrarian Service Center',
        'Burnt Paddy Husk: Apply to soil for next season',
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Disease & Remedy Knowledge Base"
        subtitle="Department of Agriculture (DOA) Sri Lanka diagnostic guidelines & treatment protocols"
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diseases.map((d) => (
            <div
              key={d.class_id}
              className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                    {d.class_id}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-lg">{d.name}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{d.category}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                {d.description}
              </p>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>DOA Recommended Actions</span>
                </h4>
                <ul className="space-y-2">
                  {d.actions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

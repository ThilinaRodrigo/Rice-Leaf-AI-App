-- Insert Disease Remedies Data
INSERT INTO diseases (class_id, key, name, category, description, factors, actions, translations) VALUES
(
    0,
    'bacterial_leaf_blight',
    'Bacterial Leaf Blight (BLB)',
    'Bacterial (Xanthomonas oryzae)',
    'One of the most destructive diseases in Sri Lanka. It causes yellowing and drying of leaves (Kresek). Common in both Yala and Maha seasons, especially after heavy rains and strong winds.',
    '[
        {"label": "Humidity", "value": "High", "color": "#3B82F6", "icon": "Droplet"},
        {"label": "Weather", "value": "Strong Winds", "color": "#64748B", "icon": "Zap"},
        {"label": "Temp", "value": "25-34°C", "color": "#F97316", "icon": "Thermometer"}
    ]'::jsonb,
    '[
        {"title": "Stop Water Supply", "subtitle": "Drain the field immediately to stop spread"},
        {"title": "Apply Potassium Fertilizer", "subtitle": "Helps manage further spread (DOA recommendation)"},
        {"title": "Avoid Excess Nitrogen", "subtitle": "Reduce Urea application temporarily"}
    ]'::jsonb,
    '{
        "si": {
            "name": "බැක්ටීරියා පත්‍ර අංගමාරය (කොළ පාළුව)",
            "category": "බැක්ටීරියා ආසාදනය (Xanthomonas oryzae)",
            "description": "ශ්‍රී ලංකාවේ ගොයම් වගාවට දැඩි හානි පමුණුවන රෝගයකි. පත්‍ර කහ පැහැ වී වියළී යයි. යල සහ මහ දෙකන්නයේදීම තද වැසි සහ සුළං සහිත කාලගුණයේදී වේගයෙන් පැතිරේ.",
            "factors": [
                {"label": "තෙතමනය", "value": "අධිකයි", "color": "#3B82F6", "icon": "Droplet"},
                {"label": "සුළඟ", "value": "තද සුළං", "color": "#64748B", "icon": "Zap"},
                {"label": "උෂ්ණත්වය", "value": "25-34°C", "color": "#F97316", "icon": "Thermometer"}
            ],
            "actions": [
                {"title": "ජල සම්පාදනය නවත්වන්න", "subtitle": "රෝගය පැතිරීම වැළැක්වීමට වහාම කුඹුරේ ජලය හිස් කරන්න"},
                {"title": "පොටෑසියම් පොහොර යොදන්න", "subtitle": "කෘෂිකර්ම දෙපාර්තමේන්තුවේ උපදෙස් පරිදි පොටෑෂ් යොදන්න"},
                {"title": "යූරියා භාවිතය සීමා කරන්න", "subtitle": "නයිට්‍රජන් පොහොර වැඩිපුර යෙදීම තාවකාලිකව නවත්වන්න"}
            ]
        }
    }'::jsonb
),
(
    1,
    'brown_spot',
    'Brown Spot',
    'Fungal (Bipolaris oryzae)',
    'Often called a poor mans disease in Sri Lanka because it indicates nutritional deficiency (low Potassium) or iron toxicity in the soil.',
    '[
        {"label": "Soil", "value": "Nutrient Low", "color": "#EF4444", "icon": "AlertTriangle"},
        {"label": "Humidity", "value": "86-100%", "color": "#3B82F6", "icon": "Droplet"},
        {"label": "Temp", "value": "16-36°C", "color": "#F97316", "icon": "Thermometer"}
    ]'::jsonb,
    '[
        {"title": "Add Burnt Paddy Husk", "subtitle": "250kg per acre during land preparation"},
        {"title": "Apply Organic Fertilizer", "subtitle": "To improve long-term soil quality"},
        {"title": "Seed Treatment", "subtitle": "Dip in hot water (53-54°C) for 10-12 mins"}
    ]'::jsonb,
    '{
        "si": {
            "name": "දුඹුරු ලප රෝගය (තලදැමුණු ලප)",
            "category": "දිලීර ආසාදනය (Bipolaris oryzae)",
            "description": "පසෙහි පොටෑසියම් වැනි පෝෂක ඌණතාවයන් පවතින විට සහ පසෙහි යකඩ විෂතාවය ඇති විට බහුලව වැළඳෙන රෝගයකි.",
            "factors": [
                {"label": "පස", "value": "පෝෂණ ඌණයි", "color": "#EF4444", "icon": "AlertTriangle"},
                {"label": "තෙතමනය", "value": "86-100%", "color": "#3B82F6", "icon": "Droplet"},
                {"label": "උෂ්ණත්වය", "value": "16-36°C", "color": "#F97316", "icon": "Thermometer"}
            ],
            "actions": [
                {"title": "දහයියා අළු යොදන්න", "subtitle": "බිම් සකස් කිරීමේදී අක්කරයකට දහයියා අළු කිලෝග්‍රෑම් 250ක් යොදන්න"},
                {"title": "කාබනික පොහොර යොදන්න", "subtitle": "පසේ සාරවත්බව දීර්ඝකාලීනව වැඩිදියුණු කරන්න"},
                {"title": "බීජ ප්‍රතිකාර", "subtitle": "වපුරන බීජ සෙල්සියස් 53-54 උණු වතුරේ විනාඩි 10-12ක් ගිල්වා තබන්න"}
            ]
        }
    }'::jsonb
),
(
    2,
    'healthy',
    'Healthy Leaf',
    'Optimal Condition',
    'The crop shows no signs of infection. Maintain standard Sri Lankan Department of Agriculture (DOA) fertilization guidelines using the Leaf Color Chart (LCC).',
    '[
        {"label": "Status", "value": "Disease Free", "color": "#22C55E", "icon": "ShieldCheck"},
        {"label": "Season", "value": "Maha/Yala", "color": "#A855F7", "icon": "Calendar"},
        {"label": "Water", "value": "Adequate", "color": "#3B82F6", "icon": "Droplet"}
    ]'::jsonb,
    '[
        {"title": "Use Leaf Color Chart", "subtitle": "To apply Urea only when necessary"},
        {"title": "Regular Weeding", "subtitle": "Prevents secondary hosts for pests"}
    ]'::jsonb,
    '{
        "si": {
            "name": "නීරෝගී ගොයම් පත්‍රය",
            "category": "ප්‍රශස්ත මට්ටම",
            "description": "ගොයම් වගාවේ කිසිදු රෝග ලක්ෂණයක් නොමැත. කෘෂිකර්ම දෙපාර්තමේන්තුවේ පත්‍ර වර්ණ සටහන (LCC) භාවිතයෙන් නියමිත පරිදි පොහොර යොදන්න.",
            "factors": [
                {"label": "තත්ත්වය", "value": "රෝගී නැත", "color": "#22C55E", "icon": "ShieldCheck"},
                {"label": "කන්නය", "value": "යල/මහ", "color": "#A855F7", "icon": "Calendar"},
                {"label": "ජලය", "value": "ප්‍රමාණවත්", "color": "#3B82F6", "icon": "Droplet"}
            ],
            "actions": [
                {"title": "පත්‍ර වර්ණ සටහන භාවිතා කරන්න", "subtitle": "යූරියා පොහොර අවශ්‍ය විට පමණක් නිවැරදි ප්‍රමාණයට යොදන්න"},
                {"title": "නිසි ලෙස වල් මර්දනය කරන්න", "subtitle": "කෘමීන් බෝවීම වැළැක්වීමට වල් පැළෑටි ඉවත් කරන්න"}
            ]
        }
    }'::jsonb
),
(
    3,
    'leaf_scald',
    'Leaf Scald',
    'Fungal (Microdochium oryzae)',
    'Commonly occurs late in the season on mature leaves. It creates a scalded appearance starting from the leaf tips.',
    '[
        {"label": "Stage", "value": "Late Growth", "color": "#A855F7", "icon": "Calendar"},
        {"label": "Rainfall", "value": "Heavy", "color": "#3B82F6", "icon": "Droplet"},
        {"label": "Spacing", "value": "High Density", "color": "#64748B", "icon": "Zap"}
    ]'::jsonb,
    '[
        {"title": "Apply Mancozeb", "subtitle": "Foliar spray to reduce severity"},
        {"title": "Split Nitrogen Dosage", "subtitle": "Do not apply all Urea at once"},
        {"title": "Remove Rice Stubbles", "subtitle": "Plow under after harvest to kill fungi"}
    ]'::jsonb,
    '{
        "si": {
            "name": "පත්‍ර පිළිස්සුම් රෝගය (Leaf Scald)",
            "category": "දිලීර ආසාදනය (Microdochium oryzae)",
            "description": "ගොයම් පැළ වැඩුණු පසු පත්‍ර අගින් පිළිස්සුණු ස්වභාවයක් සහිතව හටගන්නා දිලීර රෝගයකි.",
            "factors": [
                {"label": "අවස්ථාව", "value": "පසු වර්ධනය", "color": "#A855F7", "icon": "Calendar"},
                {"label": "වර්ෂාපතනය", "value": "අධිකයි", "color": "#3B82F6", "icon": "Droplet"},
                {"label": "පරතරය", "value": "ඝනත්වයෙන් වැඩියි", "color": "#64748B", "icon": "Zap"}
            ],
            "actions": [
                {"title": "මැන්කොසෙබ් (Mancozeb) යොදන්න", "subtitle": "දිලීරනාශක දියර විදින්න"},
                {"title": "යූරියා කොටස් වශයෙන් යොදන්න", "subtitle": "එක්වරම වැඩිපුර යූරියා යෙදීමෙන් වළකින්න"}
            ]
        }
    }'::jsonb
),
(
    4,
    'narrow_brown_spot',
    'Narrow Brown Spot',
    'Fungal (Cercospora janseana)',
    'Symptoms are short, linear brown lesions. In Sri Lanka, this is often seen as rice plants approach maturity.',
    '[
        {"label": "Season", "value": "Approaching Maturity", "color": "#A855F7", "icon": "Calendar"},
        {"label": "Humidity", "value": "High", "color": "#3B82F6", "icon": "Droplet"},
        {"label": "Temp", "value": "Warm", "color": "#F97316", "icon": "Thermometer"}
    ]'::jsonb,
    '[
        {"title": "Apply Propiconazole", "subtitle": "Apply between booting and heading stages"},
        {"title": "Check Variety Resistance", "subtitle": "Consult local Agrarian Service Center"},
        {"title": "Burnt Paddy Husk", "subtitle": "Apply to soil for next season"}
    ]'::jsonb,
    '{
        "si": {
            "name": "සිහින් දුඹුරු ලප රෝගය (Narrow Brown Spot)",
            "category": "දිලීර ආසාදනය (Cercospora janseana)",
            "description": "ගොයම් කරල් පීදෙන අවධියේදී පත්‍ර මත කෙටි සිහින් දුඹුරු රේඛා ලෙස මතු වන රෝගයකි.",
            "factors": [
                {"label": "අවස්ථාව", "value": "පීදෙන කාලය", "color": "#A855F7", "icon": "Calendar"},
                {"label": "තෙතමනය", "value": "අධිකයි", "color": "#3B82F6", "icon": "Droplet"},
                {"label": "උෂ්ණත්වය", "value": "උණුසුම්", "color": "#F97316", "icon": "Thermometer"}
            ],
            "actions": [
                {"title": "ප්‍රොපිකොනසෝල් (Propiconazole) යොදන්න", "subtitle": "ගොයම් කරල් පීදීමට පෙර යොදන්න"},
                {"title": "ගොවිජන සේවා මධ්‍යස්ථානය හමුවන්න", "subtitle": "දේශීය උපදෙස් ලබාගන්න"}
            ]
        }
    }'::jsonb
)
ON CONFLICT (class_id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    factors = EXCLUDED.factors,
    actions = EXCLUDED.actions,
    translations = EXCLUDED.translations;

-- Insert Marketplace Products Data
INSERT INTO products (name, category, price_cents, price_unit, image_url, stock, description) VALUES
('High-Quality Rice Seeds', 'Seeds', 45000, 'Rs.450 / kg', 'https://images.unsplash.com/photo-1607703700242-7a37b2fbb5bc?auto=format&fit=crop&w=500&q=60', 100, 'Certified high yield Bg 352 and At 362 rice seeds for Yala and Maha seasons.'),
('Organic Fertilizer', 'Fertilizers', 12000, 'Rs.120 / kg', 'https://images.unsplash.com/photo-1587316745629-1a81c7b54e9b?auto=format&fit=crop&w=500&q=60', 250, '100% natural compost and bio-fertilizer rich in nitrogen and organic carbon.'),
('Sprayer Tool', 'Sprayers', 220000, 'Rs.2,200', 'https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60', 50, '16L knapsack manual pressure sprayer ideal for pesticide and foliar application.'),
('Watering Can', 'Tools', 75000, 'Rs.750', 'https://images.unsplash.com/photo-1606312611231-1d6e0f51e3f1?auto=format&fit=crop&w=500&q=60', 75, 'Heavy-duty 10L ergonomic garden watering can for paddy nursery care.');

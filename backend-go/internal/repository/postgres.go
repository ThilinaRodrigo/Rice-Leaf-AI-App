package repository

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func NewPostgresDB(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("error opening db connection: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("error pinging db: %w", err)
	}

	log.Println("Connected to PostgreSQL database successfully!")
	return db, nil
}

func InitTablesAndSeeds(db *sql.DB) error {
	schema := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		full_name VARCHAR(100) NOT NULL,
		email VARCHAR(150) UNIQUE,
		nic VARCHAR(30) UNIQUE,
		password_hash VARCHAR(255) NOT NULL,
		role VARCHAR(20) NOT NULL DEFAULT 'farmer',
		phone VARCHAR(30),
		shop_name VARCHAR(150),
		district VARCHAR(100),
		city VARCHAR(100),
		whatsapp_number VARCHAR(30),
		avatar_url TEXT,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'farmer';
	ALTER TABLE users ADD COLUMN IF NOT EXISTS nic VARCHAR(30);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS shop_name VARCHAR(150);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
	ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(30);
	ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

	CREATE TABLE IF NOT EXISTS diseases (
		class_id INT PRIMARY KEY,
		key VARCHAR(50) UNIQUE NOT NULL,
		name VARCHAR(100) NOT NULL,
		category VARCHAR(100) NOT NULL,
		description TEXT NOT NULL,
		factors JSONB NOT NULL,
		actions JSONB NOT NULL,
		translations JSONB DEFAULT '{}'::jsonb,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	ALTER TABLE diseases ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;

	CREATE TABLE IF NOT EXISTS scans (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID REFERENCES users(id) ON DELETE SET NULL,
		image_url TEXT NOT NULL,
		class_id INT REFERENCES diseases(class_id),
		label VARCHAR(100) NOT NULL,
		confidence NUMERIC(5, 4) NOT NULL,
		notes TEXT,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS products (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		name VARCHAR(150) NOT NULL,
		category VARCHAR(50) NOT NULL,
		price_cents INT NOT NULL,
		price_unit VARCHAR(50) NOT NULL,
		image_url TEXT NOT NULL,
		stock INT NOT NULL DEFAULT 100,
		description TEXT,
		is_active BOOLEAN DEFAULT TRUE,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS chat_messages (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID REFERENCES users(id) ON DELETE SET NULL,
		sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
		message TEXT NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS shop_ads (
		id VARCHAR(100) PRIMARY KEY,
		shop_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
		shop_name VARCHAR(150) NOT NULL,
		contact_phone VARCHAR(30) NOT NULL,
		title VARCHAR(200) NOT NULL,
		category VARCHAR(100) NOT NULL DEFAULT 'Fungicides & Remedies',
		description TEXT NOT NULL,
		price_unit VARCHAR(100),
		image_url TEXT NOT NULL,
		disease_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
		status VARCHAR(20) NOT NULL DEFAULT 'pending',
		rejection_reason TEXT,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	ALTER TABLE shop_ads ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Fungicides & Remedies';

	CREATE TABLE IF NOT EXISTS community_posts (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		title VARCHAR(200) NOT NULL,
		content TEXT NOT NULL,
		disease_tag VARCHAR(100) NOT NULL,
		image_url TEXT,
		likes_count INT NOT NULL DEFAULT 0,
		dislikes_count INT NOT NULL DEFAULT 0,
		comments_count INT NOT NULL DEFAULT 0,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS post_votes (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('like', 'dislike')),
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(post_id, user_id)
	);

	CREATE TABLE IF NOT EXISTS post_comments (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
		user_id UUID REFERENCES users(id) ON DELETE CASCADE,
		comment TEXT NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);
	`

	_, err := db.Exec(schema)
	if err != nil {
		return fmt.Errorf("failed executing schema: %w", err)
	}

	seeds := `
	INSERT INTO users (full_name, email, password_hash, role) VALUES
	('System Administrator', 'admin@riceleaf.lk', '$2a$10$cVyhfPbv/olF8fVJ4yI4YujbWOQqlEu7iSJT0p3VP4QagY6HSztLO', 'sys_admin')
	ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

	INSERT INTO diseases (class_id, key, name, category, description, factors, actions) VALUES
	(0, 'bacterial_leaf_blight', 'Bacterial Leaf Blight (BLB)', 'Bacterial (Xanthomonas oryzae)', 'One of the most destructive diseases in Sri Lanka. It causes yellowing and drying of leaves (Kresek). Common in both Yala and Maha seasons, especially after heavy rains and strong winds.', '[{"label": "Humidity", "value": "High", "color": "#3B82F6", "icon": "Droplet"}, {"label": "Weather", "value": "Strong Winds", "color": "#64748B", "icon": "Zap"}, {"label": "Temp", "value": "25-34°C", "color": "#F97316", "icon": "Thermometer"}]'::jsonb, '[{"title": "Stop Water Supply", "subtitle": "Drain the field immediately to stop spread"}, {"title": "Apply Potassium Fertilizer", "subtitle": "Helps manage further spread (DOA recommendation)"}, {"title": "Avoid Excess Nitrogen", "subtitle": "Reduce Urea application temporarily"}]'::jsonb),
	(1, 'brown_spot', 'Brown Spot', 'Fungal (Bipolaris oryzae)', 'Often called a poor mans disease in Sri Lanka because it indicates nutritional deficiency (low Potassium) or iron toxicity in the soil.', '[{"label": "Soil", "value": "Nutrient Low", "color": "#EF4444", "icon": "AlertTriangle"}, {"label": "Humidity", "value": "86-100%", "color": "#3B82F6", "icon": "Droplet"}, {"label": "Temp", "value": "16-36°C", "color": "#F97316", "icon": "Thermometer"}]'::jsonb, '[{"title": "Add Burnt Paddy Husk", "subtitle": "250kg per acre during land preparation"}, {"title": "Apply Organic Fertilizer", "subtitle": "To improve long-term soil quality"}, {"title": "Seed Treatment", "subtitle": "Dip in hot water (53-54°C) for 10-12 mins"}]'::jsonb),
	(2, 'healthy', 'Healthy Leaf', 'Optimal Condition', 'The crop shows no signs of infection. Maintain standard Sri Lankan Department of Agriculture (DOA) fertilization guidelines using the Leaf Color Chart (LCC).', '[{"label": "Status", "value": "Disease Free", "color": "#22C55E", "icon": "ShieldCheck"}, {"label": "Season", "value": "Maha/Yala", "color": "#A855F7", "icon": "Calendar"}, {"label": "Water", "value": "Adequate", "color": "#3B82F6", "icon": "Droplet"}]'::jsonb, '[{"title": "Use Leaf Color Chart", "subtitle": "To apply Urea only when necessary"}, {"title": "Regular Weeding", "subtitle": "Prevents secondary hosts for pests"}]'::jsonb),
	(3, 'leaf_scald', 'Leaf Scald', 'Fungal (Microdochium oryzae)', 'Commonly occurs late in the season on mature leaves. It creates a scalded appearance starting from the leaf tips.', '[{"label": "Stage", "value": "Late Growth", "color": "#A855F7", "icon": "Calendar"}, {"label": "Rainfall", "value": "Heavy", "color": "#3B82F6", "icon": "Droplet"}, {"label": "Spacing", "value": "High Density", "color": "#64748B", "icon": "Zap"}]'::jsonb, '[{"title": "Apply Mancozeb", "subtitle": "Foliar spray to reduce severity"}, {"title": "Split Nitrogen Dosage", "subtitle": "Do not apply all Urea at once"}, {"title": "Remove Rice Stubbles", "subtitle": "Plow under after harvest to kill fungi"}]'::jsonb),
	(4, 'narrow_brown_spot', 'Narrow Brown Spot', 'Fungal (Cercospora janseana)', 'Symptoms are short, linear brown lesions. In Sri Lanka, this is often seen as rice plants approach maturity.', '[{"label": "Season", "value": "Approaching Maturity", "color": "#A855F7", "icon": "Calendar"}, {"label": "Humidity", "value": "High", "color": "#3B82F6", "icon": "Droplet"}, {"label": "Temp", "value": "Warm", "color": "#F97316", "icon": "Thermometer"}]'::jsonb, '[{"title": "Apply Propiconazole", "subtitle": "Apply between booting and heading stages"}, {"title": "Check Variety Resistance", "subtitle": "Consult local Agrarian Service Center"}, {"title": "Burnt Paddy Husk", "subtitle": "Apply to soil for next season"}]'::jsonb)
	ON CONFLICT (class_id) DO NOTHING;

	INSERT INTO products (name, category, price_cents, price_unit, image_url, stock, description) VALUES
	('High-Quality Rice Seeds', 'Seeds', 45000, 'Rs.450 / kg', 'https://images.unsplash.com/photo-1607703700242-7a37b2fbb5bc?auto=format&fit=crop&w=500&q=60', 100, 'Certified high yield Bg 352 and At 362 rice seeds for Yala and Maha seasons.'),
	('Organic Fertilizer', 'Fertilizers', 12000, 'Rs.120 / kg', 'https://images.unsplash.com/photo-1587316745629-1a81c7b54e9b?auto=format&fit=crop&w=500&q=60', 250, '100% natural compost and bio-fertilizer rich in nitrogen and organic carbon.'),
	('Sprayer Tool', 'Sprayers', 220000, 'Rs.2,200', 'https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60', 50, '16L knapsack manual pressure sprayer ideal for pesticide and foliar application.'),
	('Watering Can', 'Tools', 75000, 'Rs.750', 'https://images.unsplash.com/photo-1606312611231-1d6e0f51e3f1?auto=format&fit=crop&w=500&q=60', 75, 'Heavy-duty 10L ergonomic garden watering can for paddy nursery care.')
	ON CONFLICT DO NOTHING;
	`
	_, _ = db.Exec(seeds)
	return nil
}

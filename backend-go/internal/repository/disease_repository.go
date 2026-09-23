package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"backend-go/internal/domain"
)

type DiseaseRepository interface {
	GetAll(ctx context.Context) ([]domain.Disease, error)
	GetByClassID(ctx context.Context, classID int) (*domain.Disease, error)
}

type diseaseRepository struct {
	db *sql.DB
}

func NewDiseaseRepository(db *sql.DB) DiseaseRepository {
	return &diseaseRepository{db: db}
}

func (r *diseaseRepository) GetAll(ctx context.Context) ([]domain.Disease, error) {
	if r.db == nil {
		return getFallbackDiseases(), nil
	}
	query := `
		SELECT class_id, key, name, category, description, factors, actions, created_at
		FROM diseases
		ORDER BY class_id ASC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying diseases: %w", err)
	}
	defer rows.Close()

	var diseases []domain.Disease
	for rows.Next() {
		var d domain.Disease
		if err := rows.Scan(&d.ClassID, &d.Key, &d.Name, &d.Category, &d.Description, &d.Factors, &d.Actions, &d.CreatedAt); err != nil {
			return nil, err
		}
		diseases = append(diseases, d)
	}

	return diseases, nil
}

func (r *diseaseRepository) GetByClassID(ctx context.Context, classID int) (*domain.Disease, error) {
	if r.db == nil {
		diseases := getFallbackDiseases()
		for _, d := range diseases {
			if d.ClassID == classID {
				return &d, nil
			}
		}
		return nil, errors.New("disease not found")
	}
	query := `
		SELECT class_id, key, name, category, description, factors, actions, created_at
		FROM diseases
		WHERE class_id = $1
	`
	d := &domain.Disease{}
	err := r.db.QueryRowContext(ctx, query, classID).
		Scan(&d.ClassID, &d.Key, &d.Name, &d.Category, &d.Description, &d.Factors, &d.Actions, &d.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("disease not found")
		}
		return nil, err
	}
	return d, nil
}

func getFallbackDiseases() []domain.Disease {
	return []domain.Disease{
		{
			ClassID:     0,
			Key:         "bacterial_leaf_blight",
			Name:        "Bacterial Leaf Blight (BLB)",
			Category:    "Bacterial (Xanthomonas oryzae)",
			Description: "One of the most destructive diseases in Sri Lanka. It causes yellowing and drying of leaves (Kresek). Common in both Yala and Maha seasons, especially after heavy rains and strong winds.",
			Factors:     []byte(`[{"label": "Humidity", "value": "High", "color": "#3B82F6", "icon": "Droplet"}, {"label": "Weather", "value": "Strong Winds", "color": "#64748B", "icon": "Zap"}, {"label": "Temp", "value": "25-34°C", "color": "#F97316", "icon": "Thermometer"}]`),
			Actions:     []byte(`[{"title": "Stop Water Supply", "subtitle": "Drain the field immediately to stop spread"}, {"title": "Apply Potassium Fertilizer", "subtitle": "Helps manage further spread (DOA recommendation)"}, {"title": "Avoid Excess Nitrogen", "subtitle": "Reduce Urea application temporarily"}]`),
		},
		{
			ClassID:     1,
			Key:         "brown_spot",
			Name:        "Brown Spot",
			Category:    "Fungal (Bipolaris oryzae)",
			Description: "Often called a poor mans disease in Sri Lanka because it indicates nutritional deficiency (low Potassium) or iron toxicity in the soil.",
			Factors:     []byte(`[{"label": "Soil", "value": "Nutrient Low", "color": "#EF4444", "icon": "AlertTriangle"}, {"label": "Humidity", "value": "86-100%", "color": "#3B82F6", "icon": "Droplet"}, {"label": "Temp", "value": "16-36°C", "color": "#F97316", "icon": "Thermometer"}]`),
			Actions:     []byte(`[{"title": "Add Burnt Paddy Husk", "subtitle": "250kg per acre during land preparation"}, {"title": "Apply Organic Fertilizer", "subtitle": "To improve long-term soil quality"}, {"title": "Seed Treatment", "subtitle": "Dip in hot water (53-54°C) for 10-12 mins"}]`),
		},
		{
			ClassID:     2,
			Key:         "healthy",
			Name:        "Healthy Leaf",
			Category:    "Optimal Condition",
			Description: "The crop shows no signs of infection. Maintain standard Sri Lankan Department of Agriculture (DOA) fertilization guidelines using the Leaf Color Chart (LCC).",
			Factors:     []byte(`[{"label": "Status", "value": "Disease Free", "color": "#22C55E", "icon": "ShieldCheck"}, {"label": "Season", "value": "Maha/Yala", "color": "#A855F7", "icon": "Calendar"}, {"label": "Water", "value": "Adequate", "color": "#3B82F6", "icon": "Droplet"}]`),
			Actions:     []byte(`[{"title": "Use Leaf Color Chart", "subtitle": "To apply Urea only when necessary"}, {"title": "Regular Weeding", "subtitle": "Prevents secondary hosts for pests"}]`),
		},
		{
			ClassID:     3,
			Key:         "leaf_scald",
			Name:        "Leaf Scald",
			Category:    "Fungal (Microdochium oryzae)",
			Description: "Commonly occurs late in the season on mature leaves. It creates a scalded appearance starting from the leaf tips.",
			Factors:     []byte(`[{"label": "Stage", "value": "Late Growth", "color": "#A855F7", "icon": "Calendar"}, {"label": "Rainfall", "value": "Heavy", "color": "#3B82F6", "icon": "Droplet"}, {"label": "Spacing", "value": "High Density", "color": "#64748B", "icon": "Zap"}]`),
			Actions:     []byte(`[{"title": "Apply Mancozeb", "subtitle": "Foliar spray to reduce severity"}, {"title": "Split Nitrogen Dosage", "subtitle": "Do not apply all Urea at once"}, {"title": "Remove Rice Stubbles", "subtitle": "Plow under after harvest to kill fungi"}]`),
		},
		{
			ClassID:     4,
			Key:         "narrow_brown_spot",
			Name:        "Narrow Brown Spot",
			Category:    "Fungal (Cercospora janseana)",
			Description: "Symptoms are short, linear brown lesions. In Sri Lanka, this is often seen as rice plants approach maturity.",
			Factors:     []byte(`[{"label": "Season", "value": "Approaching Maturity", "color": "#A855F7", "icon": "Calendar"}, {"label": "Humidity", "value": "High", "color": "#3B82F6", "icon": "Droplet"}, {"label": "Temp", "value": "Warm", "color": "#F97316", "icon": "Thermometer"}]`),
			Actions:     []byte(`[{"title": "Apply Propiconazole", "subtitle": "Apply between booting and heading stages"}, {"title": "Check Variety Resistance", "subtitle": "Consult local Agrarian Service Center"}, {"title": "Burnt Paddy Husk", "subtitle": "Apply to soil for next season"}]`),
		},
	}
}

package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"sync"

	"backend-go/internal/domain"
)

type DiseaseRepository interface {
	GetAll(ctx context.Context) ([]domain.Disease, error)
	GetByClassID(ctx context.Context, classID int) (*domain.Disease, error)
	Create(ctx context.Context, disease *domain.Disease) error
	Update(ctx context.Context, classID int, disease *domain.Disease) error
	Delete(ctx context.Context, classID int) error
}

type diseaseRepository struct {
	db          *sql.DB
	memDiseases []domain.Disease
	mu          sync.RWMutex
}

func NewDiseaseRepository(db *sql.DB) DiseaseRepository {
	return &diseaseRepository{
		db:          db,
		memDiseases: getFallbackDiseases(),
	}
}

func (r *diseaseRepository) GetAll(ctx context.Context) ([]domain.Disease, error) {
	if r.db != nil {
		query := `
			SELECT class_id, key, name, category, description, factors, actions, created_at
			FROM diseases
			ORDER BY class_id ASC
		`
		rows, err := r.db.QueryContext(ctx, query)
		if err == nil {
			defer rows.Close()
			var diseases []domain.Disease
			for rows.Next() {
				var d domain.Disease
				if err := rows.Scan(&d.ClassID, &d.Key, &d.Name, &d.Category, &d.Description, &d.Factors, &d.Actions, &d.CreatedAt); err != nil {
					return nil, err
				}
				diseases = append(diseases, d)
			}
			if len(diseases) > 0 {
				return diseases, nil
			}
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.memDiseases, nil
}

func (r *diseaseRepository) GetByClassID(ctx context.Context, classID int) (*domain.Disease, error) {
	if r.db != nil {
		query := `
			SELECT class_id, key, name, category, description, factors, actions, created_at
			FROM diseases
			WHERE class_id = $1
		`
		d := &domain.Disease{}
		err := r.db.QueryRowContext(ctx, query, classID).
			Scan(&d.ClassID, &d.Key, &d.Name, &d.Category, &d.Description, &d.Factors, &d.Actions, &d.CreatedAt)
		if err == nil {
			return d, nil
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, d := range r.memDiseases {
		if d.ClassID == classID {
			return &d, nil
		}
	}
	return nil, errors.New("disease not found")
}

func (r *diseaseRepository) Create(ctx context.Context, d *domain.Disease) error {
	if len(d.Factors) == 0 {
		d.Factors = []byte("[]")
	}
	if len(d.Actions) == 0 {
		d.Actions = []byte("[]")
	}

	if r.db != nil {
		query := `
			INSERT INTO diseases (class_id, key, name, category, description, factors, actions)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			RETURNING created_at
		`
		err := r.db.QueryRowContext(ctx, query, d.ClassID, d.Key, d.Name, d.Category, d.Description, d.Factors, d.Actions).Scan(&d.CreatedAt)
		if err != nil {
			return fmt.Errorf("failed creating disease: %w", err)
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.memDiseases = append(r.memDiseases, *d)
	return nil
}

func (r *diseaseRepository) Update(ctx context.Context, classID int, d *domain.Disease) error {
	if len(d.Factors) == 0 {
		d.Factors = []byte("[]")
	}
	if len(d.Actions) == 0 {
		d.Actions = []byte("[]")
	}

	if r.db != nil {
		query := `
			UPDATE diseases
			SET class_id = $1, key = $2, name = $3, category = $4, description = $5, factors = $6, actions = $7
			WHERE class_id = $8
		`
		_, err := r.db.ExecContext(ctx, query, d.ClassID, d.Key, d.Name, d.Category, d.Description, d.Factors, d.Actions, classID)
		if err != nil {
			return fmt.Errorf("failed updating disease: %w", err)
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	for i, existing := range r.memDiseases {
		if existing.ClassID == classID {
			r.memDiseases[i] = *d
			break
		}
	}
	return nil
}

func (r *diseaseRepository) Delete(ctx context.Context, classID int) error {
	if r.db != nil {
		_, err := r.db.ExecContext(ctx, "DELETE FROM diseases WHERE class_id = $1", classID)
		if err != nil {
			return fmt.Errorf("failed deleting disease: %w", err)
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	var updated []domain.Disease
	for _, existing := range r.memDiseases {
		if existing.ClassID != classID {
			updated = append(updated, existing)
		}
	}
	r.memDiseases = updated
	return nil
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

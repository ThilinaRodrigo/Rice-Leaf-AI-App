package disease

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"sync"
)

type Repository interface {
	GetAll(ctx context.Context) ([]Disease, error)
	GetByClassID(ctx context.Context, classID int) (*Disease, error)
	Create(ctx context.Context, disease *Disease) error
	Update(ctx context.Context, classID int, disease *Disease) error
	Delete(ctx context.Context, classID int) error
}

type repository struct {
	db          *sql.DB
	memDiseases []Disease
	mu          sync.RWMutex
}

func NewRepository(db *sql.DB) Repository {
	return &repository{
		db:          db,
		memDiseases: getFallbackDiseases(),
	}
}

func (r *repository) GetAll(ctx context.Context) ([]Disease, error) {
	if r.db != nil {
		query := `
			SELECT class_id, key, name, category, description, factors, actions, COALESCE(translations, '{}'::jsonb), created_at
			FROM diseases
			ORDER BY class_id ASC
		`
		rows, err := r.db.QueryContext(ctx, query)
		if err == nil {
			defer rows.Close()
			var diseases []Disease
			for rows.Next() {
				var d Disease
				if err := rows.Scan(&d.ClassID, &d.Key, &d.Name, &d.Category, &d.Description, &d.Factors, &d.Actions, &d.Translations, &d.CreatedAt); err != nil {
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

func (r *repository) GetByClassID(ctx context.Context, classID int) (*Disease, error) {
	if r.db != nil {
		query := `
			SELECT class_id, key, name, category, description, factors, actions, COALESCE(translations, '{}'::jsonb), created_at
			FROM diseases
			WHERE class_id = $1
		`
		d := &Disease{}
		err := r.db.QueryRowContext(ctx, query, classID).
			Scan(&d.ClassID, &d.Key, &d.Name, &d.Category, &d.Description, &d.Factors, &d.Actions, &d.Translations, &d.CreatedAt)
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

func (r *repository) Create(ctx context.Context, d *Disease) error {
	if len(d.Factors) == 0 {
		d.Factors = []byte("[]")
	}
	if len(d.Actions) == 0 {
		d.Actions = []byte("[]")
	}
	if len(d.Translations) == 0 {
		d.Translations = []byte("{}")
	}

	if r.db != nil {
		query := `
			INSERT INTO diseases (class_id, key, name, category, description, factors, actions, translations)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING created_at
		`
		err := r.db.QueryRowContext(ctx, query, d.ClassID, d.Key, d.Name, d.Category, d.Description, d.Factors, d.Actions, d.Translations).Scan(&d.CreatedAt)
		if err != nil {
			return fmt.Errorf("failed creating disease: %w", err)
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.memDiseases = append(r.memDiseases, *d)
	return nil
}

func (r *repository) Update(ctx context.Context, classID int, d *Disease) error {
	if len(d.Factors) == 0 {
		d.Factors = []byte("[]")
	}
	if len(d.Actions) == 0 {
		d.Actions = []byte("[]")
	}
	if len(d.Translations) == 0 {
		d.Translations = []byte("{}")
	}

	if r.db != nil {
		query := `
			UPDATE diseases
			SET class_id = $1, key = $2, name = $3, category = $4, description = $5, factors = $6, actions = $7, translations = $8
			WHERE class_id = $9
		`
		_, err := r.db.ExecContext(ctx, query, d.ClassID, d.Key, d.Name, d.Category, d.Description, d.Factors, d.Actions, d.Translations, classID)
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

func (r *repository) Delete(ctx context.Context, classID int) error {
	if r.db != nil {
		_, err := r.db.ExecContext(ctx, "DELETE FROM diseases WHERE class_id = $1", classID)
		if err != nil {
			return fmt.Errorf("failed deleting disease: %w", err)
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	var updated []Disease
	for _, existing := range r.memDiseases {
		if existing.ClassID != classID {
			updated = append(updated, existing)
		}
	}
	r.memDiseases = updated
	return nil
}

func getFallbackDiseases() []Disease {
	return []Disease{
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
	}
}

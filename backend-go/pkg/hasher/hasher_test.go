package hasher

import (
	"testing"
)

func TestHashPassword(t *testing.T) {
	hash, err := HashPassword("admin123")
	if err != nil {
		t.Fatalf("failed hashing: %v", err)
	}
	t.Logf("Generated hash for admin123: %s", hash)
	if !CheckPassword("admin123", hash) {
		t.Fatalf("CheckPassword failed for generated hash")
	}
}

func TestAdminHash(t *testing.T) {
	seededHash := "$2a$10$cVyhfPbv/olF8fVJ4yI4YujbWOQqlEu7iSJT0p3VP4QagY6HSztLO"
	if !CheckPassword("admin123", seededHash) {
		t.Errorf("Seeded hash in postgres.go failed CheckPassword for admin123!")
	}
}

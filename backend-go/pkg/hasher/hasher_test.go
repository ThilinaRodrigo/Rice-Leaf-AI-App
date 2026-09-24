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

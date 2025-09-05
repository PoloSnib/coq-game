class ScoringSystem {
    constructor() {
        this.score = 0;
        this.maxY = null;
    }

    update(playerY, startY, gridSize) {
        // No-op: scoring now handled by tokens
    }

    setScore(val) {
        this.score = val;
    }

    reset() {
        this.score = 0;
        this.maxY = null;
    }
}
window.ScoringSystem = ScoringSystem;
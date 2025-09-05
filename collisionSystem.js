class CollisionSystem {
    static checkCollision(a, b) {
        // Simple AABB
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        );
    }
}
window.CollisionSystem = CollisionSystem;
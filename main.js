// Main orchestrator, initializes everything
window.addEventListener('DOMContentLoaded', function () {
    if (!window.GameLoop) throw new Error('GameLoop missing!');
    window.gameLoop = new window.GameLoop();
});
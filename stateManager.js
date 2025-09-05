class StateManager {
    constructor() {
        this.state = "menu"; // "menu", "game", "gameover"
    }
    setState(s) {
        this.state = s;
    }
    getState() {
        return this.state;
    }
}
window.StateManager = StateManager;
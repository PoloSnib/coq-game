class InputHandler {
    constructor() {
        this.direction = null;
        this.lastKey = null;
        this.enabled = true;
        this._keydownListener = this._onKeyDown.bind(this);
        this._touchstartListener = this._onTouchStart.bind(this);
        this._setupListeners();
    }

    _setupListeners() {
        document.addEventListener('keydown', this._keydownListener);
        // Touch support for mobile
        document.addEventListener('touchstart', this._touchstartListener, { passive: false });
    }

    _removeListeners() {
        document.removeEventListener('keydown', this._keydownListener);
        document.removeEventListener('touchstart', this._touchstartListener, { passive: false });
    }

    _onKeyDown(e) {
        if (!this.enabled) return;
        let dir = null;
        switch (e.key) {
            case "ArrowUp": dir = 'up'; break;
            case "ArrowDown": dir = 'down'; break;
            case "ArrowLeft": dir = 'left'; break;
            case "ArrowRight": dir = 'right'; break;
            case "w": case "W": dir = 'up'; break;
            case "s": case "S": dir = 'down'; break;
            case "a": case "A": dir = 'left'; break;
            case "d": case "D": dir = 'right'; break;
        }
        if (dir) {
            this.direction = dir;
            this.lastKey = dir;
            e.preventDefault();
        }
    }

    _onTouchStart(e) {
        if (!this.enabled) return;
        if (!e.touches || e.touches.length === 0) return;
        let touch = e.touches[0];
        let canvas = document.getElementById('game-canvas');
        let rect = canvas.getBoundingClientRect();
        let x = touch.clientX - rect.left, y = touch.clientY - rect.top;
        let w = rect.width, h = rect.height;
        // Direction based on where user touched (relative to center)
        let dx = x - w / 2, dy = y - h / 2;
        let dir = null;
        if (Math.abs(dx) > Math.abs(dy)) {
            dir = dx > 0 ? 'right' : 'left';
        } else {
            dir = dy > 0 ? 'down' : 'up';
        }
        this.direction = dir;
        this.lastKey = dir;
        e.preventDefault();
    }

    getDirection() {
        let dir = this.direction;
        this.direction = null;
        return dir;
    }

    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }
}
window.InputHandler = InputHandler;
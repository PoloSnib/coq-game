class UIManager {
    constructor(canvas) {
        this.overlay = document.getElementById('ui-overlay');
        this.canvas = canvas;
        this._clear();
    }

    showMenu(onStart) {
        this._clear();
        let div = document.createElement('div');
        div.className = 'menu-overlay';
        div.innerHTML = `<h1>🐔 Chicken Crossing</h1>
            <p style="font-size:1.1rem;margin:10px 0 0 0;">Help the chicken cross the road!</p>
            <p style="font-size:1rem;color:#fffa;margin:15px 0 0 0;">Use arrow keys or swipe/tap</p>
            <button>Start Game</button>`;
        let btn = div.querySelector('button');
        btn.onclick = () => {
            this._clear();
            onStart && onStart();
        };
        this.overlay.appendChild(div);
    }

    showGameOver(score, onRestart, level = 1, maxLevel = 3, lives = 0) {
        this._clear();
        let div = document.createElement('div');
        div.className = 'gameover-overlay';
        let title = (level > maxLevel) ? "You Win!" : (level === maxLevel ? "You Win!" : "Game Over");
        let message = (level > maxLevel || level === maxLevel)
            ? `<p style="font-size:1.1rem;margin:10px 0 0 0;">Congratulations! You completed all levels.</p>`
            : "";
        let livesMsg = '';
        if (typeof lives === 'number' && level <= maxLevel) {
            livesMsg = `<p style="font-size:1.1rem;margin:10px 0 0 0;">Lives left: <span style="color:#ffe970;">${lives}</span></p>`;
        }
        div.innerHTML = `<h1>${title}</h1>
            <p style="font-size:1.4rem;margin:12px 0 0 0;">Score: <span style="color:#ffe970;">${score}</span></p>
            ${livesMsg}
            ${message}
            <button>Restart</button>`;
        let btn = div.querySelector('button');
        btn.onclick = () => {
            this._clear();
            onRestart && onRestart();
        };
        this.overlay.appendChild(div);
    }

    showNextLevel(nextLevel, onNext) {
        this._clear();
        let div = document.createElement('div');
        div.className = 'menu-overlay';
        div.innerHTML = `<h1>Level ${nextLevel}</h1>
            <p style="font-size:1.1rem;margin:10px 0 0 0;">Great job! Ready for the next level?</p>
            <button>Start</button>
            <p style="font-size:0.98rem;color:#fffa;margin:18px 0 0 0;">Press <b>Enter</b> or click Start</p>`;
        let btn = div.querySelector('button');
        btn.onclick = () => {
            this._clear();
            onNext && onNext();
        };
        this.overlay.appendChild(div);
    }

    showScore(score, level = 1, lives = undefined) {
        // Remove previous
        let prev = document.getElementById('score-label-container');
        if (prev) prev.remove();

        // Container for all boxes
        let container = document.createElement('div');
        container.className = 'score-label-container';
        container.id = 'score-label-container';

        // Level box
        let levelDiv = document.createElement('div');
        levelDiv.className = 'score-label score-label-single score-label-level';
        levelDiv.textContent = `Level: ${level}`;
        container.appendChild(levelDiv);

        // Score box
        let scoreDiv = document.createElement('div');
        scoreDiv.className = 'score-label score-label-single score-label-score';
        scoreDiv.textContent = `Score: ${score}`;
        container.appendChild(scoreDiv);

        // Lives box (if lives is a number)
        if (typeof lives === 'number') {
            let livesDiv = document.createElement('div');
            livesDiv.className = 'score-label score-label-single score-label-lives';
            livesDiv.textContent = `Lives: ${lives}`;
            container.appendChild(livesDiv);
        }

        // Attach to body so it is always below the volume bar overlay
        document.body.appendChild(container);
    }

    _clear() {
        this.overlay.innerHTML = '';
        // Also remove score label container from body if present
        let prev = document.getElementById('score-label-container');
        if (prev) prev.remove();
    }

    clearAll() {
        this._clear();
    }
}
window.UIManager = UIManager;
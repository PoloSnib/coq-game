class GameLoop {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        // Ensure the canvas is focused for keyboard input
        this.canvas.setAttribute('tabindex', '1');
        this.canvas.focus();
        this.laneCount = 11;
        this.gridSize = 78; // Increased from 52 for bigger screen
        this.laneHeight = this.gridSize;
        this.lanes = [];
        this.vehicles = [];
        this.tokens = [];
        this.inputHandler = new window.InputHandler();
        this.stateManager = new window.StateManager();
        this.audioManager = new window.AudioManager();
        this.scoringSystem = new window.ScoringSystem();
        this.uiManager = new window.UIManager(this.canvas);
        this.player = null;
        this.renderer = null;
        this.level = 1; // NEW: Track current level
        this.maxLevel = 6; // CHANGED: Now 6 levels
        this.lives = 3; // --- PLAYER LIVES ---
        this._setupGame();
        this._frameRequest = null;
        this._lastTimestamp = null;
        this._gameActive = false;
        this._gameOver = false;
        this._waitingForNextLevel = false; // NEW: Track level completion state
        this._initMenu();

        // Ensure canvas regains focus after overlays
        document.addEventListener('mousedown', () => {
            if (this.stateManager.getState() === 'game') {
                this.canvas.focus();
            }
        });
        document.addEventListener('touchstart', () => {
            if (this.stateManager.getState() === 'game') {
                this.canvas.focus();
            }
        });
    }

    _setupGame() {
        // Setup lanes: [grass, road, road, grass, road, road, grass, road, road, finish]
        this.lanes = [];
        let y = 0;
        let laneTypes = [];
        laneTypes.push('grass');
        for (let i = 1; i < this.laneCount-1; i++) {
            if (i % 3 === 2) laneTypes.push('grass');
            else laneTypes.push('road');
        }
        laneTypes.push('finish');
        for (let i = 0; i < this.laneCount; i++) {
            this.lanes.push(new window.RoadLane(
                y, this.laneHeight, laneTypes[i]
            ));
            y += this.laneHeight;
        }
        // Player start position
        let startLaneIdx = 0;
        // --- Use new player size (72x72) for centering ---
        let playerW = 72, playerH = 72;
        let startY = this.lanes[startLaneIdx].y + (this.laneHeight - playerH) / 2;
        let startX = (this.canvas.width - playerW) / 2;
        // Always use chicken for now
        this.player = new window.PlayerChicken(startX, startY);
        this.startX = startX;
        this.startY = startY;
        // Vehicles
        this.vehicles = [];
        for (let i = 0; i < this.lanes.length; i++) {
            let lane = this.lanes[i];
            if (lane.type === 'road') {
                // Add 2-3 vehicles per road lane
                let n;
                // Level-based vehicle count
                if (this.level === 1) {
                    n = 2 + Math.floor(Math.random() * 1); // 2
                } else if (this.level === 2) {
                    n = 2 + Math.floor(Math.random() * 2); // 2-3
                } else if (this.level === 3) {
                    n = 3 + Math.floor(Math.random() * 2); // 3-4 for level 3
                } else if (this.level === 4) {
                    // Level 4: more vehicles for challenge
                    n = 4 + Math.floor(Math.random() * 2); // 4-5 for level 4
                } else if (this.level === 5) {
                    // Level 5: same as level 4 for now (could customize)
                    n = 4 + Math.floor(Math.random() * 2); // 4-5 for level 5
                } else if (this.level === 6) {
                    n = 5 + Math.floor(Math.random() * 2); // 5-6 for level 6
                } else {
                    n = 4 + Math.floor(Math.random() * 2); // fallback
                }
                for (let k = 0; k < n; k++) {
                    let dir = (i % 2 === 0) ? 1 : -1;
                    let type;
                    // Level-based vehicle types
                    if (this.level === 2) {
                        // Level 2: ONLY horse and buggy (buggy) and covered wagon (wagon)
                        let r = Math.random();
                        if (r < 0.6) type = 'buggy';
                        else type = 'wagon';
                        // No cars or trucks in level 2
                    } else if (this.level === 3) {
                        // Level 3: ALL FOXES (was 'wolf')
                        type = 'fox';
                    } else if (this.level === 4) {
                        // Level 4: custom sprite obstacles
                        type = 'level4sprite';
                    } else if (this.level === 5) {
                        // Level 5: use level4sprite for now (could customize)
                        type = 'level4sprite';
                    } else if (this.level === 6) {
                        // Level 6: foxes and cars mixed
                        type = (Math.random() < 0.5) ? 'fox' : 'car';
                    } else {
                        type = (Math.random() < 0.7) ? 'car' : 'truck';
                    }
                    // Level-based speed
                    let baseSpeed = 2.1 + 1.2 * Math.random() + 0.3 * i;
                    let speed;
                    if (this.level === 1) {
                        speed = baseSpeed + Math.random() * 0.2;
                    } else if (this.level === 2) {
                        speed = baseSpeed + 0.5 + Math.random() * 0.4;
                    } else if (this.level === 3) {
                        speed = baseSpeed + 1.0 + Math.random() * 0.7;
                    } else if (this.level === 4) {
                        // Level 4: SLOWER vehicles per user request
                        speed = (baseSpeed + 1.7 + Math.random() * 1.1) * 0.55; // <--- SLOW DOWN by 45%
                    } else if (this.level === 5) {
                        // Level 5: same as level 4 for now (could customize)
                        speed = (baseSpeed + 1.7 + Math.random() * 1.1) * 0.55;
                    } else if (this.level === 6) {
                        speed = (baseSpeed + 2.2 + Math.random() * 1.3) * 0.65;
                    } else {
                        speed = baseSpeed + 1.0 + Math.random() * 0.7;
                    }
                    this.vehicles.push(new window.VehicleObstacle(
                        lane.y, dir, speed, type, this.laneHeight, this.canvas.width
                    ));
                }
            }
        }
        // Tokens
        this.tokens = [];
        for (let i = 0; i < this.lanes.length; i++) {
            let lane = this.lanes[i];
            if (lane.type === 'road') {
                // Place tokens per road lane, random x position, not overlapping vehicles
                let numTokens;
                if (this.level === 1) numTokens = 3;
                else if (this.level === 2) numTokens = 2;
                else if (this.level === 3) numTokens = 1 + Math.floor(Math.random() * 2); // 1-2 in level 3
                else if (this.level === 4) numTokens = 1; // Level 4: only 1 token per lane for extra challenge
                else if (this.level === 5) numTokens = 1;
                else if (this.level === 6) numTokens = 1;
                else numTokens = 1; // fallback
                let placed = 0;
                let attempts = 0;
                while (placed < numTokens && attempts < 12) {
                    attempts++;
                    let tokenSize = 28;
                    let minX = 24, maxX = this.canvas.width - tokenSize - 24;
                    let tx = minX + Math.random() * (maxX - minX);
                    let ty = lane.y + (this.laneHeight - tokenSize) / 2;
                    // Avoid overlap with other tokens in same lane
                    let overlap = this.tokens.some(t =>
                        Math.abs(t.x - tx) < tokenSize + 6 && Math.abs(t.y - ty) < tokenSize + 6
                    );
                    if (!overlap) {
                        this.tokens.push({
                            x: tx,
                            y: ty,
                            w: tokenSize,
                            h: tokenSize,
                            collected: false
                        });
                        placed++;
                    }
                }
            }
        }
        // Exit: REMOVE exit sign entirely
        this.exit = null;
        // Renderer
        this.renderer = new window.Renderer(this.canvas, this.lanes, this.player, this.vehicles, this.tokens, this.exit, this.level);
        // Scoring
        this.scoringSystem.reset();
        // Input
        this.inputHandler.enable();
        this._gameActive = true;
        this._gameOver = false;
        this._waitingForNextLevel = false; // Reset waiting state
        // Focus canvas for keyboard input
        this.canvas.focus();
    }

    _initMenu() {
        this.stateManager.setState('menu');
        this.lives = 3; // Reset lives when going to menu
        this.uiManager.showMenu(() => {
            this.level = 1; // Always start at level 1 from menu
            this.lives = 3; // Reset lives on new game
            this.startGame();
        });
    }

    startGame() {
        this.stateManager.setState('game');
        this._setupGame();
        this.uiManager.clearAll();
        this._frameRequest = requestAnimationFrame(ts => this._gameLoop(ts));
        // Focus canvas for keyboard input
        this.canvas.focus();
    }

    _gameLoop(timestamp) {
        if (this.stateManager.getState() !== 'game') return;

        // If waiting for next level, do not update game, just render and wait for user input
        if (this._waitingForNextLevel) {
            this.renderer.renderAll();
            this.uiManager.showScore(this.scoringSystem.score, this.level - 1, this.lives); // Show previous level
            // Wait for user to click button or press Enter
            return;
        }

        // Timing
        if (!this._lastTimestamp) this._lastTimestamp = timestamp;
        let dt = Math.min(32, timestamp - this._lastTimestamp);
        this._lastTimestamp = timestamp;
        // Update input
        let dir = this.inputHandler.getDirection();
        if (dir && !this.player.moving && this.player.alive) {
            this.player.move(dir, this.gridSize, {
                left: 0, right: this.canvas.width,
                top: 0, bottom: this.canvas.height
            });
            this.audioManager.playJump();
        }
        // Update player and vehicles
        this.player.update();
        for (let v of this.vehicles) v.update();

        // Check collisions (with vehicles)
        if (this.player.alive && !this.player.moving) {
            for (let v of this.vehicles) {
                if (window.CollisionSystem.checkCollision(this.player.getBounds(), v.getBounds())) {
                    this.player.alive = false;
                    this.audioManager.playCrash();

                    // --- LIVES SYSTEM ---
                    this.lives -= 1;
                    if (this.lives > 0) {
                        // Respawn after short delay
                        setTimeout(() => {
                            this.player.reset(this.startX, this.startY);
                            this.player.alive = true;
                            // No need to reset tokens or vehicles
                            this.inputHandler.enable();
                        }, 700);
                        // Prevent input during respawn delay
                        this.inputHandler.disable();
                    } else {
                        // Game over
                        this._gameOver = true;
                        setTimeout(() => this._endGame(), 600);
                    }
                    break;
                }
            }
        }

        // Token collection
        let collectedThisFrame = false;
        for (let token of this.tokens) {
            if (!token.collected && window.CollisionSystem.checkCollision(this.player.getBounds(), token)) {
                token.collected = true;
                collectedThisFrame = true;
            }
        }
        if (collectedThisFrame) {
            // Play a sound for token pickup (reuse jump for now)
            this.audioManager.playJump();
        }

        // --- USER REQUEST: Level progression when chicken crosses all roads and makes it to the safe zone (finish lane) ---

        // Find the finish lane (safe zone)
        let finishLane = null;
        for (let i = this.lanes.length - 1; i >= 0; i--) {
            if (this.lanes[i].type === 'finish') {
                finishLane = this.lanes[i];
                break;
            }
        }

        // --- LEVEL 4: Level progression when chicken crosses all roads and makes it to the safe zone ---
        if (
            this.level === 4 &&
            this.player.alive &&
            !this.player.moving &&
            finishLane
        ) {
            let playerBounds = this.player.getBounds();
            // If any part of the player is in the finish lane, show next level overlay
            if (
                playerBounds.y + playerBounds.h > finishLane.y &&
                playerBounds.y < finishLane.y + finishLane.height
            ) {
                this.audioManager.playWin && this.audioManager.playWin();
                this._waitingForNextLevel = true;
                this.inputHandler.disable();
                this.uiManager.showNextLevel(5, () => {
                    this.level = 5;
                    this.lives = 3; // <--- RESET LIVES TO 3 ON NEXT LEVEL
                    this._waitingForNextLevel = false;
                    this.inputHandler.enable();
                    this._setupGame();
                    this.uiManager.clearAll();
                    this._frameRequest = requestAnimationFrame(ts => this._gameLoop(ts));
                });
                // Listen for Enter key
                this._nextLevelKeyListener = (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (this._waitingForNextLevel) {
                            this.level = 5;
                            this.lives = 3; // <--- RESET LIVES TO 3 ON NEXT LEVEL
                            this._waitingForNextLevel = false;
                            this.inputHandler.enable();
                            this.uiManager.clearAll();
                            this._setupGame();
                            this._frameRequest = requestAnimationFrame(ts => this._gameLoop(ts));
                            document.removeEventListener('keydown', this._nextLevelKeyListener);
                        }
                    }
                };
                document.addEventListener('keydown', this._nextLevelKeyListener);
                return;
            }
        }

        // --- LEVEL 5: Level progression when chicken crosses all roads and makes it to the safe zone ---
        if (
            this.level === 5 &&
            this.player.alive &&
            !this.player.moving &&
            finishLane
        ) {
            let playerBounds = this.player.getBounds();
            // If any part of the player is in the finish lane, show next level overlay (to level 6)
            if (
                playerBounds.y + playerBounds.h > finishLane.y &&
                playerBounds.y < finishLane.y + finishLane.height
            ) {
                this.audioManager.playWin && this.audioManager.playWin();
                this._waitingForNextLevel = true;
                this.inputHandler.disable();
                this.uiManager.showNextLevel(6, () => {
                    this.level = 6;
                    this.lives = 3;
                    this._waitingForNextLevel = false;
                    this.inputHandler.enable();
                    this._setupGame();
                    this.uiManager.clearAll();
                    this._frameRequest = requestAnimationFrame(ts => this._gameLoop(ts));
                });
                this._nextLevelKeyListener = (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (this._waitingForNextLevel) {
                            this.level = 6;
                            this.lives = 3;
                            this._waitingForNextLevel = false;
                            this.inputHandler.enable();
                            this.uiManager.clearAll();
                            this._setupGame();
                            this._frameRequest = requestAnimationFrame(ts => this._gameLoop(ts));
                            document.removeEventListener('keydown', this._nextLevelKeyListener);
                        }
                    }
                };
                document.addEventListener('keydown', this._nextLevelKeyListener);
                return;
            }
        }

        // --- LEVEL 6 ZONE HANDLING ---
        if (
            this.level === 6 &&
            this.player.alive &&
            !this.player.moving
        ) {
            let zoneHeight = 36;
            let playerBounds = this.player.getBounds();
            let zoneY = this.canvas.height - zoneHeight;
            if (
                playerBounds.y + playerBounds.h > zoneY &&
                playerBounds.y < this.canvas.height
            ) {
                // End game as win (level 6 is the last)
                this.audioManager.playWin && this.audioManager.playWin();
                setTimeout(() => this._endGame(true), 400);
                return;
            }
        }

        // --- Existing finish lane progression for all other levels except 4->5, 5->6 ---
        if (
            finishLane &&
            this.player.alive &&
            !this.player.moving &&
            this.level < this.maxLevel &&
            ![4,5].includes(this.level) // skip for levels handled above
        ) {
            let playerBounds = this.player.getBounds();
            // If any part of the player is in the finish lane, show next level overlay
            if (
                playerBounds.y + playerBounds.h > finishLane.y &&
                playerBounds.y < finishLane.y + finishLane.height
            ) {
                this.audioManager.playWin && this.audioManager.playWin();
                this._waitingForNextLevel = true;
                this.inputHandler.disable();
                this.uiManager.showNextLevel(this.level + 1, () => {
                    this.level += 1;
                    this.lives = 3; // <--- RESET LIVES TO 3 ON NEXT LEVEL
                    this._waitingForNextLevel = false;
                    this.inputHandler.enable();
                    this._setupGame();
                    this.uiManager.clearAll();
                    this._frameRequest = requestAnimationFrame(ts => this._gameLoop(ts));
                });
                // Listen for Enter key
                this._nextLevelKeyListener = (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        if (this._waitingForNextLevel) {
                            this.level += 1;
                            this.lives = 3; // <--- RESET LIVES TO 3 ON NEXT LEVEL
                            this._waitingForNextLevel = false;
                            this.inputHandler.enable();
                            this.uiManager.clearAll();
                            this._setupGame();
                            this._frameRequest = requestAnimationFrame(ts => this._gameLoop(ts));
                            document.removeEventListener('keydown', this._nextLevelKeyListener);
                        }
                    }
                };
                document.addEventListener('keydown', this._nextLevelKeyListener);
                return;
            }
        }

        // If player reaches finish lane on last level, show win screen
        if (
            finishLane &&
            this.player.alive &&
            !this.player.moving &&
            this.level === this.maxLevel
        ) {
            let playerBounds = this.player.getBounds();
            if (
                playerBounds.y + playerBounds.h > finishLane.y &&
                playerBounds.y < finishLane.y + finishLane.height
            ) {
                // End game as win
                this.audioManager.playWin && this.audioManager.playWin();
                setTimeout(() => this._endGame(true), 400);
                return;
            }
        }

        // Update scoring: score = number of tokens collected
        let tokensCollected = this.tokens.filter(t => t.collected).length;
        this.scoringSystem.setScore(tokensCollected);

        // Render everything
        this.renderer.renderAll();
        this.uiManager.showScore(this.scoringSystem.score, this.level, this.lives);

        // Always continue game loop (never set _gameOver)
        this._frameRequest = requestAnimationFrame(ts => this._gameLoop(ts));
    }

    _endGame(won = false) {
        this.stateManager.setState('gameover');
        this.inputHandler.disable();
        this._gameActive = false;
        // Show overlay
        let score = this.scoringSystem.score;
        this.uiManager.showGameOver(score, () => {
            this.level = 1;
            this.lives = 3; // Reset lives on restart
            this.startGame();
        }, this.level, this.maxLevel, this.lives);
    }
}
window.GameLoop = GameLoop;
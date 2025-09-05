class Renderer {
    constructor(canvas, lanes, player, vehicles, tokens, exit, level) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lanes = lanes;
        this.player = player;
        this.vehicles = vehicles;
        this.tokens = tokens || [];
        this.exit = null; // REMOVE exit object entirely
        this.level = level || 1;  // NEW: level number
        this._canvasW = canvas.width;
        this._canvasH = canvas.height;

        // --- Volume Bar State ---
        // Move the volume bar OFF the game canvas and onto the general overlay/canvas
        // We'll create a floating HTML control instead of drawing it on the game canvas
        this._volumeBar = null; // No longer used for drawing

        // For referencing AudioManager
        this._audioManager = window.gameLoop ? window.gameLoop.audioManager : null;

        // --- Volume Bar HTML Overlay ---
        this._createVolumeBarOverlay();
    }

    // --- Volume Bar HTML Overlay ---
    _createVolumeBarOverlay() {
        // Remove existing if present
        let old = document.getElementById('volume-bar-overlay');
        if (old) old.remove();

        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'volume-bar-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '24px';
        overlay.style.right = '32px';
        overlay.style.zIndex = '50';
        overlay.style.background = 'rgba(255,255,255,0.96)';
        overlay.style.borderRadius = '12px';
        overlay.style.boxShadow = '0 2px 10px 0 rgba(0,0,0,0.10)';
        overlay.style.padding = '7px 18px 7px 16px';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.userSelect = 'none';
        overlay.style.minWidth = '160px';
        overlay.style.maxWidth = '260px';
        overlay.style.fontFamily = 'Arial, sans-serif';

        // Speaker icon
        const icon = document.createElement('span');
        icon.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 22 22" style="vertical-align:middle">
                <g>
                    <polygon points="3,8 8,8 13,3 13,19 8,14 3,14" fill="#ffe970" stroke="#e1b900" stroke-width="1.4"/>
                    <path d="M16 7 Q18 11 16 15" fill="none" stroke="#e1b900" stroke-width="2" stroke-linecap="round"/>
                    <path d="M18 5 Q21 11 18 17" fill="none" stroke="#e1b900" stroke-width="1.4" stroke-linecap="round"/>
                </g>
            </svg>
        `;
        icon.style.marginRight = '10px';
        overlay.appendChild(icon);

        // Label
        const label = document.createElement('span');
        label.textContent = 'Volume';
        label.style.fontWeight = 'bold';
        label.style.fontSize = '1rem';
        label.style.color = '#333';
        label.style.marginRight = '12px';
        overlay.appendChild(label);

        // Range input
        const range = document.createElement('input');
        range.type = 'range';
        range.min = '0';
        range.max = '1';
        range.step = '0.01';
        range.value = (this._audioManager && typeof this._audioManager._bgmVolume === "number")
            ? this._audioManager._bgmVolume
            : 0.18;
        range.style.width = '90px';
        range.style.marginRight = '0px';
        range.style.accentColor = '#ffe970';
        range.style.verticalAlign = 'middle';
        overlay.appendChild(range);

        // Mute button
        const muteBtn = document.createElement('button');
        muteBtn.textContent = '🔇';
        muteBtn.title = 'Mute/Unmute';
        muteBtn.style.marginLeft = '10px';
        muteBtn.style.border = 'none';
        muteBtn.style.background = 'none';
        muteBtn.style.fontSize = '1.25rem';
        muteBtn.style.cursor = 'pointer';
        muteBtn.style.opacity = '0.80';
        muteBtn.style.transition = 'opacity 0.15s';
        muteBtn.style.outline = 'none';
        overlay.appendChild(muteBtn);

        // Sync mute icon state
        const syncMuteIcon = () => {
            let vol = parseFloat(range.value);
            muteBtn.textContent = vol <= 0.01 ? '🔈' : '🔇';
        };

        // Volume change handler
        range.addEventListener('input', (e) => {
            let vol = parseFloat(range.value);
            if (this._audioManager) {
                this._audioManager.setBGMVolume(vol);
                this._audioManager.vol = vol;
            }
            syncMuteIcon();
        });

        // Mute/unmute handler
        muteBtn.addEventListener('click', () => {
            let vol = parseFloat(range.value);
            if (vol > 0.01) {
                // Mute
                range.value = 0;
            } else {
                // Unmute to previous or default
                range.value = 0.18;
            }
            range.dispatchEvent(new Event('input'));
        });

        // Initial icon state
        syncMuteIcon();

        // Attach to body (not to canvas or overlay)
        document.body.appendChild(overlay);

        // Save reference for later removal if needed
        this._volumeBarOverlay = overlay;
    }

    // --- END Volume Bar Handlers ---

    renderBG() {
        // Sky
        let ctx = this.ctx, w = this._canvasW, h = this._canvasH;
        // Level-based sky
        if (this.level === 2) {
            // Level 2: sepia/old-timey sky
            let grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, "hsl(36, 45%, 85%)");
            grad.addColorStop(1, "hsl(36, 60%, 65%)");
            ctx.fillStyle = grad;
        } else if (this.level === 3) {
            // Level 3: NIGHT TIME THEME
            let grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, "hsl(220, 60%, 18%)");
            grad.addColorStop(1, "hsl(220, 70%, 6%)");
            ctx.fillStyle = grad;
        } else {
            let grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, "hsl(210,80%,85%)");
            grad.addColorStop(1, "hsl(120,60%,85%)");
            ctx.fillStyle = grad;
        }
        ctx.fillRect(0, 0, w, h);

        // Animated cloud blobs or night elements
        let t = Date.now() / 750.0;
        if (this.level === 3) {
            // Night sky: draw moon and stars
            // Moon
            ctx.save();
            ctx.globalAlpha = 0.82;
            ctx.beginPath();
            ctx.arc(w * 0.18, h * 0.14, 44, 0, 2 * Math.PI);
            let moonGrad = ctx.createRadialGradient(w * 0.18, h * 0.14, 10, w * 0.18, h * 0.14, 44);
            moonGrad.addColorStop(0, "#fffbe0");
            moonGrad.addColorStop(1, "#e7e5d0");
            ctx.fillStyle = moonGrad;
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 18;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();

            // Crescent shadow (to make moon crescent)
            ctx.save();
            ctx.globalAlpha = 0.23;
            ctx.beginPath();
            ctx.arc(w * 0.18 + 18, h * 0.14 - 8, 38, 0, 2 * Math.PI);
            ctx.fillStyle = "hsl(220, 70%, 10%)";
            ctx.fill();
            ctx.restore();

            // Stars
            ctx.save();
            ctx.globalAlpha = 0.7;
            let starCount = 36;
            for (let i = 0; i < starCount; i++) {
                let sx = Math.random() * w;
                let sy = Math.random() * h * 0.5;
                let r = Math.random() * 1.2 + 0.7;
                ctx.beginPath();
                ctx.arc(sx, sy, r, 0, 2 * Math.PI);
                ctx.fillStyle = "#fffbe0";
                ctx.fill();
            }
            ctx.restore();
        } else {
            // Animated cloud blobs (levels 1/2)
            for (let i = 0; i < 3; i++) {
                let cx = 120 + i * 120 + 30 * Math.sin(t + i), cy = 34 + 14 * Math.cos(t * 0.85 + i);
                ctx.save();
                ctx.globalAlpha = 0.12 + 0.07 * Math.abs(Math.sin(t + i));
                ctx.beginPath();
                ctx.ellipse(cx, cy, 54 + 9 * i, 24 + 6 * i, 0, 0, 2 * Math.PI);
                // Level-based clouds
                if (this.level === 2) {
                    ctx.fillStyle = "#f8ecd0";
                } else {
                    ctx.fillStyle = "#fff";
                }
                ctx.fill();
                ctx.restore();
            }
        }
    }

    renderLanes() {
        let ctx = this.ctx, w = this._canvasW;
        for (let lane of this.lanes) {
            // Level-based lane rendering
            if (this.level === 2 && lane.type === 'road') {
                // Level 2: dirt road
                ctx.save();
                let grad = ctx.createLinearGradient(0, lane.y, 0, lane.y + lane.height);
                grad.addColorStop(0, "hsl(36, 37%, 70%)");
                grad.addColorStop(1, "hsl(36, 37%, 62%)");
                ctx.fillStyle = grad;
                ctx.fillRect(0, lane.y, w, lane.height);

                // Faint wheel ruts
                ctx.globalAlpha = 0.16;
                ctx.strokeStyle = "#b89d6e";
                ctx.lineWidth = 4.5;
                for (let x = 50; x < w; x += 70) {
                    ctx.beginPath();
                    ctx.moveTo(x, lane.y + 12);
                    ctx.lineTo(x, lane.y + lane.height - 12);
                    ctx.stroke();
                }
                ctx.globalAlpha = 1.0;
                ctx.restore();
                // Draw subtle shadow between lanes
                ctx.save();
                ctx.globalAlpha = 0.16;
                ctx.fillStyle = "#333";
                ctx.fillRect(0, lane.y + lane.height - 2, w, 2);
                ctx.restore();
            } else if (this.level === 3 && lane.type === 'road') {
                // Level 3: dark night road
                ctx.save();
                let grad = ctx.createLinearGradient(0, lane.y, 0, lane.y + lane.height);
                grad.addColorStop(0, "hsl(220, 16%, 18%)");
                grad.addColorStop(1, "hsl(220, 18%, 12%)");
                ctx.fillStyle = grad;
                ctx.fillRect(0, lane.y, w, lane.height);

                // Faint "moonlit" shimmer
                ctx.save();
                ctx.globalAlpha = 0.08;
                ctx.fillStyle = "#fffbe0";
                ctx.fillRect(0, lane.y, w, lane.height * 0.45);
                ctx.restore();

                // Lane markers: faint, bluish
                ctx.save();
                ctx.strokeStyle = "hsl(220, 40%, 36%)";
                ctx.lineWidth = 3.5;
                ctx.setLineDash([16, 18]);
                ctx.beginPath();
                ctx.moveTo(18, lane.y + lane.height / 2);
                ctx.lineTo(w - 18, lane.y + lane.height / 2);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.restore();

                ctx.restore();
                // Draw subtle shadow between lanes
                ctx.save();
                ctx.globalAlpha = 0.16;
                ctx.fillStyle = "#333";
                ctx.fillRect(0, lane.y + lane.height - 2, w, 2);
                ctx.restore();
            } else {
                lane.draw(ctx, w);
            }
        }

        // --- Draw Level 2 Zone at bottom of screen ---
        // Only on level 1, show the zone at the bottom
        if (this.level === 1) {
            let zoneHeight = 36;
            let y = this._canvasH - zoneHeight;
            ctx.save();
            ctx.globalAlpha = 0.23;
            ctx.fillStyle = "#7c5bff";
            ctx.fillRect(0, y, this._canvasW, zoneHeight);

            ctx.globalAlpha = 1.0;
            ctx.font = "bold 22px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "#222";
            ctx.shadowBlur = 2;
            ctx.fillText("LEVEL 2 ZONE", this._canvasW / 2, y + zoneHeight / 2);
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // --- Draw Level 3 Zone at bottom of screen ---
        // Only on level 2, show the zone at the bottom (for next level)
        if (this.level === 2) {
            let zoneHeight = 36;
            let y = this._canvasH - zoneHeight;
            ctx.save();
            ctx.globalAlpha = 0.23;
            ctx.fillStyle = "#ff7c3a";
            ctx.fillRect(0, y, this._canvasW, zoneHeight);

            ctx.globalAlpha = 1.0;
            ctx.font = "bold 22px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "#222";
            ctx.shadowBlur = 2;
            ctx.fillText("LEVEL 3 ZONE", this._canvasW / 2, y + zoneHeight / 2);
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // --- Draw Level 4 Zone at bottom of screen after level 3 ---
        // Only on level 3, show the "Level 4 Zone" message at the bottom
        if (this.level === 3) {
            let zoneHeight = 36;
            let y = this._canvasH - zoneHeight;
            ctx.save();
            ctx.globalAlpha = 0.23;
            ctx.fillStyle = "#00b3b3";
            ctx.fillRect(0, y, this._canvasW, zoneHeight);

            ctx.globalAlpha = 1.0;
            ctx.font = "bold 22px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "#222";
            ctx.shadowBlur = 2;
            ctx.fillText("LEVEL 4 ZONE", this._canvasW / 2, y + zoneHeight / 2);
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // --- Draw Level 5 Zone at bottom of screen on level 4 ---
        if (this.level === 4) {
            let zoneHeight = 36;
            let y = this._canvasH - zoneHeight;
            ctx.save();
            ctx.globalAlpha = 0.23;
            ctx.fillStyle = "#ff3ad7";
            ctx.fillRect(0, y, this._canvasW, zoneHeight);

            ctx.globalAlpha = 1.0;
            ctx.font = "bold 22px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "#222";
            ctx.shadowBlur = 2;
            ctx.fillText("LEVEL 5 ZONE", this._canvasW / 2, y + zoneHeight / 2);
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // --- Draw Level 6 Zone at bottom of screen on level 5 ---
        if (this.level === 5) {
            let zoneHeight = 36;
            let y = this._canvasH - zoneHeight;
            ctx.save();
            ctx.globalAlpha = 0.23;
            ctx.fillStyle = "#3affb3";
            ctx.fillRect(0, y, this._canvasW, zoneHeight);

            ctx.globalAlpha = 1.0;
            ctx.font = "bold 22px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.shadowColor = "#222";
            ctx.shadowBlur = 2;
            ctx.fillText("LEVEL 6 ZONE", this._canvasW / 2, y + zoneHeight / 2);
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }

    renderVehicles() {
        for (let v of this.vehicles) v.draw(this.ctx, this.level);
    }

    renderTokens() {
        let ctx = this.ctx;
        for (let token of this.tokens) {
            if (token.collected) continue;
            ctx.save();
            ctx.translate(token.x + token.w / 2, token.y + token.h / 2);

            // Shadow
            ctx.save();
            ctx.globalAlpha = 0.18;
            ctx.scale(1.1, 0.36);
            ctx.beginPath();
            ctx.arc(0, token.h * 0.7, token.w * 0.38, 0, 2 * Math.PI);
            ctx.fillStyle = "#222";
            ctx.fill();
            ctx.restore();

            // Main coin body (make it look more like a real coin/token)
            let grad = ctx.createRadialGradient(0, -token.h * 0.14, token.w * 0.13, 0, 0, token.w * 0.48);
            grad.addColorStop(0, "#fffbe0");
            grad.addColorStop(0.18, "#ffe970");
            grad.addColorStop(0.45, "#ffe04a");
            grad.addColorStop(0.7, "#ffe04a");
            grad.addColorStop(1, "#e1b900");
            ctx.beginPath();
            ctx.ellipse(0, 0, token.w * 0.48, token.h * 0.48, 0, 0, 2 * Math.PI);
            ctx.fillStyle = grad;
            ctx.shadowColor = "#ffe970";
            ctx.shadowBlur = 10;
            ctx.fill();

            // Coin edge (rim with inner shadow for depth)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, 0, token.w * 0.48, token.h * 0.48, 0, 0, 2 * Math.PI);
            ctx.lineWidth = 4.1;
            ctx.strokeStyle = "#e1b900";
            ctx.globalAlpha = 0.93;
            ctx.shadowColor = "#e1b900";
            ctx.shadowBlur = 2.5;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
            ctx.restore();

            // Coin inner rim (darker)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, 0, token.w * 0.39, token.h * 0.39, 0, 0, 2 * Math.PI);
            ctx.lineWidth = 2.2;
            ctx.strokeStyle = "#c6a400";
            ctx.globalAlpha = 0.42;
            ctx.stroke();
            ctx.restore();

            // Coin edge notches (make it look like a real token/coin)
            ctx.save();
            ctx.rotate(Math.PI / 10);
            for (let i = 0; i < 18; i++) {
                let angle = (i / 18) * 2 * Math.PI;
                let r1 = token.w * 0.48;
                let r2 = token.w * 0.44;
                let x1 = Math.cos(angle) * r1, y1 = Math.sin(angle) * r1;
                let x2 = Math.cos(angle) * r2, y2 = Math.sin(angle) * r2;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = 2.1;
                ctx.strokeStyle = "#ffe970";
                ctx.globalAlpha = 0.62;
                ctx.stroke();
            }
            ctx.restore();

            // Embossed symbol: Dollar sign ($) to look like a token
            ctx.save();
            ctx.globalAlpha = 0.88;
            ctx.lineWidth = 3.1;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = "#fffbe0";
            ctx.shadowColor = "#ffe970";
            ctx.shadowBlur = 2.5;
            ctx.beginPath();
            // Draw $
            let s = token.w * 0.16;
            ctx.moveTo(-s * 0.55, -s * 0.7);
            ctx.bezierCurveTo(s * 0.6, -s * 1.05, s * 0.6, s * 1.05, -s * 0.55, s * 0.7);
            ctx.moveTo(0, -s * 1.1);
            ctx.lineTo(0, s * 1.1);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();

            // Optional: subtle highlight
            ctx.save();
            ctx.globalAlpha = 0.16;
            ctx.beginPath();
            ctx.ellipse(-token.w * 0.12, -token.h * 0.19, token.w * 0.18, token.h * 0.09, -0.5, 0, 2 * Math.PI);
            ctx.fillStyle = "#fff";
            ctx.fill();
            ctx.restore();

            ctx.restore();
        }
    }

    renderExit() {
        // REMOVE exit rendering entirely
        return;
    }

    renderPlayer() {
        this.player.draw(this.ctx);
    }

    // Remove renderVolumeBar from the game canvas
    renderVolumeBar() {
        // NO-OP: Volume bar is now an HTML overlay, not drawn on canvas
    }

    renderAll() {
        this.renderBG();
        this.renderLanes();
        this.renderVehicles();
        this.renderTokens();
        // this.renderExit(); // REMOVE exit rendering call
        this.renderPlayer();
        // this.renderVolumeBar(); // REMOVE canvas volume bar
    }
}
window.Renderer = Renderer;
class VehicleObstacle {
    /**
     * dir: 1 (L->R), -1 (R->L)
     * speed: px/frame
     * type: 'car', 'truck', etc.
     */
    constructor(laneY, dir, speed, type, laneW, canvasW) {
        this.laneY = laneY;
        // --- LEVEL 4: Custom sprite characters ---
        if (type === 'level4sprite') {
            this.width = 64;
            this.height = 64;
        } else if (type === 'buggy' || type === 'wagon') {
            this.width = (type === 'buggy') ? 70 : 92;
            this.height = (type === 'buggy') ? 34 : 38;
        } else if (type === 'wolf' || type === 'fox') {
            this.width = 64;
            this.height = 34;
        } else {
            this.width = (type === 'car') ? 58 : 84;
            this.height = (type === 'car') ? 34 : 36;
        }
        this.type = type;
        this.dir = dir;
        this.speed = speed;
        this.laneWidth = laneW;
        this.canvasW = canvasW;
        // Spawn offscreen
        this.x = dir === 1 ? -this.width - Math.random() * 120 : canvasW + Math.random() * 120;
        this.y = laneY + (laneW - this.height) / 2;

        // Sprite image for level 4
        if (type === 'level4sprite') {
            if (!window._level4SpriteImg) {
                window._level4SpriteImg = new window.Image();
                window._level4SpriteImg.src = "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/620dfb9b-13c8-4733-a462-aea820328b33/library/Ferdy__1756820722593.png";
            }
            this.spriteImg = window._level4SpriteImg;
        }

        // Color
        if (type === 'buggy') {
            this.bodyColor = "hsl(36, 37%, 62%)";
            this.tireColor = "#442b13";
        } else if (type === 'wagon') {
            this.bodyColor = "hsl(36, 25%, 54%)";
            this.tireColor = "#442b13";
        } else if (type === 'wolf' || type === 'fox') {
            // Fox colors (brighter and more orange for visibility)
            this.bodyColor = "#ff9933";
            this.legColor = "#b85c00";
            this.eyeColor = "#fffbe0";
            this.pupilColor = "#222";
            this.noseColor = "#222";
            this.earColor = "#ffb366";
            this.shadowColor = "#222";
            this.muzzleColor = "#fffbe0";
            this.furAccent = "#e67a00";
            this.innerEarColor = "#fffbe0";
            this.tongueColor = "#c96a6a";
            this.clawColor = "#fffbe0";
        } else {
            this.bodyColor = (type === 'car')
                ? (Math.random() < 0.5 ? "hsl(2,85%,60%)" : "hsl(210,80%,60%)")
                : "hsl(50,95%,62%)";
            this.tireColor = "#111";
        }
    }

    update() {
        this.x += this.dir * this.speed;
        // If fully offscreen, move to the other side
        if (this.dir === 1 && this.x > this.canvasW + 40) {
            this.x = -this.width - Math.random() * 60;
        } else if (this.dir === -1 && this.x < -this.width - 40) {
            this.x = this.canvasW + Math.random() * 60;
        }
    }

    draw(ctx, level = 1) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Drop shadow
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#222";
        ctx.beginPath();
        ctx.ellipse(this.width / 2, this.height * 0.90, this.width * 0.38, this.height * 0.18, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();

        // --- LEVEL 4: Draw sprite image ---
        if (this.type === 'level4sprite') {
            ctx.save();
            // Flip horizontally for dir == -1
            if (this.dir === -1) {
                ctx.translate(this.width, 0);
                ctx.scale(-1, 1);
            }
            // Only draw if loaded
            if (this.spriteImg && this.spriteImg.complete) {
                ctx.drawImage(this.spriteImg, 0, 0, this.width, this.height);
            } else {
                // Placeholder: colored box
                ctx.fillStyle = "#888";
                ctx.fillRect(0, 0, this.width, this.height);
            }
            ctx.restore();
            ctx.restore();
            return;
        }

        if (this.type === 'car') {
            // --- CAR DRAWING ---
            // Main body
            ctx.save();
            ctx.shadowColor = "#222";
            ctx.shadowBlur = 3;
            ctx.lineJoin = "round";

            // Draw car body with hood, cabin, trunk
            ctx.beginPath();
            // Hood
            ctx.moveTo(7, this.height * 0.65);
            ctx.quadraticCurveTo(2, this.height * 0.25, 18, 8);
            // Left side
            ctx.lineTo(this.width - 18, 8);
            // Trunk
            ctx.quadraticCurveTo(this.width - 2, this.height * 0.25, this.width - 7, this.height * 0.65);
            // Rear bumper
            ctx.lineTo(this.width - 7, this.height - 9);
            // Right side
            ctx.quadraticCurveTo(this.width - 2, this.height - 2, this.width - 18, this.height - 5);
            // Underbody
            ctx.lineTo(18, this.height - 5);
            // Front bumper
            ctx.quadraticCurveTo(2, this.height - 2, 7, this.height - 9);
            ctx.closePath();

            ctx.fillStyle = this.bodyColor;
            ctx.fill();
            ctx.restore();

            // Windows
            ctx.save();
            ctx.globalAlpha = 0.72;
            ctx.fillStyle = "#d0f2fc";
            ctx.beginPath();
            ctx.moveTo(20, 11);
            ctx.lineTo(this.width - 20, 11);
            ctx.lineTo(this.width - 27, this.height * 0.65);
            ctx.lineTo(27, this.height * 0.65);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Windshield
            ctx.save();
            ctx.globalAlpha = 0.65;
            ctx.fillStyle = "#b0e3f8";
            ctx.beginPath();
            ctx.moveTo(23, 11);
            ctx.lineTo(this.width - 23, 11);
            ctx.lineTo(this.width - 30, 19);
            ctx.lineTo(30, 19);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Headlights
            ctx.save();
            ctx.fillStyle = "#fffbe0";
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.ellipse(13, this.height - 7, 3.2, 2.1, 0, 0, 2 * Math.PI);
            ctx.ellipse(this.width - 13, this.height - 7, 3.2, 2.1, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            // Taillights
            ctx.save();
            ctx.fillStyle = "#ff5a36";
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.ellipse(13, 9, 2.1, 1.3, 0, 0, 2 * Math.PI);
            ctx.ellipse(this.width - 13, 9, 2.1, 1.3, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            // Side mirrors
            ctx.save();
            ctx.fillStyle = "#b0e3f8";
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.ellipse(7, 17, 1.7, 2.2, 0, 0, 2 * Math.PI);
            ctx.ellipse(this.width - 7, 17, 1.7, 2.2, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            // Tires
            ctx.save();
            ctx.fillStyle = this.tireColor;
            ctx.beginPath();
            ctx.ellipse(13, this.height - 3, 5, 3.2, 0, 0, 2 * Math.PI);
            ctx.ellipse(this.width - 13, this.height - 3, 5, 3.2, 0, 0, 2 * Math.PI);
            ctx.ellipse(13, 6, 5, 3.2, 0, 0, 2 * Math.PI);
            ctx.ellipse(this.width - 13, 6, 5, 3.2, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

        } else if (this.type === 'truck') {
            // --- TRUCK DRAWING ---
            // Main truck body (cab + cargo)
            ctx.save();
            ctx.shadowColor = "#222";
            ctx.shadowBlur = 3;
            ctx.lineJoin = "round";

            // Draw cargo box
            ctx.beginPath();
            ctx.moveTo(this.width * 0.36, 8);
            ctx.lineTo(this.width - 8, 8);
            ctx.lineTo(this.width - 8, this.height - 8);
            ctx.lineTo(this.width * 0.36, this.height - 8);
            ctx.closePath();
            ctx.fillStyle = "#fff";
            ctx.globalAlpha = 0.93;
            ctx.fill();

            // Draw cab
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.moveTo(8, 8);
            ctx.lineTo(this.width * 0.36, 8);
            ctx.lineTo(this.width * 0.36, this.height - 8);
            ctx.lineTo(8, this.height - 8);
            ctx.closePath();
            ctx.fillStyle = this.bodyColor;
            ctx.fill();

            // Draw cargo shadow line
            ctx.save();
            ctx.globalAlpha = 0.12;
            ctx.strokeStyle = "#888";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(this.width * 0.36, 10);
            ctx.lineTo(this.width * 0.36, this.height - 10);
            ctx.stroke();
            ctx.restore();

            ctx.restore();

            // Truck window
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = "#b0e3f8";
            ctx.beginPath();
            ctx.moveTo(13, 13);
            ctx.lineTo(this.width * 0.32, 13);
            ctx.lineTo(this.width * 0.32, this.height * 0.55);
            ctx.lineTo(13, this.height * 0.55);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Truck grill
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.fillStyle = "#bbb";
            ctx.fillRect(8, this.height - 13, this.width * 0.09, 7);
            ctx.restore();

            // Truck bumper
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.fillStyle = "#888";
            ctx.fillRect(5, this.height - 10, this.width * 0.08, 10);
            ctx.restore();

            // Headlights
            ctx.save();
            ctx.fillStyle = "#fffbe0";
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.ellipse(10, this.height - 7, 2.2, 2.1, 0, 0, 2 * Math.PI);
            ctx.ellipse(this.width * 0.36 - 4, this.height - 7, 2.2, 2.1, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            // Taillights
            ctx.save();
            ctx.fillStyle = "#ff5a36";
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.ellipse(this.width - 12, 11, 2.4, 1.6, 0, 0, 2 * Math.PI);
            ctx.ellipse(this.width - 12, this.height - 11, 2.4, 1.6, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            // Tires (bigger, more for truck)
            ctx.save();
            ctx.fillStyle = this.tireColor;
            ctx.beginPath();
            ctx.ellipse(16, this.height - 5, 5.5, 3.5, 0, 0, 2 * Math.PI);
            ctx.ellipse(this.width * 0.36 - 8, this.height - 5, 5.5, 3.5, 0, 0, 2 * Math.PI);
            ctx.ellipse(this.width * 0.36 + 14, this.height - 5, 5.5, 3.5, 0, 0, 2 * Math.PI);
            ctx.ellipse(this.width - 16, this.height - 5, 5.5, 3.5, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        } else if (this.type === 'buggy') {
            // --- HORSE AND BUGGY DRAWING (Level 2) ---
            // Wheels
            ctx.save();
            ctx.strokeStyle = this.tireColor;
            ctx.lineWidth = 3.2;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.arc(14, this.height - 2, 8, 0, 2 * Math.PI);
            ctx.arc(this.width - 14, this.height - 2, 8, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();

            // Buggy body
            ctx.save();
            ctx.fillStyle = this.bodyColor;
            ctx.globalAlpha = 0.92;
            ctx.beginPath();
            ctx.moveTo(12, 8);
            ctx.lineTo(this.width - 12, 8);
            ctx.lineTo(this.width - 6, this.height - 12);
            ctx.lineTo(6, this.height - 12);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Canopy
            ctx.save();
            ctx.fillStyle = "#fffbe0";
            ctx.globalAlpha = 0.77;
            ctx.beginPath();
            ctx.moveTo(16, 8);
            ctx.quadraticCurveTo(this.width / 2, -6, this.width - 16, 8);
            ctx.lineTo(this.width - 12, 8);
            ctx.lineTo(12, 8);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Shafts (for horse)
            ctx.save();
            ctx.strokeStyle = "#b89d6e";
            ctx.lineWidth = 2.2;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(this.width - 10, this.height - 10);
            ctx.lineTo(this.width, this.height + 10);
            ctx.moveTo(this.width - 18, this.height - 10);
            ctx.lineTo(this.width - 8, this.height + 10);
            ctx.stroke();
            ctx.restore();

            // Simple horse head (just a suggestion)
            ctx.save();
            ctx.globalAlpha = 0.88;
            ctx.fillStyle = "#b89d6e";
            ctx.beginPath();
            ctx.ellipse(this.width + 8, this.height + 8, 7, 12, -0.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

        } else if (this.type === 'wagon') {
            // --- COVERED WAGON DRAWING (Level 2) ---
            // Wheels
            ctx.save();
            ctx.strokeStyle = this.tireColor;
            ctx.lineWidth = 3.6;
            ctx.globalAlpha = 0.92;
            ctx.beginPath();
            ctx.arc(18, this.height - 2, 10, 0, 2 * Math.PI);
            ctx.arc(this.width - 18, this.height - 2, 10, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();

            // Wagon body
            ctx.save();
            ctx.fillStyle = this.bodyColor;
            ctx.globalAlpha = 0.92;
            ctx.beginPath();
            ctx.moveTo(20, this.height - 12);
            ctx.lineTo(this.width - 20, this.height - 12);
            ctx.lineTo(this.width - 14, this.height - 18);
            ctx.lineTo(14, this.height - 18);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Covered top
            ctx.save();
            ctx.fillStyle = "#fffbe0";
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.moveTo(14, this.height - 18);
            ctx.bezierCurveTo(10, 6, this.width - 10, 6, this.width - 14, this.height - 18);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Shafts (for oxen)
            ctx.save();
            ctx.strokeStyle = "#b89d6e";
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(this.width - 14, this.height - 18);
            ctx.lineTo(this.width + 10, this.height - 28);
            ctx.moveTo(this.width - 20, this.height - 12);
            ctx.lineTo(this.width + 4, this.height - 18);
            ctx.stroke();
            ctx.restore();

            // Simple ox head (just a suggestion)
            ctx.save();
            ctx.globalAlpha = 0.88;
            ctx.fillStyle = "#b89d6e";
            ctx.beginPath();
            ctx.ellipse(this.width + 12, this.height - 24, 8, 10, -0.5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        } else if (this.type === 'wolf' || this.type === 'fox') {
            // --- FOX DRAWING (Level 3, replaces wolf for visibility) ---
            // All colors are set in constructor

            // Flip fox for direction
            if (this.dir === -1) {
                ctx.translate(this.width, 0);
                ctx.scale(-1, 1);
            }

            // Draw shadow (already done above, but reinforce for night)
            ctx.save();
            ctx.globalAlpha = 0.33;
            ctx.fillStyle = this.shadowColor;
            ctx.beginPath();
            ctx.ellipse(this.width * 0.48, this.height * 0.97, this.width * 0.32, this.height * 0.19, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();

            // --- BODY ---
            ctx.save();
            ctx.globalAlpha = 0.99;
            ctx.lineJoin = "round";

            // Back leg (far, behind body)
            ctx.save();
            ctx.strokeStyle = this.furAccent;
            ctx.lineWidth = 3.2;
            ctx.globalAlpha = 0.72;
            ctx.beginPath();
            ctx.moveTo(this.width * 0.36, this.height * 0.78);
            ctx.lineTo(this.width * 0.34, this.height * 0.97);
            ctx.stroke();
            // Claw
            ctx.beginPath();
            ctx.arc(this.width * 0.34, this.height * 0.97, 1.2, 0, 2 * Math.PI);
            ctx.fillStyle = this.clawColor;
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.restore();

            // Tail (bushy, with fur tip)
            ctx.save();
            ctx.globalAlpha = 0.92;
            ctx.strokeStyle = "#e67a00";
            ctx.lineWidth = 6.0;
            ctx.beginPath();
            ctx.moveTo(this.width * 0.18, this.height * 0.67);
            ctx.quadraticCurveTo(this.width * 0.03, this.height * 0.60, this.width * 0.09, this.height * 0.90);
            ctx.stroke();

            // Tail tip (lighter)
            ctx.save();
            ctx.globalAlpha = 0.93;
            ctx.beginPath();
            ctx.ellipse(this.width * 0.08, this.height * 0.89, 6.6, 3.5, 0.5, 0, 2 * Math.PI);
            ctx.fillStyle = "#fffbe0";
            ctx.fill();
            ctx.restore();
            ctx.restore();

            // Main body (torso)
            ctx.save();
            ctx.shadowColor = "#fffbe0";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.ellipse(this.width * 0.52, this.height * 0.62, this.width * 0.28, this.height * 0.21, 0, 0, 2 * Math.PI);
            ctx.fillStyle = this.bodyColor;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();

            // Fur accent on back
            ctx.save();
            ctx.globalAlpha = 0.23;
            ctx.beginPath();
            ctx.ellipse(this.width * 0.40, this.height * 0.55, this.width * 0.13, this.height * 0.09, 0.1, 0, 2 * Math.PI);
            ctx.fillStyle = this.furAccent;
            ctx.fill();
            ctx.restore();

            // Belly accent
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.ellipse(this.width * 0.59, this.height * 0.74, this.width * 0.10, this.height * 0.07, 0.3, 0, 2 * Math.PI);
            ctx.fillStyle = this.muzzleColor;
            ctx.fill();
            ctx.restore();

            // Chest fur (tuft)
            ctx.save();
            ctx.globalAlpha = 0.44;
            ctx.beginPath();
            ctx.moveTo(this.width * 0.74, this.height * 0.67);
            ctx.lineTo(this.width * 0.71, this.height * 0.80);
            ctx.lineTo(this.width * 0.77, this.height * 0.75);
            ctx.closePath();
            ctx.fillStyle = this.muzzleColor;
            ctx.fill();
            ctx.restore();

            // --- LEGS ---
            // Back leg (closer, in front of body)
            ctx.save();
            ctx.strokeStyle = this.legColor;
            ctx.lineWidth = 3.3;
            ctx.globalAlpha = 0.92;
            ctx.beginPath();
            ctx.moveTo(this.width * 0.41, this.height * 0.78);
            ctx.lineTo(this.width * 0.40, this.height * 0.97);
            ctx.stroke();
            // Claw
            ctx.beginPath();
            ctx.arc(this.width * 0.40, this.height * 0.97, 1.3, 0, 2 * Math.PI);
            ctx.fillStyle = this.clawColor;
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.restore();

            // Front leg (far, behind body)
            ctx.save();
            ctx.strokeStyle = this.furAccent;
            ctx.lineWidth = 3.1;
            ctx.globalAlpha = 0.70;
            ctx.beginPath();
            ctx.moveTo(this.width * 0.77, this.height * 0.80);
            ctx.lineTo(this.width * 0.77, this.height * 0.97);
            ctx.stroke();
            // Claw
            ctx.beginPath();
            ctx.arc(this.width * 0.77, this.height * 0.97, 1.1, 0, 2 * Math.PI);
            ctx.fillStyle = this.clawColor;
            ctx.globalAlpha = 0.7;
            ctx.fill();
            ctx.restore();

            // Front leg (closer, in front of body)
            ctx.save();
            ctx.strokeStyle = this.legColor;
            ctx.lineWidth = 3.3;
            ctx.globalAlpha = 0.92;
            ctx.beginPath();
            ctx.moveTo(this.width * 0.84, this.height * 0.80);
            ctx.lineTo(this.width * 0.84, this.height * 0.97);
            ctx.stroke();
            // Claw
            ctx.beginPath();
            ctx.arc(this.width * 0.84, this.height * 0.97, 1.3, 0, 2 * Math.PI);
            ctx.fillStyle = this.clawColor;
            ctx.globalAlpha = 0.8;
            ctx.fill();
            ctx.restore();

            // --- HEAD ---
            // Head main
            ctx.save();
            ctx.globalAlpha = 0.99;
            ctx.beginPath();
            ctx.ellipse(this.width * 0.89, this.height * 0.44, this.width * 0.15, this.height * 0.15, 0, 0, 2 * Math.PI);
            ctx.fillStyle = this.bodyColor;
            ctx.shadowColor = "#fffbe0";
            ctx.shadowBlur = 2;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();

            // Cheek fur accent
            ctx.save();
            ctx.globalAlpha = 0.19;
            ctx.beginPath();
            ctx.ellipse(this.width * 0.93, this.height * 0.53, this.width * 0.06, this.height * 0.04, 0, 0, 2 * Math.PI);
            ctx.fillStyle = this.furAccent;
            ctx.fill();
            ctx.restore();

            // Muzzle/snout (white)
            ctx.save();
            ctx.globalAlpha = 0.98;
            ctx.beginPath();
            ctx.ellipse(this.width * 1.01, this.height * 0.51, this.width * 0.10, this.height * 0.07, 0.1, 0, 2 * Math.PI);
            ctx.fillStyle = this.muzzleColor;
            ctx.shadowColor = "#fffbe0";
            ctx.shadowBlur = 1.5;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();

            // Nose
            ctx.save();
            ctx.globalAlpha = 0.97;
            ctx.beginPath();
            ctx.arc(this.width * 1.07, this.height * 0.51, 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = this.noseColor;
            ctx.fill();
            ctx.restore();

            // Mouth line + tongue
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.strokeStyle = "#222";
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(this.width * 1.07, this.height * 0.54);
            ctx.quadraticCurveTo(this.width * 1.04, this.height * 0.56, this.width * 1.01, this.height * 0.54);
            ctx.stroke();
            // Tongue
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(this.width * 1.04, this.height * 0.56, 0.8, 0, Math.PI, false);
            ctx.fillStyle = this.tongueColor;
            ctx.fill();
            ctx.restore();
            ctx.restore();

            // Eyes (yellowish, fox-like)
            ctx.save();
            ctx.globalAlpha = 0.98;
            ctx.beginPath();
            ctx.arc(this.width * 0.97, this.height * 0.47, 2.2, 0, 2 * Math.PI);
            ctx.fillStyle = this.eyeColor;
            ctx.fill();
            // Pupil (slit)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(this.width * 0.97, this.height * 0.47, 0.7, 1.4, 0, 0, 2 * Math.PI);
            ctx.fillStyle = this.pupilColor;
            ctx.globalAlpha = 0.85;
            ctx.fill();
            ctx.restore();
            ctx.restore();

            // Ears (pointy, with inner ear)
            ctx.save();
            ctx.globalAlpha = 0.97;
            // Left ear (closer)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(this.width * 0.90, this.height * 0.29, this.width * 0.06, this.height * 0.13, -0.5, 0, 2 * Math.PI);
            ctx.fillStyle = this.earColor;
            ctx.shadowColor = "#fffbe0";
            ctx.shadowBlur = 1;
            ctx.fill();
            ctx.shadowBlur = 0;
            // Inner ear
            ctx.globalAlpha = 0.66;
            ctx.beginPath();
            ctx.ellipse(this.width * 0.90, this.height * 0.29, this.width * 0.025, this.height * 0.05, -0.5, 0, 2 * Math.PI);
            ctx.fillStyle = this.innerEarColor;
            ctx.fill();
            ctx.restore();

            // Right ear (farther)
            ctx.save();
            ctx.globalAlpha = 0.87;
            ctx.beginPath();
            ctx.ellipse(this.width * 1.01, this.height * 0.34, this.width * 0.045, this.height * 0.09, 0.25, 0, 2 * Math.PI);
            ctx.fillStyle = this.earColor;
            ctx.fill();
            // Inner ear
            ctx.globalAlpha = 0.53;
            ctx.beginPath();
            ctx.ellipse(this.width * 1.01, this.height * 0.34, this.width * 0.017, this.height * 0.035, 0.25, 0, 2 * Math.PI);
            ctx.fillStyle = this.innerEarColor;
            ctx.fill();
            ctx.restore();

            ctx.restore();

            ctx.restore(); // head

            ctx.restore(); // body

            ctx.restore(); // flip
        }

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }
}
window.VehicleObstacle = VehicleObstacle;
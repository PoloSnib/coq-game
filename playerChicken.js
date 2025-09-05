class PlayerChicken {
    constructor(startX, startY) {
        // --- Use new sprite size (200% of original 36x36) ---
        this.width = 72;
        this.height = 72;
        this.x = startX;
        this.y = startY;
        this.targetX = startX;
        this.targetY = startY;
        this.moving = false;
        this.moveSpeed = 10; // pixels per frame to "hop"
        this.alive = true;
        this.animFrame = 0;
        this.animDir = null;
        this.lastDir = 'up';
        this.jumpAnimT = 0; // 0...1

        // --- Load external sprite image (only once globally) ---
        if (!window._playerChickenImg) {
            window._playerChickenImg = new window.Image();
            window._playerChickenImg.src = "https://dcnmwoxzefwqmvvkpqap.supabase.co/storage/v1/object/public/sprite-studio-exports/620dfb9b-13c8-4733-a462-aea820328b33/library/Coq_3_1757098731851.png";
        }
        this.spriteImg = window._playerChickenImg;
    }

    move(dir, gridSize, bounds) {
        if (!this.alive || this.moving) return;
        this.animDir = dir;
        let tx = this.x, ty = this.y;
        switch (dir) {
            case 'up': ty -= gridSize; break;
            case 'down': ty += gridSize; break;
            case 'left': tx -= gridSize; break;
            case 'right': tx += gridSize; break;
        }
        // Clamp to bounds
        if (tx < bounds.left || tx > bounds.right - this.width ||
            ty < bounds.top || ty > bounds.bottom - this.height)
            return;
        this.targetX = tx; this.targetY = ty; this.moving = true; this.jumpAnimT = 0;
        this.lastDir = dir;
    }

    update() {
        if (this.moving) {
            // Animate hop
            this.jumpAnimT += 0.18;
            let dx = this.targetX - this.x, dy = this.targetY - this.y;
            if (Math.abs(dx) <= this.moveSpeed && Math.abs(dy) <= this.moveSpeed) {
                this.x = this.targetX; this.y = this.targetY; this.moving = false;
                this.jumpAnimT = 0;
            } else {
                this.x += Math.sign(dx) * Math.min(Math.abs(dx), this.moveSpeed);
                this.y += Math.sign(dy) * Math.min(Math.abs(dy), this.moveSpeed);
            }
        }
        // Animate idle bob
        this.animFrame += 1;
    }

    draw(ctx) {
        // Draw the new sprite image, centered, with jump/idle animation
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // Animate jump
        let jumpHeight = 0, jumpScale = 1.0;
        if (this.moving || this.jumpAnimT > 0) {
            jumpHeight = -32 * Math.sin(Math.PI * this.jumpAnimT); // 2x original jump height
            jumpScale = 1.0 + 0.12 * Math.sin(Math.PI * this.jumpAnimT);
        } else {
            jumpHeight = -4 * Math.sin(this.animFrame / 16); // 2x original idle bob
            jumpScale = 1.0 + 0.03 * Math.sin(this.animFrame / 16);
        }
        ctx.translate(0, jumpHeight);

        // Shadow
        ctx.save();
        ctx.scale(1.2, 0.38);
        ctx.globalAlpha = 0.14;
        ctx.beginPath();
        ctx.arc(0, this.height * 0.98 / 2, this.width * 0.51 / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#555";
        ctx.fill();
        ctx.restore();

        ctx.scale(jumpScale, jumpScale);

        // Draw the sprite image centered at (0,0)
        if (this.spriteImg && this.spriteImg.complete && this.spriteImg.naturalWidth) {
            ctx.drawImage(
                this.spriteImg,
                -this.width / 2, -this.height / 2,
                this.width, this.height
            );
        } else {
            // Placeholder: gray circle if image not loaded yet
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
            ctx.fillStyle = "#bbb";
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.width, h: this.height };
    }

    reset(startX, startY) {
        this.x = startX; this.y = startY; this.targetX = startX; this.targetY = startY;
        this.moving = false; this.alive = true; this.jumpAnimT = 0;
    }
}
window.PlayerChicken = PlayerChicken;
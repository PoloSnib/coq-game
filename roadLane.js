class RoadLane {
    constructor(y, height, type) {
        this.y = y;
        this.height = height;
        this.type = type; // 'road', 'grass', 'finish'
    }

    draw(ctx, width) {
        if (this.type === 'road') {
            // Draw road with subtle gradient
            let grad = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
            grad.addColorStop(0, "hsl(0,0%,23%)");
            grad.addColorStop(1, "hsl(0,0%,18%)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, this.y, width, this.height);

            // Draw dashed lane markers
            ctx.save();
            ctx.strokeStyle = "hsl(48,100%,50%)";
            ctx.lineWidth = 3.5;
            ctx.setLineDash([16, 18]);
            ctx.beginPath();
            ctx.moveTo(18, this.y + this.height / 2);
            ctx.lineTo(width - 18, this.y + this.height / 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        } else if (this.type === 'grass' || this.type === 'finish') {
            // Grass or finish (lighter green for finish)
            ctx.fillStyle = (this.type === 'finish') ? "hsl(106, 47%, 72%)" : "hsl(106, 47%, 60%)";
            ctx.fillRect(0, this.y, width, this.height);

            // Draw decorative pattern
            ctx.save();
            ctx.globalAlpha = 0.09;
            for (let i = 0; i < width; i += 18) {
                ctx.beginPath();
                ctx.ellipse(i + 7, this.y + 13, 4, 7, 0, 0, 2 * Math.PI);
                ctx.fillStyle = "#fff";
                ctx.fill();
            }
            ctx.restore();
        }
        // Draw subtle shadow between lanes
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = "#333";
        ctx.fillRect(0, this.y + this.height - 2, width, 2);
        ctx.restore();
    }
}
window.RoadLane = RoadLane;
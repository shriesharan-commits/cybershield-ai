import { useEffect, useRef } from "react";

/**
 * MatrixCanvas
 * Renders a full-screen animated matrix-rain effect using canvas.
 * Uses requestAnimationFrame for smooth rendering at ~60 fps.
 * Purely decorative — pointer-events disabled.
 */
export default function MatrixCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const CHAR_SIZE = 14;
    const cols = Math.floor(W / CHAR_SIZE);
    const drops = Array(cols).fill(1);

    // Mix of Latin, digits, symbols, and katakana for authenticity
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコ";

    const draw = () => {
      // Slight fade to create the trailing-glow effect
      ctx.fillStyle = "rgba(2,11,20,0.05)";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#00ff88";
      ctx.font = `${CHAR_SIZE}px 'Share Tech Mono', monospace`;

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * CHAR_SIZE, y * CHAR_SIZE);

        // Reset column randomly after it passes the bottom
        if (y * CHAR_SIZE > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="matrix-canvas" />;
}

import { useEffect, useRef } from 'react';

/**
 * Pure Falling Snow Effect on Light Frost (#90CAF9) Background.
 * Zero blobs, zero heavy blurs — clean, crisp winter snow on ice blue.
 */
export default function SnowEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const flakeCount = Math.min(Math.floor((width * height) / 16000), 80);
    const flakes = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.5 + 1.2,
        speedY: Math.random() * 0.9 + 0.5,
        speedX: Math.random() * 0.6 - 0.3,
        opacity: Math.random() * 0.6 + 0.4,
        swaySpeed: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.01;

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];

        f.y += f.speedY;
        f.x += Math.sin(angle * f.swaySpeed + f.swayOffset) * 0.7 + f.speedX;

        if (f.y > height + 6) {
          f.y = -6;
          f.x = Math.random() * width;
        }
        if (f.x > width + 6) f.x = -6;
        if (f.x < -6) f.x = width + 6;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        // Pure crisp white snow visible on #90CAF9 light blue
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = f.radius > 2 ? 4 : 1;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Clean Light Frost Background (#90CAF9 base) — NO BLOBS */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#bfe0fc] via-[#90CAF9] to-[#a3d1fa]" />

      {/* Falling Snow Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

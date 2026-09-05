import { useEffect, useRef } from 'react';

/**
 * High-performance, lightweight Canvas Snowfall & Frost Effect.
 * Creates a chilling, atmospheric cold winter ambiance with zero lag.
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

    // Particle count: optimal for performance on mobile and desktop
    const flakeCount = Math.min(Math.floor((width * height) / 18000), 75);
    const flakes = [];

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 0.8 + 0.4,
        speedX: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.6 + 0.25,
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

        // Gentle horizontal swaying like real snow
        f.y += f.speedY;
        f.x += Math.sin(angle * f.swaySpeed + f.swayOffset) * 0.6 + f.speedX;

        // Wrap around boundaries
        if (f.y > height + 5) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width + 5) f.x = -5;
        if (f.x < -5) f.x = width + 5;

        // Draw soft glowing snowflake
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(227, 242, 253, ${f.opacity})`; // #E3F2FD ice white
        ctx.shadowColor = 'rgba(144, 202, 249, 0.8)'; // #90CAF9 soft blue glow
        ctx.shadowBlur = f.radius > 2 ? 6 : 2;
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
      {/* Deep Cold Ambient Gradient & Radial Frost Glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030812] via-[#061226] to-[#030812]" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0D47A1]/20 blur-[130px]" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] rounded-full bg-[#2196F3]/10 blur-[140px]" />
      <div className="absolute bottom-0 left-10 w-[550px] h-[550px] rounded-full bg-[#0D47A1]/25 blur-[150px]" />

      {/* Falling Snow Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

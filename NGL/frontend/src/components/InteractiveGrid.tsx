import React, { useRef, useEffect } from 'react';
import { IViewport } from '../types/graph';

interface InteractiveGridProps {
  viewport: IViewport;
  mousePos: { x: number; y: number };
}

export const InteractiveGrid: React.FC<InteractiveGridProps> = ({ viewport, mousePos }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const baseGridStep = 28;
      const scaledStep = baseGridStep * viewport.zoom;

      const offsetX = viewport.panX % scaledStep;
      const offsetY = viewport.panY % scaledStep;

      const hoverRadius = 130;

      for (let x = offsetX - scaledStep; x < width + scaledStep; x += scaledStep) {
        for (let y = offsetY - scaledStep; y < height + scaledStep; y += scaledStep) {
          const dx = x - mousePos.x;
          const dy = y - mousePos.y;
          const dist = Math.hypot(dx, dy);

          let r = 1.5 * Math.min(Math.max(viewport.zoom, 0.5), 1.8);
          let alpha = 0.18;
          let color = '255, 255, 255';

          if (dist < hoverRadius) {
            const factor = 1 - dist / hoverRadius;
            r += factor * 3.5;
            alpha += factor * 0.75;

            if (factor > 0.5) {
              color = '56, 189, 248'; // Glowing Cyan near cursor center
            } else {
              color = '99, 102, 241'; // Indigo transition
            }
          }

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [viewport, mousePos]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
};

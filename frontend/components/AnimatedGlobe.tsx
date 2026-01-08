'use client';

import { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  element: HTMLDivElement;
  projected: { x: number; y: number; z: number; scale: number };
}

export function AnimatedGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const pointsRef = useRef<Point3D[]>([]);
  const linesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const numPoints = 60;
    const radius = 250;
    const connectionDistance = radius * 0.85;

    // Criar pontos distribuídos uniformemente na esfera
    const points: Point3D[] = [];
    for (let i = 0; i < numPoints; i++) {
      const point = document.createElement('div');
      point.className = 'globe-point';
      
      // Distribuição uniforme usando Fibonacci sphere
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const y = 1 - (i / (numPoints - 1)) * 2;
      const radius_at_y = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      
      const x = Math.cos(theta) * radius_at_y;
      const z = Math.sin(theta) * radius_at_y;
      
      const point3D: Point3D = {
        x: x * radius,
        y: y * radius,
        z: z * radius,
        element: point,
        projected: { x: 0, y: 0, z: 0, scale: 1 }
      };
      
      points.push(point3D);
      container.appendChild(point);
    }

    pointsRef.current = points;

    let angleX = 0;
    let angleY = 0;
    const rotationSpeedX = 0.0015;
    const rotationSpeedY = 0.001;

    function rotatePoint(point: Point3D, angleX: number, angleY: number): { x: number; y: number; z: number } {
      // Rotação em X
      let x1 = point.x;
      let y1 = point.y * Math.cos(angleX) - point.z * Math.sin(angleX);
      let z1 = point.y * Math.sin(angleX) + point.z * Math.cos(angleX);

      // Rotação em Y
      let x2 = x1 * Math.cos(angleY) + z1 * Math.sin(angleY);
      let y2 = y1;
      let z2 = -x1 * Math.sin(angleY) + z1 * Math.cos(angleY);

      return { x: x2, y: y2, z: z2 };
    }

    function projectPoint(x: number, y: number, z: number, distance: number = 600): { x: number; y: number; z: number; scale: number } {
      const scale = distance / (distance + z);
      return {
        x: x * scale,
        y: y * scale,
        z: z,
        scale: Math.max(0.4, scale)
      };
    }

    function animate() {
      angleX += rotationSpeedX;
      angleY += rotationSpeedY;

      // Limpar linhas anteriores
      linesRef.current.forEach(line => line.remove());
      linesRef.current = [];

      // Projetar todos os pontos
      points.forEach(point => {
        const rotated = rotatePoint(point, angleX, angleY);
        point.projected = projectPoint(rotated.x, rotated.y, rotated.z);
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        point.element.style.transform = `translate(${centerX + point.projected.x}px, ${centerY + point.projected.y}px) scale(${point.projected.scale})`;
        point.element.style.opacity = `${point.projected.scale}`;
      });

      // Conectar pontos próximos
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i];
          const p2 = points[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < connectionDistance) {
            const line = document.createElement('div');
            line.className = 'globe-line';
            
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const x1 = centerX + p1.projected.x;
            const y1 = centerY + p1.projected.y;
            const x2 = centerX + p2.projected.x;
            const y2 = centerY + p2.projected.y;
            
            const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            line.style.width = `${length}px`;
            line.style.left = `${x1}px`;
            line.style.top = `${y1}px`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.opacity = `${Math.max(0.15, (1 - distance / connectionDistance) * 0.4)}`;

            container.appendChild(line);
            linesRef.current.push(line);
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      points.forEach(point => point.element.remove());
      linesRef.current.forEach(line => line.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        background: 'transparent',
      }}
    />
  );
}

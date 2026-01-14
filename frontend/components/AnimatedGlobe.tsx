'use client';

import { useEffect, useRef } from 'react';

interface FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  element: HTMLDivElement;
  color: string;
}

export function AnimatedGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<FireParticle[]>([]);
  const heatWavesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const numParticles = 80;
    const numHeatWaves = 3;

    // Cores quentes para as partículas
    const fireColors = [
      'rgba(251, 146, 60, 1)',   // orange-400
      'rgba(249, 115, 22, 1)',   // orange-500
      'rgba(220, 38, 38, 1)',     // red-600
      'rgba(234, 88, 12, 1)',    // orange-600
      'rgba(251, 191, 36, 1)',   // yellow-400
    ];

    // Criar partículas de fogo
    const particles: FireParticle[] = [];
    for (let i = 0; i < numParticles; i++) {
      const particle = document.createElement('div');
      particle.className = 'fire-particle';
      
      const size = Math.random() * 4 + 2;
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight + Math.random() * 200;
      const vx = (Math.random() - 0.5) * 0.5;
      const vy = -(Math.random() * 2 + 1);
      const maxLife = Math.random() * 200 + 150;
      const color = fireColors[Math.floor(Math.random() * fireColors.length)];

      const fireParticle: FireParticle = {
        x,
        y,
        vx,
        vy,
        size,
        life: 0,
        maxLife,
        element: particle,
        color,
      };

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = `radial-gradient(circle, ${color} 0%, ${color}00 100%)`;
      particle.style.borderRadius = '50%';
      particle.style.position = 'absolute';
      particle.style.boxShadow = `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}80`;
      particle.style.transition = 'opacity 0.1s ease';

      particles.push(fireParticle);
      container.appendChild(particle);
    }

    particlesRef.current = particles;

    // Criar ondas de calor
    const heatWaves: HTMLDivElement[] = [];
    for (let i = 0; i < numHeatWaves; i++) {
      const wave = document.createElement('div');
      wave.className = 'heat-wave';
      wave.style.position = 'absolute';
      wave.style.width = '100%';
      wave.style.height = '100%';
      wave.style.background = `radial-gradient(ellipse at ${50 + i * 20}% ${30 + i * 15}%, rgba(249, 115, 22, ${0.1 + i * 0.05}) 0%, transparent 70%)`;
      wave.style.pointerEvents = 'none';
      wave.style.animation = `heatWave ${3 + i * 2}s ease-in-out infinite`;
      wave.style.animationDelay = `${i * 0.5}s`;
      
      heatWaves.push(wave);
      container.appendChild(wave);
    }

    heatWavesRef.current = heatWaves;

    // Adicionar keyframes para ondas de calor via CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes heatWave {
        0%, 100% {
          opacity: 0.3;
          transform: scale(1) translateY(0);
        }
        50% {
          opacity: 0.6;
          transform: scale(1.1) translateY(-20px);
        }
      }
    `;
    document.head.appendChild(style);

    let time = 0;

    function animate() {
      time += 0.016; // ~60fps

      // Atualizar partículas
      particles.forEach((particle, index) => {
        // Movimento orgânico com turbulência
        particle.vx += (Math.random() - 0.5) * 0.02;
        particle.vy -= 0.02 + Math.random() * 0.01;
        
        // Aplicar movimento
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Turbulência baseada em seno para movimento de chama
        particle.x += Math.sin(time * 2 + index) * 0.3;
        
        // Atualizar vida
        particle.life += 1;
        
        // Resetar partícula quando ela morre ou sai da tela
        if (particle.life >= particle.maxLife || particle.y < -50 || 
            particle.x < -50 || particle.x > window.innerWidth + 50) {
          particle.x = Math.random() * window.innerWidth;
          particle.y = window.innerHeight + Math.random() * 100;
          particle.vx = (Math.random() - 0.5) * 0.5;
          particle.vy = -(Math.random() * 2 + 1);
          particle.life = 0;
          particle.maxLife = Math.random() * 200 + 150;
        }

        // Calcular opacidade baseada na vida
        const lifeRatio = particle.life / particle.maxLife;
        const opacity = 1 - lifeRatio;
        const scale = 0.5 + (1 - lifeRatio) * 0.5;

        // Aplicar transformações
        particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px) scale(${scale})`;
        particle.element.style.opacity = `${opacity}`;
        
        // Mudar cor baseada na vida (mais quente no início, mais frio no final)
        let currentColor = particle.color;
        if (lifeRatio > 0.7) {
          currentColor = fireColors[Math.floor(Math.random() * 3)]; // Cores mais quentes
        } else if (lifeRatio > 0.4) {
          currentColor = fireColors[Math.floor(Math.random() * 4) + 1]; // Cores médias
        } else {
          currentColor = fireColors[fireColors.length - 1]; // Amarelo no final
        }
        
        particle.element.style.background = `radial-gradient(circle, ${currentColor} 0%, ${currentColor}00 100%)`;
        particle.element.style.boxShadow = `0 0 ${particle.size * 2}px ${currentColor}, 0 0 ${particle.size * 4}px ${currentColor}80`;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      particles.forEach(particle => particle.element.remove());
      heatWaves.forEach(wave => wave.remove());
      style.remove();
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

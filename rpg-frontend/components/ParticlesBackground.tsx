"use client";
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import { useTheme } from "../components/contexts/ThemeContext"; // <--- IMPORTAR O TEMA

export default function ParticlesBackground() {
  const { theme } = useTheme(); // <--- PEGAR A COR DO TEMA

  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: {
            // O fundo agora é transparente para respeitar o gradiente da página
            color: { value: "transparent" }, 
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            resize: true,
          },
          modes: {
            grab: { distance: 140, links: { opacity: 1 } },
          },
        },
        particles: {
          // AQUI A MÁGICA: A cor vem do tema!
          color: { value: theme.particleColor }, 
          links: {
            color: theme.particleColor, // Linhas também mudam de cor
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 2,
          },
          move: {
            enable: true,
            speed: 0.8, // Velocidade lenta e mística
          },
          number: {
            density: { enable: true, area: 800 },
            value: 60,
          },
          opacity: { value: 0.5 },
          shape: { type: "circle" },
          size: { value: { min: 2, max: 3 } },
        },
        detectRetina: true,
      }}
    />
  );
}
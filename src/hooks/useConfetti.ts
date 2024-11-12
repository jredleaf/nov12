import confetti from 'canvas-confetti';

const useConfetti = () => {
  const effects = [
    // Vibrant Confetti Burst
    () => {
      const count = 150;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 1000,
        gravity: 0.8,
        scalar: 1,
        drift: 0.5,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.3, {
        spread: 80,
        startVelocity: 45,
        decay: 0.92,
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
      });

      fire(0.2, {
        spread: 65,
        startVelocity: 35,
        decay: 0.91,
        colors: ['#A7F3D0', '#FDE68A', '#C4B5FD'],
      });
    },

    // Dynamic Star Burst
    () => {
      const duration = 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 25,
        spread: 160,
        ticks: 75,
        zIndex: 1000,
        shapes: ['star'],
        colors: ['#FCD34D', '#60A5FA', '#F87171'],
        gravity: 0.8,
        scalar: 0.9,
        drift: 0.2,
      };

      const interval: NodeJS.Timer = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        confetti({
          ...defaults,
          particleCount: 3,
          origin: {
            x: Math.random(),
            y: Math.random() * 0.4 + 0.6,
          },
        });
      }, 80);
    },

    // Energetic Ripple
    () => {
      const colors = ['#F472B6', '#34D399', '#60A5FA'];
      
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 0,
            spread: 360,
            origin: { x: 0.5, y: 0.5 },
            colors: [colors[i]],
            ticks: 75,
            gravity: 0.4,
            decay: 0.92,
            startVelocity: 30 + (i * 5),
            shapes: ['circle'],
            scalar: 0.9,
            zIndex: 1000,
            drift: 0.2,
          });
        }, i * 150);
      }
    },

    // Spiral Celebration
    () => {
      const duration = 1000;
      const animationEnd = Date.now() + duration;
      let angle = 0;

      const interval: NodeJS.Timer = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        angle += 0.3;
        const x = 0.5 + (Math.cos(angle) * 0.2);
        const y = 0.5 + (Math.sin(angle) * 0.2);

        confetti({
          particleCount: 3,
          angle: angle * 180 / Math.PI,
          spread: 40,
          origin: { x, y },
          colors: ['#F59E0B', '#EC4899', '#6366F1'],
          ticks: 75,
          gravity: 0.6,
          decay: 0.93,
          startVelocity: 25,
          shapes: ['circle'],
          scalar: 1,
          zIndex: 1000,
          drift: 0.2,
        });
      }, 40);
    },

    // Victory Arc
    () => {
      const colors = ['#F59E0B', '#10B981', '#6366F1', '#EC4899'];
      const arcCount = 3;
      
      for (let i = 0; i < arcCount; i++) {
        setTimeout(() => {
          confetti({
            particleCount: 25,
            angle: 135,
            spread: 45,
            origin: { x: 0, y: 0.8 },
            colors: [colors[i]],
            ticks: 75,
            gravity: 0.6,
            decay: 0.92,
            startVelocity: 30,
            shapes: ['circle'],
            scalar: 0.9,
            zIndex: 1000,
            drift: 0.5,
          });

          confetti({
            particleCount: 25,
            angle: 45,
            spread: 45,
            origin: { x: 1, y: 0.8 },
            colors: [colors[i]],
            ticks: 75,
            gravity: 0.6,
            decay: 0.92,
            startVelocity: 30,
            shapes: ['circle'],
            scalar: 0.9,
            zIndex: 1000,
            drift: -0.5,
          });
        }, i * 150);
      }
    }
  ];

  return () => {
    // Pick 2 random effects to play
    const shuffledEffects = [...effects]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    // Play effects with slight delays between them
    shuffledEffects.forEach((effect, index) => {
      setTimeout(() => {
        effect();
      }, index * 200); // Reduced delay for more immediate celebration
    });
  };
};

export default useConfetti;
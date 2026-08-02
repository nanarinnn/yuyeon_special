import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Play, Heart } from 'lucide-react';

export const MinigameView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'ENDING' | 'GAMEOVER'>('START');
  
  // ⭐️ React UI Render Sync States
  const [collectedSlots, setCollectedSlots] = useState<boolean[]>(new Array(9).fill(false));
  const [collectedCount, setCollectedCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [hp, setHp] = useState<number>(100);

  // ⭐️ Persistent Canvas Refs (React Render / Re-render stability)
  const gameRef = useRef({
    gameState: 'START' as 'START' | 'PLAYING' | 'ENDING' | 'GAMEOVER',
    hp: 100,
    timer: 30,
    gameTime: 0,
    gameSpeed: 3.0,
    slotCollectedFlags: new Array(9).fill(false),
    endingTriggered: false,
    endingStage: 0,
    fireworksTimer: 0,
  });

  const TARGET_SPELLINGS = ['H', 'A', 'P', 'P', 'Y', 'B', 'D', 'A', 'Y'];
  const GAME_DURATION = 30;

  // Sync ref state with React state
  useEffect(() => {
    gameRef.current.gameState = gameState;
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    class Player {
      x: number;
      y: number;
      width: number;
      height: number;
      vy: number;
      gravity: number;
      jumpPower: number;
      groundY: number;
      jumpCount: number;
      maxJumps: number;
      damageTimer: number;

      constructor() {
        this.width = 60;
        this.height = 80;
        this.x = 80;
        this.groundY = 320 - this.height;
        this.y = this.groundY;
        this.vy = 0;
        this.gravity = 0.5;
        this.jumpPower = -11.5;
        this.jumpCount = 0;
        this.maxJumps = 2;
        this.damageTimer = 0;
      }

      jump() {
        if (this.jumpCount < this.maxJumps) {
          this.vy = this.jumpCount === 1 ? this.jumpPower * 1.15 : this.jumpPower;
          this.jumpCount++;
        }
      }

      update() {
        this.vy += this.gravity;
        this.y += this.vy;

        if (this.y >= this.groundY) {
          this.y = this.groundY;
          this.vy = 0;
          this.jumpCount = 0;
        }

        if (this.damageTimer > 0) {
          this.damageTimer--;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.save();
        if (this.damageTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
          context.globalAlpha = 0.4;
        }

        const px = this.x;
        const py = this.y;
        const animFrame = Math.floor(Date.now() / 150) % 2;

        context.fillStyle = '#68217a';
        context.fillRect(px + 4, py - 4, 52, 32);
        context.fillStyle = '#9333ea';
        context.fillRect(px + 8, py - 8, 44, 28);
        context.fillStyle = '#c084fc';
        context.fillRect(px + 14, py - 10, 24, 10);

        context.fillStyle = '#ffedd5';
        context.fillRect(px + 10, py + 20, 40, 26);

        context.fillStyle = '#fda4af';
        context.fillRect(px + 12, py + 34, 8, 4);
        context.fillRect(px + 40, py + 34, 8, 4);

        context.fillStyle = '#4c1d95';
        context.fillRect(px + 18, py + 26, 8, 12);
        context.fillRect(px + 34, py + 26, 8, 12);
        context.fillStyle = '#ffffff';
        context.fillRect(px + 20, py + 28, 4, 4);
        context.fillRect(px + 36, py + 28, 4, 4);

        context.fillStyle = '#581c87';
        context.fillRect(px + 8, py + 46, 44, 22);
        context.fillStyle = '#9333ea';
        context.fillRect(px + 14, py + 46, 32, 22);
        context.fillStyle = '#18181b';
        context.fillRect(px + 24, py + 46, 12, 22);

        context.fillStyle = '#581c87';
        if (this.vy < 0) {
          context.fillRect(px + 2, py + 38, 8, 18);
          context.fillRect(px + 50, py + 38, 8, 18);
        } else {
          context.fillRect(px + (animFrame ? 2 : 6), py + 48, 8, 16);
          context.fillRect(px + (animFrame ? 46 : 50), py + 48, 8, 16);
        }

        context.fillStyle = '#27272a';
        context.fillRect(px + 12, py + 68, 14, 12);
        context.fillRect(px + 34, py + 68, 14, 12);

        context.fillStyle = '#a855f7';
        if (animFrame && this.vy === 0) {
          context.fillRect(px + 6, py + 74, 18, 8);
          context.fillRect(px + 34, py + 72, 18, 8);
        } else {
          context.fillRect(px + 10, py + 72, 18, 8);
          context.fillRect(px + 30, py + 74, 18, 8);
        }

        context.restore();
      }
    }

    class Item {
      x: number;
      y: number;
      char: string;
      targetIndex: number;
      width: number;
      height: number;
      collected: boolean;

      constructor(x: number, y: number, char: string, targetIndex: number) {
        this.x = x;
        this.y = y;
        this.char = char;
        this.targetIndex = targetIndex;
        this.width = 36;
        this.height = 36;
        this.collected = false;
      }

      update(speed: number) {
        this.x -= speed;
      }

      draw(context: CanvasRenderingContext2D) {
        if (this.collected) return;
        context.save();
        context.fillStyle = '#fbbf24';
        context.fillRect(this.x, this.y, this.width, this.height);
        context.fillStyle = '#f59e0b';
        context.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        context.fillStyle = '#fef08a';
        context.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);

        context.fillStyle = '#7c2d12';
        context.font = '900 20px Paperlogy, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(this.char, this.x + 18, this.y + 19);
        context.restore();
      }
    }

    class HeartItem {
      x: number;
      y: number;
      width: number;
      height: number;
      collected: boolean;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.width = 36;
        this.height = 36;
        this.collected = false;
      }

      update(speed: number) {
        this.x -= speed;
      }

      draw(context: CanvasRenderingContext2D) {
        if (this.collected) return;
        context.save();
        const hx = this.x;
        const hy = this.y;

        context.fillStyle = '#fb7185';
        context.fillRect(hx, hy, this.width, this.height);
        context.fillStyle = '#f43f5e';
        context.fillRect(hx + 2, hy + 2, this.width - 4, this.height - 4);
        context.fillStyle = '#ffe4e6';
        context.fillRect(hx + 4, hy + 4, this.width - 8, this.height - 8);

        context.fillStyle = '#e11d48';
        context.fillRect(hx + 10, hy + 12, 6, 6);
        context.fillRect(hx + 20, hy + 12, 6, 6);
        context.fillRect(hx + 8, hy + 16, 20, 6);
        context.fillRect(hx + 10, hy + 22, 16, 4);
        context.fillRect(hx + 14, hy + 26, 8, 4);

        context.restore();
      }
    }

    class Obstacle {
      x: number;
      y: number;
      width: number;
      height: number;
      type: 'DOCS' | 'ALARM';

      constructor(x: number, type: 'DOCS' | 'ALARM') {
        this.x = x;
        this.type = type;
        if (type === 'DOCS') {
          this.width = 40;
          this.height = 36;
        } else {
          this.width = 34;
          this.height = 34;
        }
        this.y = 320 - this.height;
      }

      update(speed: number) {
        this.x -= speed;
      }

      draw(context: CanvasRenderingContext2D) {
        context.save();
        if (this.type === 'DOCS') {
          context.fillStyle = '#e4e4e7';
          context.fillRect(this.x, this.y + 16, 40, 20);
          context.fillStyle = '#a1a1aa';
          context.fillRect(this.x + 4, this.y + 8, 32, 10);
          context.fillStyle = '#f4f4f5';
          context.fillRect(this.x + 8, this.y, 24, 10);
          context.fillStyle = '#ef4444';
          context.fillRect(this.x + 12, this.y + 4, 16, 2);
        } else {
          context.fillStyle = '#dc2626';
          context.fillRect(this.x, this.y, 34, 34);
          context.fillStyle = '#ffffff';
          context.fillRect(this.x + 4, this.y + 4, 26, 26);
          context.fillStyle = '#18181b';
          context.fillRect(this.x + 16, this.y + 8, 2, 10);
          context.fillRect(this.x + 16, this.y + 16, 8, 2);
        }
        context.restore();
      }
    }

    class Cake {
      x: number;
      y: number;
      width: number;
      height: number;
      candlesLit: boolean[];

      constructor(x: number) {
        this.x = x;
        this.width = 180;
        this.height = 160;
        this.y = 320 - this.height;
        this.candlesLit = new Array(9).fill(false);
      }

      draw(context: CanvasRenderingContext2D) {
        context.save();

        context.fillStyle = '#f472b6';
        context.fillRect(this.x, this.y + 90, 180, 70);
        context.fillStyle = '#ffffff';
        context.fillRect(this.x, this.y + 90, 180, 12);

        context.fillStyle = '#c084fc';
        context.fillRect(this.x + 25, this.y + 45, 130, 50);
        context.fillStyle = '#ffffff';
        context.fillRect(this.x + 25, this.y + 45, 130, 10);

        context.fillStyle = '#fef08a';
        context.fillRect(this.x + 50, this.y + 10, 80, 40);
        context.fillStyle = '#ffffff';
        context.fillRect(this.x + 50, this.y + 10, 80, 8);

        context.fillStyle = '#ef4444';
        context.fillRect(this.x + 60, this.y + 2, 12, 10);
        context.fillRect(this.x + 84, this.y + 2, 12, 10);
        context.fillRect(this.x + 108, this.y + 2, 12, 10);

        for (let i = 0; i < 9; i++) {
          const candleX = this.x + 15 + i * 18;
          const candleY = this.y - 14;

          context.fillStyle = i % 2 === 0 ? '#38bdf8' : '#fb7185';
          context.fillRect(candleX, candleY, 6, 16);

          if (this.candlesLit[i]) {
            context.fillStyle = '#f97316';
            context.fillRect(candleX - 2, candleY - 12, 10, 12);
            context.fillStyle = '#fef08a';
            context.fillRect(candleX, candleY - 8, 6, 8);
          }
        }

        context.restore();
      }
    }

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 12;
        this.vy = (Math.random() - 0.8) * 14;
        const colors = ['#c084fc', '#f472b6', '#fbbf24', '#38bdf8', '#4ade80', '#ffffff'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 6 + 4;
        this.life = 1.0;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.35;
        this.life -= 0.015;
      }

      draw(context: CanvasRenderingContext2D) {
        if (this.life <= 0) return;
        context.save();
        context.globalAlpha = this.life;
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);
        context.restore();
      }
    }

    class FlyingAlphabet {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      char: string;
      progress: number;
      completed: boolean;

      constructor(startX: number, startY: number, targetX: number, targetY: number, char: string) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.char = char;
        this.progress = 0;
        this.completed = false;
      }

      update() {
        if (this.completed) return;
        this.progress += 0.025;
        if (this.progress >= 1) {
          this.progress = 1;
          this.completed = true;
        }

        const currentX = this.x + (this.targetX - this.x) * this.progress;
        const arc = Math.sin(this.progress * Math.PI) * 100;
        const currentY = this.y + (this.targetY - this.y) * this.progress - arc;

        this.x = currentX;
        this.y = currentY;
      }

      draw(context: CanvasRenderingContext2D) {
        if (this.completed) return;
        context.save();
        context.fillStyle = '#fbbf24';
        context.font = 'bold 22px Paperlogy, sans-serif';
        context.fillText(this.char, this.x, this.y);
        context.restore();
      }
    }

    // -------------------------------------------------------------
    // INSTANCE VARIABLES
    // -------------------------------------------------------------
    let animationFrameId: number;
    let player = new Player();
    let cake: Cake | null = null;
    let items: Item[] = [];
    let heartItems: HeartItem[] = [];
    let obstacles: Obstacle[] = [];
    let particles: Particle[] = [];
    let flyingLetters: FlyingAlphabet[] = [];

    const spawnNextMissingItem = () => {
      const uncollectedIndices: number[] = [];
      gameRef.current.slotCollectedFlags.forEach((collected, idx) => {
        if (!collected) uncollectedIndices.push(idx);
      });

      if (uncollectedIndices.length > 0) {
        const targetIdx = uncollectedIndices[Math.floor(Math.random() * uncollectedIndices.length)];
        const char = TARGET_SPELLINGS[targetIdx];
        const randomY = 120 + Math.random() * 130;
        const newX = Math.max(maxObsX(items, obstacles), 850);

        items.push(new Item(newX, randomY, char, targetIdx));
      }

      if (Math.random() < 0.35) {
        const heartY = 140 + Math.random() * 100;
        heartItems.push(new HeartItem(maxObsX(items, obstacles) + 150, heartY));
      }
    };

    const maxObsX = (itemList: Item[], obsList: Obstacle[]) => {
      let mx = 750;
      itemList.forEach(i => { if (i.x > mx) mx = i.x; });
      obsList.forEach(o => { if (o.x > mx) mx = o.x; });
      return mx;
    };

    const startCakeEndingScene = () => {
      if (gameRef.current.endingTriggered) return;
      gameRef.current.endingTriggered = true;
      gameRef.current.endingStage = 1;
      cake = new Cake(canvas.width + 60);
      setGameState('ENDING');
    };

    const initGame = () => {
      player = new Player();
      items = [];
      heartItems = [];
      obstacles = [];
      particles = [];
      flyingLetters = [];
      cake = null;

      gameRef.current.gameTime = 0;
      gameRef.current.gameSpeed = 3.0;
      gameRef.current.hp = 100;
      gameRef.current.slotCollectedFlags = new Array(9).fill(false);
      gameRef.current.endingTriggered = false;
      gameRef.current.endingStage = 0;
      gameRef.current.fireworksTimer = 0;

      setHp(100);
      setCollectedSlots(new Array(9).fill(false));
      setCollectedCount(0);
      setScore(0);
      setTimer(GAME_DURATION);

      let spawnX = 550;
      TARGET_SPELLINGS.forEach((letter, idx) => {
        const randomY = 120 + Math.random() * 120;
        obstacles.push(new Obstacle(spawnX + 220, Math.random() > 0.5 ? 'DOCS' : 'ALARM'));
        items.push(new Item(spawnX + 420, randomY, letter, idx));

        if (idx % 3 === 1) {
          heartItems.push(new HeartItem(spawnX + 280, 160 + Math.random() * 80));
        }

        spawnX += 450;
      });
    };

    initGameRef.current = initGame;

    const handleJumpInput = (e?: Event) => {
      if (e && e.type === 'keydown') {
        const kbEvent = e as KeyboardEvent;
        if (kbEvent.code === 'Space' || kbEvent.code === 'Spacebar' || kbEvent.key === ' ') {
          e.preventDefault();
        } else {
          return;
        }
      }
      if (!gameRef.current.endingTriggered && gameRef.current.hp > 0) {
        player.jump();
      }
    };

    window.addEventListener('keydown', handleJumpInput);
    canvas.addEventListener('mousedown', handleJumpInput);
    canvas.addEventListener('touchstart', handleJumpInput);

    // Initial setup on PLAYING or START
    initGame();

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Background
      ctx.fillStyle = '#120d1c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#1e1430';
      ctx.fillRect(0, 320, canvas.width, canvas.height - 320);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(0, 318, canvas.width, 2);

      ctx.fillStyle = '#3c2460';
      for (let i = 0; i < 20; i++) {
        const starX = (i * 50 + Date.now() * 0.015) % canvas.width;
        ctx.fillRect(starX, 40 + (i * 13) % 180, 4, 4);
      }

      const isEnding = gameRef.current.endingTriggered || gameRef.current.gameState === 'ENDING';

      if (gameRef.current.gameState === 'PLAYING' && !isEnding && gameRef.current.hp > 0) {
        gameRef.current.gameTime += delta;
        const remaining = Math.max(0, Math.ceil(GAME_DURATION - gameRef.current.gameTime));
        setTimer(remaining);

        // Update Alphabet Items
        items.forEach((item) => {
          item.update(gameRef.current.gameSpeed);
          item.draw(ctx);

          if (
            !item.collected &&
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y
          ) {
            item.collected = true;
            gameRef.current.slotCollectedFlags[item.targetIndex] = true;

            const updatedSlots = [...gameRef.current.slotCollectedFlags];
            const totalCount = updatedSlots.filter(Boolean).length;
            setCollectedSlots(updatedSlots);
            setCollectedCount(totalCount);
            setScore((prev) => prev + 100);

            // ⭐️ 9개 완료 시 케이크 엔딩 트리거
            if (totalCount >= 9) {
              startCakeEndingScene();
            }
          }
        });

        // Update Heart Items
        heartItems.forEach((heart) => {
          heart.update(gameRef.current.gameSpeed);
          heart.draw(ctx);

          if (
            !heart.collected &&
            player.x < heart.x + heart.width &&
            player.x + player.width > heart.x &&
            player.y < heart.y + heart.height &&
            player.y + player.height > heart.y
          ) {
            heart.collected = true;
            gameRef.current.hp = Math.min(100, gameRef.current.hp + 25);
            setHp(gameRef.current.hp);
            setScore((prev) => prev + 50);
          }
        });

        items = items.filter((item) => item.x > -50);
        heartItems = heartItems.filter((h) => h.x > -50);

        const currentTotal = gameRef.current.slotCollectedFlags.filter(Boolean).length;
        const uncollectedItemCount = items.filter((i) => !i.collected).length;
        if (uncollectedItemCount < 3 && currentTotal < 9) {
          spawnNextMissingItem();
        }

        // Update Obstacles
        obstacles.forEach((obs) => {
          obs.update(gameRef.current.gameSpeed);
          obs.draw(ctx);

          if (
            player.damageTimer === 0 &&
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
          ) {
            player.damageTimer = 45;
            gameRef.current.hp = Math.max(0, gameRef.current.hp - 12);
            setHp(gameRef.current.hp);
          }
        });

        obstacles = obstacles.filter((o) => o.x > -50);
        if (obstacles.length < 3) {
          const maxO = Math.max(...obstacles.map((o) => o.x), 700);
          obstacles.push(new Obstacle(maxO + 350, Math.random() > 0.5 ? 'DOCS' : 'ALARM'));
        }

        player.update();
        player.draw(ctx);

        if (gameRef.current.hp <= 0) {
          setGameState('GAMEOVER');
        } else if (remaining <= 0) {
          startCakeEndingScene();
        }
      } else if (isEnding) {
        // -------------------------------------------------------------
        // ENDING SCENE RENDERING (도트 3단 케이크 촛불 점등 축하 씬)
        // -------------------------------------------------------------
        if (!cake) cake = new Cake(canvas.width + 60);

        if (gameRef.current.endingStage === 1) {
          if (cake.x > 540) {
            cake.x -= 3;
          } else {
            gameRef.current.endingStage = 2;
            TARGET_SPELLINGS.forEach((letter, i) => {
              const candleX = cake!.x + 15 + i * 18;
              const candleY = cake!.y - 14;
              setTimeout(() => {
                flyingLetters.push(
                  new FlyingAlphabet(player.x + 20, player.y + 20, candleX, candleY, letter)
                );
              }, i * 250);
            });
          }
        }

        cake.draw(ctx);
        player.update();
        player.draw(ctx);

        if (gameRef.current.endingStage === 2) {
          let allFinished = true;
          flyingLetters.forEach((fl, idx) => {
            fl.update();
            fl.draw(ctx);
            if (fl.completed && !cake!.candlesLit[idx]) {
              cake!.candlesLit[idx] = true;
            }
            if (!fl.completed) allFinished = false;
          });

          if (flyingLetters.length === 9 && allFinished) {
            gameRef.current.endingStage = 3;
          }
        }

        if (gameRef.current.endingStage === 3) {
          gameRef.current.fireworksTimer++;
          if (gameRef.current.fireworksTimer % 8 === 0) {
            const fx = Math.random() * canvas.width;
            const fy = Math.random() * 200 + 40;
            for (let i = 0; i < 30; i++) {
              particles.push(new Particle(fx, fy));
            }
          }

          particles.forEach((p) => {
            p.update();
            p.draw(ctx);
          });

          ctx.save();
          const scale = 1 + Math.sin(Date.now() * 0.005) * 0.05;
          ctx.translate(canvas.width / 2, 100);
          ctx.scale(scale, scale);

          ctx.fillStyle = '#fbbf24';
          ctx.font = '900 36px Paperlogy, sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 15;
          ctx.fillText('🎂 HAPPY BIRTHDAY! 🎂', 0, 0);
          ctx.restore();
        }
      } else {
        player.draw(ctx);
        ctx.fillStyle = '#f4f0ff';
        ctx.font = '700 24px Paperlogy, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('유연이의 생일 축하 런 미니게임', canvas.width / 2, 150);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleJumpInput);
      canvas.removeEventListener('mousedown', handleJumpInput);
      canvas.removeEventListener('touchstart', handleJumpInput);
    };
  }, []); // Run once on mount!

  const initGameRef = useRef<(() => void) | null>(null);

  const handleStartGame = () => {
    if (initGameRef.current) {
      initGameRef.current();
    }
    setGameState('PLAYING');
  };

  return (
    <div className="min-h-screen bg-[#120d1c] text-[#f4f0ff] flex flex-col items-center justify-start pt-20 pb-16 px-4 select-none">
      {/* Title Header */}
      <div className="text-center mb-3 max-w-xl flex flex-col items-center gap-1.5">
        <div className="text-xs uppercase tracking-[0.25em] text-[#c084fc] font-bold">
          2D PIXEL RUN MINIGAME
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#f4f0ff]">
          YUYEON BDAY RUN
        </h1>
      </div>

      {/* 철권 스타일 대형 체력바 */}
      <div className="w-full max-w-[800px] bg-[#1a1129] border border-[#523d75] p-2.5 mb-2 flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#e9d5ff]">
          <div className="flex items-center gap-1.5 text-[#f472b6]">
            <Heart className="w-4 h-4 fill-current text-rose-500 animate-pulse" />
            <span>PLAYER HEALTH</span>
          </div>
          <span className="font-mono text-[#fef08a]">{hp} / 100</span>
        </div>
        <div className="w-full h-4 bg-[#0d0714] border border-[#6b4c9a] p-0.5 relative overflow-hidden">
          <div
            className="h-full transition-all duration-200"
            style={{
              width: `${hp}%`,
              backgroundColor: hp > 50 ? '#22c55e' : hp > 25 ? '#eab308' : '#ef4444',
              boxShadow: '0 0 10px rgba(234, 179, 8, 0.5)'
            }}
          />
        </div>
      </div>

      {/* Top HUD UI - 9개 전체 알파벳 수집 현황 */}
      <div className="w-full max-w-[800px] bg-[#1c142b] border border-[#523d75] p-3 mb-3 flex items-center justify-between text-xs sm:text-sm font-bold">
        <div className="flex items-center gap-2 text-[#fbbf24]">
          <span>수집 현황 ({collectedCount}/9):</span>
          <div className="flex items-center gap-1 bg-[#2a1b40] px-2 py-1 border border-[#6b4c9a]">
            {['H', 'A', 'P', 'P', 'Y', 'B', 'D', 'A', 'Y'].map((char, idx) => (
              <span
                key={idx}
                className={`px-1.5 py-0.5 rounded font-black font-mono text-sm transition-all ${
                  collectedSlots[idx]
                    ? 'bg-[#fbbf24] text-[#7c2d12] shadow-[0_0_8px_#fbbf24]'
                    : 'text-[#523d75] bg-[#190f2b]'
                }`}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[#c084fc]">
            남은 시간: <span className="text-[#f4f0ff] font-mono">{timer}s</span>
          </div>
          <div className="text-[#a855f7]">
            점수: <span className="text-[#f4f0ff] font-mono">{score}</span>
          </div>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="w-full max-w-[800px] aspect-[8/4] bg-[#120d1c] border-2 border-[#523d75] relative overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full block image-pixelated cursor-pointer"
        />

        {/* Start Overlay Button */}
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <button
              onClick={handleStartGame}
              className="bg-[#c084fc] hover:bg-[#a855f7] text-[#0e0817] font-bold text-lg px-8 py-3 rounded-none tracking-wider uppercase transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              게임 시작하기
            </button>
          </div>
        )}

        {/* Gameover Overlay */}
        {gameState === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="text-red-500 font-extrabold text-3xl tracking-widest">GAME OVER</div>
            <p className="text-xs text-[#d8b4fe]">체력이 모두 소진되었습니다!</p>
            <button
              onClick={handleStartGame}
              className="bg-[#c084fc] hover:bg-[#a855f7] text-[#0e0817] font-bold text-sm px-6 py-2.5 rounded-none tracking-wider uppercase transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              다시 도전하기
            </button>
          </div>
        )}

        {/* Ending Replay Overlay */}
        {gameState === 'ENDING' && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleStartGame}
              className="bg-[#1c142b]/80 hover:bg-[#c084fc] hover:text-[#0e0817] border border-[#523d75] text-[#f4f0ff] text-xs font-bold px-4 py-2 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              다시 하기
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-[#9d8ba6] text-center">
        * PC: Space 키(2단 점프 가능!) 또는 화면 클릭 / 모바일: 화면 터치로 점프가 가능합니다. (💖 픽셀 하트를 먹으면 체력이 회복됩니다!)
      </div>
    </div>
  );
};

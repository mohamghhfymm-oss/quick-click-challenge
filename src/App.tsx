/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, RotateCcw, Trophy, Flame, Sparkles } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
}

export default function App() {
  // Persistence using local storage
  const [count, setCount] = useState<number>(() => {
    const saved = localStorage.getItem("click_counter_value");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem("click_counter_highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem("click_counter_muted");
    return saved ? saved === "true" : false;
  });

  const [particles, setParticles] = useState<Particle[]>([]);
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([]);
  const [cps, setCps] = useState<number>(0);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);

  const buttonRef = useRef<HTMLButtonElement>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("click_counter_value", count.toString());
    if (count > highScore) {
      setHighScore(count);
      localStorage.setItem("click_counter_highscore", count.toString());
    }
  }, [count, highScore]);

  useEffect(() => {
    localStorage.setItem("click_counter_muted", isMuted.toString());
  }, [isMuted]);

  // Click Speed (CPS) calculation
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const rollingWindow = clickTimestamps.filter((t) => now - t < 1000);
      setClickTimestamps(rollingWindow);
      setCps(rollingWindow.length);
    }, 100);

    return () => clearInterval(interval);
  }, [clickTimestamps]);

  // Synthesize custom clean click sound via Web Audio API
  const playClickSound = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Playful mechanical retro click synth sound
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(450, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.08);
    } catch (error) {
      console.warn("Audio synthesis was blocked or failed", error);
    }
  }, [isMuted]);

  // Handle main click event
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    // Prevent double triggers for touch + click
    if (e.type === "touchstart") {
      e.preventDefault();
    }

    const nextCount = count + 1;
    setCount(nextCount);
    playClickSound();

    // Track for Speed CPS
    setClickTimestamps((prev) => [...prev, Date.now()]);

    // Spawning particles at the click/touch location for premium visual juice
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (buttonRef.current) {
      // Fallback to button center if keyboard event or no coordinates
      const rect = buttonRef.current.getBoundingClientRect();
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    // Generate a particle
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: clientX,
      y: clientY - 20, // slightly offset upwards
      angle: (Math.random() - 0.5) * 40, // random angle deviation
      scale: 0.8 + Math.random() * 0.5,
    };

    setParticles((prev) => [...prev, newParticle].slice(-25)); // Cap to avoid performance issues
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (document.activeElement === buttonRef.current) {
          // Normal behavior, let button handle it
          return;
        }
        e.preventDefault();
        setIsPressed(true);
        buttonRef.current?.click();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        setIsPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [count, isMuted]);

  // Clean up finished particles
  const removeParticle = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleReset = () => {
    setCount(0);
    setShowResetConfirm(false);
  };

  return (
    <div className="relative min-h-screen bg-indigo-50 text-indigo-900 flex flex-col justify-between overflow-hidden select-none p-6 md:p-12 font-sans" id="app_root">
      {/* Decorative background blobs matching the design */}
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-100 rounded-full opacity-50 z-0 pointer-events-none" id="bg_blob_indigo" />
      <div className="absolute bottom-[-20px] left-[-20px] w-48 h-48 bg-yellow-100 rounded-full opacity-50 z-0 pointer-events-none" id="bg_blob_yellow" />

      {/* Header Section */}
      <header className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 z-10" id="app_header">
        {/* Connection/Active state Badge */}
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border-2 border-indigo-100" id="status_badge">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="font-bold text-indigo-900 text-base" id="status_text">متصل الآن</span>
        </div>

        {/* Dynamic Theme Title & Brand */}
        <div className="text-center sm:text-right" id="brand_title_container">
          <h1 className="text-3xl md:text-4xl font-black text-indigo-600 tracking-tight" id="brand_title">
            تحدي الضغطات السريع
          </h1>
          <p className="text-indigo-400 font-medium uppercase tracking-widest text-xs mt-1" id="brand_subtitle">
            The Ultimate Clicker Challenge
          </p>
        </div>
      </header>

      {/* Main Gameplay Area */}
      <main className="flex-grow flex flex-col items-center justify-center w-full z-10 py-8 relative" id="main_content">
        <div className="relative flex flex-col items-center" id="game_panel">
          
          {/* Large Counter Display */}
          <div className="mb-10 text-center" id="counter_lcd">
            <AnimatePresence mode="popLayout" id="number_animator_presence">
              <motion.span
                key={count}
                initial={{ y: 25, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -25, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className="block text-[100px] md:text-[140px] leading-none font-black text-indigo-900 drop-shadow-sm tabular-nums select-none"
                id="main_counter_number"
              >
                {count.toLocaleString("ar-EG")}
              </motion.span>
            </AnimatePresence>
            <p className="text-lg md:text-xl font-bold text-indigo-400 mt-2" id="counter_sublabel">
              إجمالي الضغطات المسجلة
            </p>
          </div>

          {/* The Iconic Red Button */}
          <div className="relative group" id="button_assembly">
            {/* Ambient drop shadow behind the button */}
            <div className="absolute inset-0 bg-red-700 rounded-full translate-y-4 scale-105 blur-sm opacity-20 transition-transform duration-200 group-hover:scale-110" id="button_shadow" />
            
            <motion.button
              ref={buttonRef}
              id="main_red_button"
              onTouchStart={handleButtonClick}
              onMouseDown={(e) => {
                if (e.button === 0) { // left click only
                  handleButtonClick(e);
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              animate={isPressed ? { scale: 0.96 } : { scale: 1 }}
              className="relative w-64 h-64 md:w-72 md:h-72 bg-red-500 rounded-full border-b-[16px] border-red-700 flex items-center justify-center shadow-2xl cursor-pointer select-none outline-none focus:outline-none"
              style={{
                boxShadow: isPressed 
                  ? "inset 0 8px 16px rgba(0,0,0,0.4), 0 2px 0 #991b1b"
                  : "0 14px 0 #991b1b, 0 24px 36px rgba(153, 27, 27, 0.35)",
              }}
            >
              {/* Convex glossy white highlight ring inside */}
              <div className="w-52 h-52 md:w-60 md:h-60 rounded-full border-4 border-white/20 flex flex-col items-center justify-center" id="bezel_ring">
                <span className="text-white text-4xl md:text-5xl font-black drop-shadow-lg" id="button_cta">
                  اضغط!
                </span>
                <span className="text-[10px] text-white/70 uppercase tracking-widest font-semibold mt-1" id="button_subcta">
                  TAP ME
                </span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Floating Particle Particles Playground */}
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden" id="particle_playground">
          <AnimatePresence id="particles_presence">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, scale: p.scale, x: p.x - 20, y: p.y }}
                animate={{ 
                  opacity: 0, 
                  y: p.y - 150, // float upwards
                  x: p.x - 20 + p.angle * 1.8, // spread sideways
                  scale: p.scale * 0.7,
                  rotate: p.angle
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                onAnimationComplete={() => removeParticle(p.id)}
                className="absolute text-3xl font-black text-red-500 font-sans pointer-events-none select-none drop-shadow-[0_4px_12px_rgba(239,68,68,0.5)]"
                id={`particle_${p.id}`}
              >
                +١
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Statistics / Settings Row Area */}
      <footer className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 z-10" id="app_footer">
        
        {/* Bento Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8" id="stats_grid">
          
          {/* Card 1: High Score */}
          <div className="bg-white p-5 rounded-[28px] border-4 border-indigo-100 flex flex-col items-center justify-center shadow-sm" id="high_score_card">
            <span className="text-indigo-400 text-sm font-black mb-1 flex items-center gap-1.5" id="high_score_label">
              <Trophy className="w-4 h-4 text-amber-500" />
              أعلى رقم سجلته
            </span>
            <span className="text-3xl font-black text-indigo-900 font-mono" id="high_score_value">
              {highScore.toLocaleString("ar-EG")}
            </span>
          </div>
          
          {/* Card 2: Current speed (Yellow/Flame Accent) */}
          <div className="bg-yellow-400 p-5 rounded-[28px] border-4 border-yellow-500 flex flex-col items-center justify-center shadow-lg transition-all duration-300" id="speed_card">
            <span className="text-yellow-900 text-sm font-black mb-1 flex items-center gap-1.5" id="speed_label">
              <Flame className={`w-4 h-4 ${cps >= 3 ? "animate-bounce text-red-600" : "text-yellow-900"}`} />
              السرعة الحالية
            </span>
            <span className="text-3xl font-black text-white font-mono flex items-baseline gap-1" id="speed_value">
              {cps.toLocaleString("ar-EG")}
              <small className="text-base font-bold text-yellow-900">ضغطة/ثانية</small>
            </span>
          </div>

          {/* Card 3: Sound & Reset controls */}
          <div className="bg-white p-5 rounded-[28px] border-4 border-indigo-100 flex flex-col items-center justify-center gap-2.5 shadow-sm" id="control_card">
            <span className="text-indigo-400 text-xs font-black uppercase tracking-wider" id="control_label">
              لوحة التحكم
            </span>
            <div className="flex items-center gap-4" id="control_actions">
              {/* Reset Action */}
              <div className="relative" id="reset_action_container">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="p-2.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 transition-all cursor-pointer active:scale-90"
                    title="إعادة تعيين العداد"
                    id="reset_trigger_btn"
                  >
                    <RotateCcw className="w-4.5 h-4.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-red-50 p-1 rounded-full border border-red-200" id="reset_confirm_actions">
                    <button
                      onClick={handleReset}
                      className="px-2.5 py-1 bg-red-600 text-white rounded-full text-xs font-bold cursor-pointer hover:bg-red-500"
                      id="reset_yes"
                    >
                      تصفير
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold cursor-pointer hover:bg-indigo-200"
                      id="reset_no"
                    >
                      إلغاء
                    </button>
                  </div>
                )}
              </div>

              {/* Audio Toggle */}
              <button
                onClick={() => setIsMuted((prev) => !prev)}
                className={`p-2.5 rounded-full transition-all cursor-pointer active:scale-90 ${
                  isMuted
                    ? "bg-slate-100 text-slate-400 border border-slate-200"
                    : "bg-indigo-100 text-indigo-600 border border-indigo-200"
                }`}
                title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
                id="audio_toggle"
              >
                {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

        </div>

        {/* Keyboard instructions */}
        <p className="text-xs text-indigo-400 font-medium leading-relaxed" id="footer_tips">
          يمكنك الضغط باستخدام زر <kbd className="px-1.5 py-0.5 bg-white border border-indigo-100 rounded text-[10px] text-indigo-500 font-mono shadow-sm">Space</kbd> أو <kbd className="px-1.5 py-0.5 bg-white border border-indigo-100 rounded text-[10px] text-indigo-500 font-mono shadow-sm">Enter</kbd> من لوحة المفاتيح.
        </p>
      </footer>
    </div>
  );
}

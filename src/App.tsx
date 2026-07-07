/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Trophy, 
  Flame, 
  Sparkles, 
  Timer, 
  Zap, 
  Award, 
  Play, 
  Volume1,
  Share2,
  Check,
  RotateCw,
  HelpCircle,
  Activity,
  Heart,
  Cpu
} from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  text: string;
  color: string;
}

interface Milestone {
  id: string;
  count: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  badge: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  {
    id: "novice",
    count: 10,
    titleAr: "مبتدئ النقرات",
    titleEn: "Click Novice",
    descriptionAr: "خطوتك الأولى في عالم السرعة الرهيب!",
    descriptionEn: "Your first steps in the epic world of speed!",
    badge: "🥉",
    color: "from-amber-600 to-amber-800"
  },
  {
    id: "speedy",
    count: 50,
    titleAr: "الأصابع السريعة",
    titleEn: "Speedy Fingers",
    descriptionAr: "رائع! بدأت أصابعك تكتسب سرعة إلكترونية مذهلة.",
    descriptionEn: "Awesome! Your fingers are gaining impressive speed.",
    badge: "🥈",
    color: "from-slate-400 to-slate-600"
  },
  {
    id: "pro",
    count: 150,
    titleAr: "محترف النقرات",
    titleEn: "Click Pro",
    descriptionAr: "لقد أصبحت محترفًا حقيقيًا، استمر في تدمير الزر!",
    descriptionEn: "You are a true professional now, keep smashing!",
    badge: "🥇",
    color: "from-yellow-400 to-amber-500"
  },
  {
    id: "fever_king",
    count: 350,
    titleAr: "ملك الحماس",
    titleEn: "Fever King",
    descriptionAr: "الضغط اللانهائي هو أسلوب حياتك المفضل.",
    descriptionEn: "Infinite clicking is your favorite lifestyle.",
    badge: "🔥",
    color: "from-orange-500 to-red-600"
  },
  {
    id: "legend",
    count: 750,
    titleAr: "الضغاط الأسطوري",
    titleEn: "Legendary Clicker",
    descriptionAr: "دخلت التاريخ من أوسع أبواب الضغط والسرعة الرهيبة!",
    descriptionEn: "Entered history through the gates of incredible speed!",
    badge: "🏆",
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: "emperor",
    count: 1500,
    titleAr: "إمبراطور النقرات",
    titleEn: "Click Emperor",
    descriptionAr: "لقد تجاوزت حدود الخيال والقدرات البشرية بالكامل لتصبح إمبراطور النقرات العظيم!",
    descriptionEn: "You transcended human limits, becoming the ultimate Click Emperor!",
    badge: "👑",
    color: "from-cyan-400 to-blue-600"
  }
];

interface Upgrade {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  baseCost: number;
  costMultiplier: number;
  type: "manual_power" | "passive_cps" | "global_multiplier" | "interval_reduction";
  value: number;
}

const UPGRADES: Upgrade[] = [
  {
    id: "neon_fingers",
    titleAr: "أصابع الطاقة النيونية",
    titleEn: "Neon Power Fingers",
    descriptionAr: "تزيد قوة الضغط اليدوي بمقدار +1 لكل نقرة يدوية.",
    descriptionEn: "Increases manual click power by +1 per click.",
    icon: "👉",
    baseCost: 20,
    costMultiplier: 1.25,
    type: "manual_power",
    value: 1
  },
  {
    id: "robot_interval_reducer",
    titleAr: "مُحسِّن زمن استجابة الروبوتات (مقلل زمن النقرة)",
    titleEn: "Robot Click Interval Shrinker",
    descriptionAr: "يُقلل زمن دورة النقر التلقائي (الفاصل الزمني من ثانية واحدة فما دون) تدريجياً لزيادة سرعة تدفق النقرات وسرعة الروبوت!",
    descriptionEn: "Decreases the auto-clicker tick interval (starting from 1.0 second downwards) to speed up click streams and make the robot extremely fast!",
    icon: "⏱️",
    baseCost: 35,
    costMultiplier: 1.3,
    type: "interval_reduction",
    value: 0.08
  },
  {
    id: "mechanical_autoclicker",
    titleAr: "النقّار الميكانيكي المستمر",
    titleEn: "Mechanical Auto-Clicker",
    descriptionAr: "ينقر تلقائياً بالخلفية لإنتاج +0.5 ضغطة/ثانية.",
    descriptionEn: "Automatically clicks to produce +0.5 CPS.",
    icon: "⚙️",
    baseCost: 50,
    costMultiplier: 1.15,
    type: "passive_cps",
    value: 0.5
  },
  {
    id: "magnetic_mouse",
    titleAr: "الفأرة المغناطيسية الفائقة",
    titleEn: "Super Magnetic Mouse",
    descriptionAr: "قوة مغناطيسية تمنحك +3 لكل ضغطة يدوية.",
    descriptionEn: "Magnetic power that gives +3 per manual click.",
    icon: "🖱️",
    baseCost: 150,
    costMultiplier: 1.28,
    type: "manual_power",
    value: 3
  },
  {
    id: "click_bot",
    titleAr: "روبوت النقر الإلكتروني",
    titleEn: "Fast Click Bot",
    descriptionAr: "روبوت عالي الاستجابة ينتج +2 ضغطة/ثانية تلقائياً.",
    descriptionEn: "A high-response robot producing +2 CPS automatically.",
    icon: "🤖",
    baseCost: 400,
    costMultiplier: 1.18,
    type: "passive_cps",
    value: 2
  },
  {
    id: "infinite_script",
    titleAr: "البرنامج النصي الذكي",
    titleEn: "Infinite Click Script",
    descriptionAr: "شيفرة ذكية مبرمجة لإنتاج +8 ضغطة/ثانية بالخلفية.",
    descriptionEn: "Smart code programmed to produce +8 CPS in the background.",
    icon: "📜",
    baseCost: 1500,
    costMultiplier: 1.2,
    type: "passive_cps",
    value: 8
  },
  {
    id: "crystal_condenser",
    titleAr: "مكثف الطاقة البلورية",
    titleEn: "Crystal Energy Condenser",
    descriptionAr: "بلورة مشحونة تضيف +10 لقوة ضغطتك اليدوية.",
    descriptionEn: "Charged crystal adding +10 to your manual click power.",
    icon: "🔮",
    baseCost: 4000,
    costMultiplier: 1.3,
    type: "manual_power",
    value: 10
  },
  {
    id: "cloud_engine",
    titleAr: "محرك السحابة الذاتية",
    titleEn: "Self-Clicking Cloud Engine",
    descriptionAr: "سحابة موزعة تولد +35 ضغطة/ثانية تلقائياً وبسرعة.",
    descriptionEn: "Distributed cloud generating +35 CPS automatically and fast.",
    icon: "☁️",
    baseCost: 10000,
    costMultiplier: 1.22,
    type: "passive_cps",
    value: 35
  },
  {
    id: "cyber_fingers",
    titleAr: "الأصابع السيبرانية المعدلة",
    titleEn: "Advanced Cyber Fingers",
    descriptionAr: "أصابع معدلة جينياً تمنحك +30 لكل ضغطة يدوية.",
    descriptionEn: "Genetically modified fingers giving +30 per manual click.",
    icon: "🦾",
    baseCost: 25000,
    costMultiplier: 1.32,
    type: "manual_power",
    value: 30
  },
  {
    id: "quantum_portal",
    titleAr: "البوابة الكمومية للنقرات",
    titleEn: "Quantum Click Portal",
    descriptionAr: "بوابة من بعد آخر تتدفق منها +150 ضغطة/ثانية.",
    descriptionEn: "A portal from another dimension flowing +150 CPS.",
    icon: "🌀",
    baseCost: 75000,
    costMultiplier: 1.24,
    type: "passive_cps",
    value: 150
  },
  {
    id: "pulse_accelerator",
    titleAr: "مسرّع النبض المغناطيسي",
    titleEn: "Pulse Accelerator",
    descriptionAr: "يعجل سرعة كل أدوات النقر التلقائي بمعدل +10% من القيمة الإجمالية.",
    descriptionEn: "Speeds up all auto-clickers by +10% of total CPS.",
    icon: "⚡",
    baseCost: 200000,
    costMultiplier: 1.35,
    type: "global_multiplier",
    value: 0.1
  },
  {
    id: "hydraulic_glove",
    titleAr: "القفاز الهيدروليكي العملاق",
    titleEn: "Gigantic Hydraulic Glove",
    descriptionAr: "مكبس ضخم يسحق الزر ليضيف +120 لكل نقرة يدوية.",
    descriptionEn: "Huge piston crushing the button, adding +120 per manual click.",
    icon: "🥊",
    baseCost: 550000,
    costMultiplier: 1.35,
    type: "manual_power",
    value: 120
  },
  {
    id: "virtual_farm",
    titleAr: "مزرعة النقرات الافتراضية",
    titleEn: "Virtual Click Farm",
    descriptionAr: "خوادم متصلة بالكامل لإنتاج +700 ضغطة/ثانية بالثانية.",
    descriptionEn: "Fully connected servers producing +700 CPS.",
    icon: "🚜",
    baseCost: 1500000,
    costMultiplier: 1.26,
    type: "passive_cps",
    value: 700
  },
  {
    id: "gravity_processor",
    titleAr: "معالج الجاذبية المعكوسة",
    titleEn: "Inverted Gravity Processor",
    descriptionAr: "طاقة جاذبية تجذب النقرات لتضيف +500 لكل ضغطة يدوية.",
    descriptionEn: "Gravity energy attracting clicks, adding +500 per manual click.",
    icon: "🛰️",
    baseCost: 6000000,
    costMultiplier: 1.38,
    type: "manual_power",
    value: 500
  },
  {
    id: "nova_reactor",
    titleAr: "مفاعل السوبرنوفا النقاري",
    titleEn: "Nova Click Reactor",
    descriptionAr: "مفاعل نجمي جبار يولد +4000 ضغطة/ثانية تلقائياً.",
    descriptionEn: "Colossal stellar reactor generating +4000 CPS automatically.",
    icon: "🌟",
    baseCost: 20000000,
    costMultiplier: 1.28,
    type: "passive_cps",
    value: 4000
  },
  {
    id: "eternal_dimension",
    titleAr: "بُعد الضغط الأبدي المطلق",
    titleEn: "Eternal Click Dimension",
    descriptionAr: "البعد الأسمى لسرعة لا تدركها الأبصار تولد +25000 ضغطة/ثانية.",
    descriptionEn: "The highest dimension of unseen speed generating +25000 CPS.",
    icon: "🌌",
    baseCost: 100000000,
    costMultiplier: 1.3,
    type: "passive_cps",
    value: 25000
  },
  {
    id: "nano_assembly",
    titleAr: "المُجمِّع النانوي للضغطات",
    titleEn: "Nano Click Assembler",
    descriptionAr: "روبوتات نانوية تبني الضغطات على مستوى الجزيئات لتمنحك +2000 لكل ضغطة يدوية.",
    descriptionEn: "Nanobots building clicks at the molecular level, giving +2000 per manual click.",
    icon: "🔬",
    baseCost: 500000000,
    costMultiplier: 1.4,
    type: "manual_power",
    value: 2000
  }
];

// Global AudioContext for high fidelity and zero-lag sound reproduction
let globalAudioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!globalAudioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      globalAudioCtx = new AudioCtxClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

export default function App() {
  // Game Mode: "infinite" (classic counting) or "speed_run" (10-second test)
  const [gameMode, setGameMode] = useState<"infinite" | "speed_run">("infinite");

  // Core Click State
  const [count, setCount] = useState<number>(() => {
    const saved = localStorage.getItem("click_counter_value");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem("click_counter_highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [maxCps, setMaxCps] = useState<number>(() => {
    const saved = localStorage.getItem("click_counter_max_cps");
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem("click_counter_muted");
    return saved ? saved === "true" : false;
  });

  const [soundProfile, setSoundProfile] = useState<"studio" | "retro" | "pop" | "laser">(() => {
    const saved = localStorage.getItem("click_counter_sound_profile");
    return (saved as any) || "studio";
  });

  const [isPerformanceMode, setIsPerformanceMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("click_counter_perf_mode");
    return saved === "true";
  });

  // Speed Run Mode States
  const [speedRunTimeLeft, setSpeedRunTimeLeft] = useState<number>(10.0);
  const [speedRunActive, setSpeedRunActive] = useState<boolean>(false);
  const [speedRunFinished, setSpeedRunFinished] = useState<boolean>(false);
  const [speedRunCount, setSpeedRunCount] = useState<number>(0);
  const [speedRunHighScore, setSpeedRunHighScore] = useState<number>(() => {
    const saved = localStorage.getItem("click_counter_speedrun_highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  // UI States
  const [particles, setParticles] = useState<Particle[]>([]);
  const clickTimestampsRef = useRef<number[]>([]);
  const [cps, setCps] = useState<number>(0);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"upgrades" | "badges" | "stats" | "sounds">("upgrades");
  const [achievementToast, setAchievementToast] = useState<{ badge: string; title: string } | null>(null);

  // Upgrades State
  const [upgrades, setUpgrades] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("click_counter_upgrades_state");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {};
  });

  const buttonRef = useRef<HTMLButtonElement>(null);

  // Derive Click Power
  let additionalPower = 0;
  UPGRADES.forEach((u) => {
    const level = upgrades[u.id] || 0;
    if (u.type === "manual_power") {
      additionalPower += u.value * level;
    }
  });
  const clickPower = 1 + additionalPower;

  // Derive Passive CPS
  let totalPassiveCps = 0;
  UPGRADES.forEach((u) => {
    const level = upgrades[u.id] || 0;
    if (u.type === "passive_cps") {
      totalPassiveCps += u.value * level;
    }
  });

  // Derive Speed Bonus
  let speedBonus = 1;
  UPGRADES.forEach((u) => {
    const level = upgrades[u.id] || 0;
    if (u.type === "global_multiplier" && u.id !== "robot_interval_reducer") {
      speedBonus += u.value * level;
    }
  });

  // Robot Response/Cycle Delay calculation (reduces interval by 0.05s per upgrade)
  const reducerLevel = upgrades["robot_interval_reducer"] || 0;
  const robotCycleDelay = Math.max(0.05, 1.0 - reducerLevel * 0.05);
  const robotSpeedMultiplier = 1.0 / robotCycleDelay;

  const finalPassiveCps = totalPassiveCps * speedBonus * robotSpeedMultiplier;

  const passiveCpsAccumulatorRef = useRef<number>(0);

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

  useEffect(() => {
    localStorage.setItem("click_counter_sound_profile", soundProfile);
  }, [soundProfile]);

  useEffect(() => {
    localStorage.setItem("click_counter_perf_mode", isPerformanceMode.toString());
  }, [isPerformanceMode]);

  useEffect(() => {
    localStorage.setItem("click_counter_upgrades_state", JSON.stringify(upgrades));
  }, [upgrades]);

  // Passive click accumulator effect
  useEffect(() => {
    if (gameMode !== "infinite") return;
    if (finalPassiveCps <= 0) return;

    const intervalMs = 100;
    const timer = setInterval(() => {
      passiveCpsAccumulatorRef.current += (finalPassiveCps * intervalMs) / 1000;
      const wholeClicks = Math.floor(passiveCpsAccumulatorRef.current);
      if (wholeClicks >= 1) {
        passiveCpsAccumulatorRef.current -= wholeClicks;
        setCount((prev) => prev + wholeClicks);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [finalPassiveCps, gameMode]);

  // Upgrade Purchase Callback
  const buyUpgrade = (upgradeId: string) => {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return;

    const currentLevel = upgrades[upgradeId] || 0;
    const currentCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));

    if (count >= currentCost) {
      setCount((prev) => prev - currentCost);
      setUpgrades((prev) => ({
        ...prev,
        [upgradeId]: currentLevel + 1
      }));
      playClickSound(2); // High-fidelity confirmation tone
    } else {
      playClickSound(1); // Standard click acting as rejection feedback
    }
  };

  // Click Speed (CPS) calculation - HIGHLY OPTIMIZED
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      // Filter out timestamps older than 1000ms from our ref
      const rollingWindow = clickTimestampsRef.current.filter((t) => now - t < 1000);
      clickTimestampsRef.current = rollingWindow;
      const currentCps = rollingWindow.length;

      // Update state only if changed to avoid unnecessary renders
      setCps((prevCps) => {
        if (prevCps !== currentCps) {
          return currentCps;
        }
        return prevCps;
      });

      setMaxCps((prevMax) => {
        if (currentCps > prevMax) {
          localStorage.setItem("click_counter_max_cps", currentCps.toString());
          return currentCps;
        }
        return prevMax;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Dynamic Multiplier based on Clicks Per Second (CPS)
  const multiplier = cps >= 8 ? 3 : cps >= 5 ? 2 : 1;

  // Web Audio API custom synthesizer - REUSING GLOBAL CONTEXT FOR ZERO LATENCY
  const playClickSound = useCallback((multiplierLevel: number = 1) => {
    if (isMuted) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (soundProfile === "studio") {
        // High fidelity premium click: clean, crispy mechanical keyboard/UI tick
        oscillator.type = "sine";
        const baseFreq = multiplierLevel === 1 ? 850 : multiplierLevel === 2 ? 1050 : 1250;
        oscillator.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.025);

        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.025);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.03);
      } else if (soundProfile === "retro") {
        // High-fidelity clean vintage sound
        oscillator.type = "sine";
        const baseFreq = multiplierLevel === 1 ? 440 : multiplierLevel === 2 ? 580 : 720;
        oscillator.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq / 3, audioCtx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.07, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.055);
      } else if (soundProfile === "pop") {
        // Pristine bubble click
        oscillator.type = "sine";
        const baseFreq = multiplierLevel === 1 ? 750 : multiplierLevel === 2 ? 950 : 1150;
        oscillator.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.035);

        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.04);
      } else if (soundProfile === "laser") {
        // Clean synthesized energy wave
        oscillator.type = "sine";
        const baseFreq = multiplierLevel === 1 ? 1200 : multiplierLevel === 2 ? 1500 : 1800;
        oscillator.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 0.06);

        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.065);
      }
    } catch (error) {
      console.warn("Audio synthesis failed", error);
    }
  }, [isMuted, soundProfile]);

  // Synthesize custom triumphant milestone chime chord
  const playTriumphantSound = useCallback(() => {
    if (isMuted) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (Major chord)
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.05);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.05 + 0.25);
        
        osc.start(audioCtx.currentTime + idx * 0.05);
        osc.stop(audioCtx.currentTime + idx * 0.05 + 0.3);
      });
    } catch (e) {
      console.warn("Milestone sound failed", e);
    }
  }, [isMuted]);

  // Milestone unlocks checker
  useEffect(() => {
    if (gameMode !== "infinite") return;
    MILESTONES.forEach((m) => {
      const storageKey = `click_counter_unlocked_${m.id}`;
      const isAlreadyUnlocked = localStorage.getItem(storageKey) === "true";
      if (count >= m.count && !isAlreadyUnlocked) {
        localStorage.setItem(storageKey, "true");
        setAchievementToast({ badge: m.badge, title: m.titleAr });
        playTriumphantSound();

        // Spawn beautiful badge celebration particles only if NOT in performance mode
        if (!isPerformanceMode) {
          const b = buttonRef.current?.getBoundingClientRect();
          const startX = b ? b.left + b.width / 2 : window.innerWidth / 2;
          const startY = b ? b.top : window.innerHeight / 2;

          const burstParticles = Array.from({ length: 12 }).map((_, i) => ({
            id: Date.now() + Math.random() + i,
            x: startX + (Math.random() - 0.5) * 80,
            y: startY - 40 + (Math.random() - 0.5) * 80,
            angle: (Math.random() - 0.5) * 140,
            scale: 1.1 + Math.random() * 0.6,
            text: m.badge,
            color: "text-amber-500",
          }));
          const burstIds = burstParticles.map((p) => p.id);
          setParticles((prev) => [...prev, ...burstParticles].slice(-15));

          setTimeout(() => {
            setParticles((prev) => prev.filter((p) => !burstIds.includes(p.id)));
          }, 800);
        }
      }
    });
  }, [count, gameMode, playTriumphantSound, isPerformanceMode]);

  // Clear achievement toast automatically
  useEffect(() => {
    if (achievementToast) {
      const timer = setTimeout(() => {
        setAchievementToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [achievementToast]);

  // Speed Run Mode Countdown Timer Engine - RUNS SINGLE INTERVAL (ZERO LAG)
  useEffect(() => {
    let timerId: any;
    if (speedRunActive) {
      const intervalMs = 50;
      timerId = setInterval(() => {
        setSpeedRunTimeLeft((prev) => {
          const next = prev - intervalMs / 1000;
          if (next <= 0) {
            setSpeedRunActive(false);
            setSpeedRunFinished(true);
            playTriumphantSound();
            return 0;
          }
          return parseFloat(next.toFixed(2));
        });
      }, intervalMs);
    } else {
      if (timerId) clearInterval(timerId);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [speedRunActive, playTriumphantSound]);

  // Save speed run high score on completed run
  useEffect(() => {
    if (speedRunFinished) {
      if (speedRunCount > speedRunHighScore) {
        setSpeedRunHighScore(speedRunCount);
        localStorage.setItem("click_counter_speedrun_highscore", speedRunCount.toString());
      }
    }
  }, [speedRunFinished, speedRunCount, speedRunHighScore]);

  // Click handler
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (e.type === "touchstart") {
      e.preventDefault();
    }

    if (gameMode === "speed_run") {
      if (speedRunFinished) return; // Frozen until reset

      if (!speedRunActive && speedRunTimeLeft === 10.0) {
        // Start the speedrun!
        setSpeedRunActive(true);
        setSpeedRunCount(1);
        playClickSound(1);
      } else if (speedRunActive) {
        setSpeedRunCount((prev) => prev + 1);
        playClickSound(multiplier);
      } else {
        return;
      }
    } else {
      // Infinite Mode logic: add clicks based on clickPower!
      const bonus = clickPower;
      setCount((prev) => prev + bonus);
      playClickSound(multiplier);
    }

    // Track rolling click speed - ULTRA FAST ref tracking to prevent state churn
    clickTimestampsRef.current.push(Date.now());

    // Gather coordinate for particles
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    // Spawn floating number particles only if NOT in performance mode
    if (!isPerformanceMode) {
      // Design visual flavor of particles based on clickPower / multiplier
      let particleText = "+١";
      let particleColor = "text-indigo-600";

      if (gameMode === "speed_run") {
        particleText = "+1";
        particleColor = "text-red-500 font-bold";
      } else {
        if (clickPower > 1) {
          particleText = `+${clickPower.toLocaleString("ar-EG")}`;
          if (multiplier === 2) {
            particleText += " 🔥";
            particleColor = "text-orange-500 font-extrabold";
          } else if (multiplier === 3) {
            particleText += " ⚡";
            particleColor = "text-yellow-500 font-black";
          } else {
            particleColor = "text-indigo-600 font-black";
          }
        } else {
          // Randomly add little stars or emojis occasionally
          const randomChance = Math.random();
          if (randomChance < 0.1) {
            particleText = "✨";
            particleColor = "text-amber-400 font-medium";
          } else if (randomChance < 0.15) {
            particleText = "⭐";
            particleColor = "text-amber-500 font-medium";
          } else {
            particleText = "+١";
            particleColor = "text-indigo-600";
          }
        }
      }

      const particleId = Date.now() + Math.random();
      const newParticle: Particle = {
        id: particleId,
        x: clientX,
        y: clientY - 30,
        angle: (Math.random() - 0.5) * 50,
        scale: 0.9 + Math.random() * 0.5,
        text: particleText,
        color: particleColor,
      };

      setParticles((prev) => [...prev, newParticle].slice(-8));

      // Robust guaranteed cleanup after 800ms
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particleId));
      }, 800);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (document.activeElement === buttonRef.current) {
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
  }, [count, gameMode, speedRunActive, speedRunFinished, multiplier]);

  const removeParticle = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleResetInfinite = () => {
    setCount(0);
    setUpgrades({});
    localStorage.removeItem("click_counter_upgrades_state");
    setShowResetConfirm(false);
    // Clear all unlocked flags in localStorage for milestones
    MILESTONES.forEach((m) => {
      localStorage.removeItem(`click_counter_unlocked_${m.id}`);
    });
  };

  const handleResetSpeedRun = () => {
    setSpeedRunTimeLeft(10.0);
    setSpeedRunActive(false);
    setSpeedRunFinished(false);
    setSpeedRunCount(0);
  };

  // Trigger burst of badge emoji when clicked (for gamified feedback)
  const handleBadgeClick = (m: Milestone, e: React.MouseEvent) => {
    const storageKey = `click_counter_unlocked_${m.id}`;
    const isUnlocked = count >= m.count || localStorage.getItem(storageKey) === "true";
    if (!isUnlocked) return;

    playClickSound(3); // playful high-pitched laser zap
    
    if (!isPerformanceMode) {
      const burstParticles = Array.from({ length: 6 }).map((_, i) => ({
        id: Date.now() + Math.random() + i,
        x: e.clientX + (Math.random() - 0.5) * 30,
        y: e.clientY + (Math.random() - 0.5) * 30,
        angle: (Math.random() - 0.5) * 160,
        scale: 1.1 + Math.random() * 0.5,
        text: m.badge,
        color: "text-amber-500",
      }));
      const burstIds = burstParticles.map((p) => p.id);
      setParticles((prev) => [...prev, ...burstParticles].slice(-10));

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !burstIds.includes(p.id)));
      }, 800);
    }
  };

  // Find next milestone badge details
  const nextMilestone = MILESTONES.find((m) => count < m.count);
  const prevMilestoneCount = MILESTONES.slice().reverse().find((m) => count >= m.count)?.count || 0;
  const milestoneProgressPercent = nextMilestone
    ? Math.min(
        100,
        Math.max(
          0,
          ((count - prevMilestoneCount) / (nextMilestone.count - prevMilestoneCount)) * 100
        )
      )
    : 100;

  return (
    <div 
      className="relative min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between overflow-hidden select-none p-4 md:p-8 font-sans" 
      id="app_root"
      dir="rtl"
    >
      {/* Decorative ambient background elements */}
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 bg-indigo-100 rounded-full opacity-40 z-0 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-80 h-80 bg-rose-100 rounded-full opacity-40 z-0 blur-3xl pointer-events-none" />

      {/* Upgraded Custom Achievement Toast Notification */}
      <AnimatePresence id="toast_presence">
        {achievementToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-white border-2 border-amber-300 shadow-2xl rounded-2xl p-4 flex items-center gap-4 max-w-sm w-11/12"
            id="milestone_unlocked_toast"
          >
            <div className="text-4xl bg-amber-50 p-2.5 rounded-xl border border-amber-100" id="toast_badge">
              {achievementToast.badge}
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-0.5">إنجاز جديد فتح!</span>
              <h4 className="font-extrabold text-slate-800 text-lg leading-tight" id="toast_title">{achievementToast.title}</h4>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Container */}
      <header className="w-full max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 z-10" id="app_header">
        {/* Dynamic status badges (including Performance Mode indicator) */}
        <div className="flex flex-wrap items-center gap-3 justify-center" id="header_status_badges">
          <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-slate-200/80" id="status_badge">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-700 text-sm md:text-base" id="status_text">
              {gameMode === "infinite" ? "التحدي اللانهائي" : "تحدي الـ 10 ثواني"}
            </span>
          </div>

          <button
            onClick={() => setIsPerformanceMode((p) => !p)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl shadow-sm border cursor-pointer transition-all ${
              isPerformanceMode
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-black"
                : "bg-white border-slate-200/80 text-slate-500 hover:text-slate-700"
            }`}
            id="header_perf_badge"
            title="تفعيل وضع الأداء الفائق لإلغاء الرسوم واللاّج"
          >
            <Cpu className="w-4 h-4" />
            <span className="text-xs md:text-sm font-bold">
              {isPerformanceMode ? "وضع الأداء الأقصى ⚡" : "الوضع العادي"}
            </span>
          </button>
        </div>

        {/* Dynamic Mode Switcher Pill */}
        <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 shadow-inner" id="mode_switcher">
          <button
            onClick={() => {
              setGameMode("infinite");
              handleResetSpeedRun();
            }}
            className={`px-5 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
              gameMode === "infinite"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            id="mode_infinite_btn"
          >
            العداد اللانهائي
          </button>
          <button
            onClick={() => {
              setGameMode("speed_run");
              handleResetSpeedRun();
            }}
            className={`px-5 py-2 rounded-xl text-sm font-black transition-all cursor-pointer ${
              gameMode === "speed_run"
                ? "bg-white text-red-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
            id="mode_speedrun_btn"
          >
            تحدي الـ 10 ثواني
          </button>
        </div>

        {/* Brand Information */}
        <div className="text-center md:text-left md:text-left flex flex-col items-center md:items-end" id="brand_title_container">
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-600 to-rose-500 bg-clip-text text-transparent tracking-tight" id="brand_title">
            تحدي الضغطات السريع
          </h1>
          <p className="text-slate-400 font-bold tracking-wider text-[10px] mt-0.5" id="brand_subtitle">
            QUICK CLICK CHALLENGE
          </p>
        </div>
      </header>

      {/* Main Sandbox Play Area */}
      <main className="flex-grow flex flex-col items-center justify-center w-full z-10 py-6 md:py-10 relative" id="main_content">
        <div className="relative flex flex-col items-center w-full max-w-md" id="game_panel">
          
          {/* Main Gameplay Screen Content */}
          {gameMode === "infinite" ? (
            /* Infinite Counter Layout */
            <div className="mb-6 text-center" id="counter_lcd">
              <span
                className="block text-[85px] md:text-[110px] leading-none font-black text-slate-800 drop-shadow-sm tabular-nums select-none"
                id="main_counter_number"
              >
                {count.toLocaleString("ar-EG")}
              </span>
              <p className="text-sm md:text-base font-bold text-slate-400 mt-1 flex items-center justify-center gap-1.5" id="counter_sublabel">
                <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                مجموع النقرات الفائقة
              </p>
            </div>
          ) : (
            /* Speed Run Layout */
            <div className="mb-6 text-center w-full px-4" id="speedrun_dashboard">
              <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm mb-4" id="speedrun_bar_stats">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">النقرات الحالية</span>
                  <span className="text-2xl font-black text-red-600 font-mono" id="sr_current_count">{speedRunCount}</span>
                </div>
                
                {/* Visual Timer Display */}
                <div className="px-4 py-1 bg-red-50 border border-red-100 rounded-xl flex items-center gap-1.5" id="sr_timer_badge">
                  <Timer className={`w-4 h-4 text-red-500 ${speedRunActive ? "animate-spin" : ""}`} />
                  <span className="text-xl font-extrabold text-red-600 font-mono min-w-[55px] text-center" id="sr_timer_value">
                    {speedRunTimeLeft.toFixed(1)}s
                  </span>
                </div>

                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">الرقم القياسي</span>
                  <span className="text-2xl font-black text-slate-700 font-mono" id="sr_high_score">{speedRunHighScore}</span>
                </div>
              </div>

              {/* Progress Bar for the 10-second timer */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden" id="timer_progressbar_container">
                <div 
                  className="h-full bg-red-500 transition-all duration-75 ease-linear" 
                  style={{ width: `${(speedRunTimeLeft / 10.0) * 100}%` }}
                  id="timer_progressbar"
                />
              </div>
            </div>
          )}

          {/* The Central Iconic Action Click Button */}
          <div className="relative group my-4" id="button_assembly">
            {/* Ambient dynamic glowing background depending on mode and fever levels */}
            <div 
              className={`absolute inset-0 rounded-full translate-y-3 scale-105 blur-xl opacity-25 transition-all duration-300 ${
                gameMode === "speed_run" 
                  ? "bg-red-500 group-hover:scale-110" 
                  : multiplier === 3 
                    ? "bg-yellow-400 animate-pulse scale-115 opacity-50" 
                    : multiplier === 2 
                      ? "bg-orange-500 scale-110 opacity-40" 
                      : "bg-indigo-500 group-hover:scale-108"
              }`} 
              id="button_shadow" 
            />

            {/* Glowing electrical border rings for high multi-pliers */}
            {gameMode === "infinite" && multiplier >= 2 && (
              <div 
                className={`absolute inset-[-8px] rounded-full opacity-70 animate-ping pointer-events-none ${
                  multiplier === 3 ? "border-4 border-yellow-400" : "border-4 border-orange-500"
                }`} 
                id="fever_glow_ring" 
              />
            )}
            
            <motion.button
              ref={buttonRef}
              id="main_red_button"
              onTouchStart={handleButtonClick}
              onMouseDown={(e) => {
                if (e.button === 0) { // Left click only
                  handleButtonClick(e);
                }
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              animate={isPressed ? { scale: 0.95 } : { scale: 1 }}
              className={`relative w-64 h-64 md:w-68 md:h-68 rounded-full border-b-[14px] flex items-center justify-center shadow-xl cursor-pointer select-none outline-none focus:outline-none transition-colors duration-200 ${
                gameMode === "speed_run"
                  ? speedRunFinished 
                    ? "bg-slate-400 border-slate-600 cursor-not-allowed"
                    : speedRunActive 
                      ? "bg-red-500 border-red-700" 
                      : "bg-rose-500 border-rose-700"
                  : multiplier === 3 
                    ? "bg-yellow-400 border-yellow-600 text-yellow-950" 
                    : multiplier === 2 
                      ? "bg-orange-500 border-orange-700 text-white" 
                      : "bg-indigo-600 border-indigo-800 text-white"
              }`}
              style={{
                boxShadow: isPressed 
                  ? "inset 0 8px 16px rgba(0,0,0,0.35)"
                  : "0 10px 0 rgba(0, 0, 0, 0.15)",
              }}
              disabled={gameMode === "speed_run" && speedRunFinished}
            >
              {/* Internal bezel high-tech line ring */}
              <div className="w-52 h-52 md:w-56 md:h-56 rounded-full border-4 border-white/20 flex flex-col items-center justify-center gap-1" id="bezel_ring">
                
                {/* Fever Mode Icon and Header */}
                {gameMode === "infinite" && multiplier > 1 && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1 px-2.5 py-0.5 bg-black/20 rounded-full text-[10px] font-black uppercase tracking-wide text-white mb-1"
                    id="multiplier_capsule"
                  >
                    <Flame className="w-3.5 h-3.5 animate-bounce text-yellow-300" />
                    <span>مضاعف {multiplier}x</span>
                  </motion.div>
                )}

                <span className="text-white text-3xl md:text-4xl font-extrabold drop-shadow-md select-none tracking-tight" id="button_cta">
                  {gameMode === "speed_run" 
                    ? speedRunFinished 
                      ? "انتهى الوقت" 
                      : speedRunActive 
                        ? "اضغط بسرعة!" 
                        : "اضغط للبدء!" 
                    : "انقر!"}
                </span>

                <span className="text-[9px] text-white/70 font-bold uppercase tracking-widest mt-0.5 select-none" id="button_subcta">
                  {gameMode === "speed_run" 
                    ? speedRunActive 
                      ? "TAP FAST" 
                      : "TAP TO START" 
                    : "HIT ME"}
                </span>
              </div>
            </motion.button>
          </div>

          {/* Quick interactive retry trigger for finished Speed Run */}
          {gameMode === "speed_run" && speedRunFinished && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-center"
              id="speedrun_retry_panel"
            >
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-lg text-center mb-3" id="speedrun_results_card">
                <span className="text-xs font-bold text-slate-400 block mb-1">نتائج التحدي الأخير</span>
                <p className="text-lg font-black text-slate-800" id="sr_result_text">
                  لقد حققت <span className="text-red-500 font-mono text-2xl">{speedRunCount}</span> نقرات!
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  معدل السرعة: <span className="font-bold font-mono">{(speedRunCount / 10).toFixed(1)}</span> نقرة في الثانية
                </p>
              </div>

              <button
                onClick={handleResetSpeedRun}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-2 mx-auto"
                id="sr_retry_btn"
              >
                <RotateCw className="w-4.5 h-4.5" />
                إعادة المحاولة
              </button>
            </motion.div>
          )}

          {/* Infinite Mode Progression Bar Indicator */}
          {gameMode === "infinite" && nextMilestone && (
            <div className="w-full px-4 mt-2" id="progression_widget">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1" id="progression_labels">
                <span>التحدي القادم: {nextMilestone.titleAr} ({nextMilestone.badge})</span>
                <span className="font-mono">{count} / {nextMilestone.count}</span>
              </div>
              <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden border border-slate-200" id="progression_bar_track">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-rose-400 rounded-full transition-all duration-300" 
                  style={{ width: `${milestoneProgressPercent}%` }}
                  id="progression_bar_fill"
                />
              </div>
            </div>
          )}

        </div>

        {/* Dynamic Flying Burst Particle Canvas */}
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden" id="particle_playground">
          <AnimatePresence id="particles_presence">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, scale: p.scale, x: p.x - 20, y: p.y }}
                animate={{ 
                  opacity: 0, 
                  y: p.y - 140, // Drift skyward
                  x: p.x - 20 + p.angle * 1.5, // Wander horizontally
                  scale: p.scale * 0.7,
                  rotate: p.angle
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                onAnimationComplete={() => removeParticle(p.id)}
                className={`absolute text-2xl font-black font-sans pointer-events-none select-none drop-shadow-md ${p.color}`}
                id={`particle_${p.id}`}
              >
                {p.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Stats/Settings Bento Grid Section */}
      <footer className="w-full max-w-5xl mx-auto flex flex-col items-center gap-6 z-10" id="app_footer">
        
        {/* Navigation Tabs for Bento Area */}
        <div className="w-full flex border-b border-slate-200 overflow-x-auto scrollbar-none" id="bento_nav">
          <button
            onClick={() => setActiveTab("upgrades")}
            className={`py-3 px-6 text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "upgrades"
                ? "border-indigo-500 text-indigo-600 font-black"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
            id="tab_upgrades"
          >
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
            متجر التطويرات الفائقة ⚡
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`py-3 px-6 text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "badges"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
            id="tab_badges"
          >
            <Award className="w-4 h-4" />
            الأوسمة والإنجازات
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-3 px-6 text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "stats"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
            id="tab_stats"
          >
            <Trophy className="w-4 h-4" />
            إحصائياتي الشاملة
          </button>
          <button
            onClick={() => setActiveTab("sounds")}
            className={`py-3 px-6 text-sm font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === "sounds"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
            id="tab_sounds"
          >
            <Volume2 className="w-4 h-4" />
            لوحة الصوت والتحكم
          </button>
        </div>

        {/* Tab Contents */}
        <div className="w-full min-h-[160px]" id="bento_container">
          <AnimatePresence mode="wait" id="tab_content_animator">
            {activeTab === "upgrades" && (
              <motion.div
                key="upgrades_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex flex-col gap-6"
                id="upgrades_tab_content"
              >
                {/* Stats Header Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200/60" id="upgrades_stats_bar">
                  <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/50 shadow-xs" id="upgrades_stat_manual">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">قوة النقرة اليدوية الحالية</span>
                      <span className="text-base font-black text-slate-800 font-mono">+{clickPower.toLocaleString("ar-EG")} ضغطة / نقرة</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/50 shadow-xs" id="upgrades_stat_passive">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">معدل النقر التلقائي الكلي</span>
                      <span className="text-base font-black text-indigo-600 font-mono">+{finalPassiveCps.toLocaleString("ar-EG")} ضغطة / ثانية</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/50 shadow-xs" id="upgrades_stat_cycle">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">تأخير دورة الروبوتات</span>
                      <span className="text-base font-black text-rose-500 font-mono">{(robotCycleDelay).toFixed(2).toLocaleString()} ثانية</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200/50 shadow-xs" id="upgrades_stat_multiplier">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">مضاعف الحماس (CPS)</span>
                      <span className="text-base font-black text-amber-500 font-mono">{multiplier}x (مضاعف نشط)</span>
                    </div>
                  </div>
                </div>

                {/* Upgrades Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full" id="upgrades_grid">
                  {UPGRADES.map((u) => {
                    const level = upgrades[u.id] || 0;
                    const cost = Math.floor(u.baseCost * Math.pow(u.costMultiplier, level));
                    const canAfford = count >= cost;
                    
                    return (
                      <div
                        key={u.id}
                        className={`relative p-4 rounded-2xl border-2 flex flex-col justify-between gap-3 transition-all ${
                          canAfford
                            ? "bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01]"
                            : "bg-slate-50/60 border-slate-200 opacity-80"
                        }`}
                        id={`upgrade_card_${u.id}`}
                      >
                        {/* Upper Info */}
                        <div className="flex items-start gap-3" id={`upgrade_info_${u.id}`}>
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl select-none" id={`upgrade_icon_container_${u.id}`}>
                            {u.icon}
                          </div>
                          <div className="flex-1" id={`upgrade_text_${u.id}`}>
                            <div className="flex justify-between items-center" id={`upgrade_title_row_${u.id}`}>
                              <h4 className="text-xs font-black text-slate-800 line-clamp-1">{u.titleAr}</h4>
                              {level > 0 && (
                                <span className="text-[10px] px-2 py-0.5 bg-indigo-500 text-white font-extrabold rounded-full">
                                  مستوى {level.toLocaleString("ar-EG")}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1 line-clamp-2">{u.descriptionAr}</p>
                          </div>
                        </div>

                        {/* Bottom Buy Action */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3" id={`upgrade_buy_row_${u.id}`}>
                          <div id={`upgrade_cost_box_${u.id}`}>
                            <span className="text-[8px] font-bold text-slate-400 block uppercase">التكلفة المطلوبة</span>
                            <span className={`text-xs font-black font-mono ${canAfford ? "text-slate-700" : "text-slate-400"}`}>
                              {cost.toLocaleString("ar-EG")} ضغطة
                            </span>
                          </div>

                          <button
                            onClick={() => buyUpgrade(u.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                              canAfford
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95"
                                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            }`}
                            id={`upgrade_btn_${u.id}`}
                          >
                            تطوير ⚡
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === "badges" && (
              <motion.div
                key="badges_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full"
                id="badges_tab_content"
              >
                {MILESTONES.map((m) => {
                  const storageKey = `click_counter_unlocked_${m.id}`;
                  const isUnlocked = count >= m.count || localStorage.getItem(storageKey) === "true";
                  
                  return (
                    <div
                      key={m.id}
                      onClick={(e) => handleBadgeClick(m, e)}
                      className={`relative p-4 rounded-2xl border-2 flex flex-col items-center text-center transition-all cursor-pointer ${
                        isUnlocked 
                          ? "bg-white border-indigo-100 hover:border-indigo-200 hover:shadow-md hover:scale-[1.02]" 
                          : "bg-slate-100/70 border-slate-200 opacity-60"
                      }`}
                      title={m.descriptionAr}
                      id={`badge_card_${m.id}`}
                    >
                      {/* Ribbon lock indicator */}
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-400 rounded-md font-bold">
                          {m.count}
                        </div>
                      )}
                      
                      <span className={`text-4xl mb-2 block ${isUnlocked ? "animate-wiggle" : "grayscale"}`} id={`badge_icon_${m.id}`}>
                        {m.badge}
                      </span>
                      
                      <h5 className="text-xs font-black text-slate-800 leading-tight" id={`badge_title_${m.id}`}>
                        {m.titleAr}
                      </h5>
                      <span className="text-[9px] text-slate-400 mt-0.5 leading-none block font-mono" id={`badge_req_${m.id}`}>
                        {m.count} ضغطة
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div
                key="stats_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
                id="stats_tab_content"
              >
                {/* Stats 1: Maximum Clicking Speed CPS */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4" id="stats_max_cps">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl" id="max_cps_ico">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">أعلى سرعة نقر (الرقم التاريخي)</span>
                    <span className="text-xl font-black text-slate-800 font-mono" id="max_cps_val">{maxCps.toLocaleString("ar-EG")} ضغطة/ث</span>
                  </div>
                </div>

                {/* Stats 2: Infinite High Score */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4" id="stats_total_high">
                  <div className="p-3 bg-amber-50 text-amber-500 rounded-xl" id="total_high_ico">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">أعلى عداد لانهائي</span>
                    <span className="text-xl font-black text-slate-800 font-mono" id="total_high_val">{highScore.toLocaleString("ar-EG")} نقرة</span>
                  </div>
                </div>

                {/* Stats 3: Speed Run High Score */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4" id="stats_speedrun_high">
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl" id="speedrun_high_ico">
                    <Timer className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">أعلى نتيجة (تحدي 10ث)</span>
                    <span className="text-xl font-black text-slate-800 font-mono" id="speedrun_high_val">{speedRunHighScore.toLocaleString("ar-EG")} نقرة</span>
                  </div>
                </div>

                {/* Stats 4: Clicks Per Second Active */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4" id="stats_active_cps">
                  <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl animate-pulse" id="active_cps_ico">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">معدل السرعة الحالي</span>
                    <span className="text-xl font-black text-slate-800 font-mono" id="active_cps_val">{cps.toLocaleString("ar-EG")} ضغطة/ثانية</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "sounds" && (
              <motion.div
                key="sounds_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                id="sounds_tab_content"
              >
                {/* Left Side: Sound Profile Switchers */}
                <div className="flex flex-col gap-2 w-full md:w-auto" id="sound_profile_selector">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">سمات المؤثرات الصوتية:</span>
                  <div className="flex flex-wrap items-center gap-2" id="sound_profile_buttons">
                    <button
                      onClick={() => {
                        setSoundProfile("studio");
                        playClickSound(1);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        soundProfile === "studio"
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      id="sound_studio_btn"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      نقر استوديو ناعم (Studio Click)
                    </button>

                    <button
                      onClick={() => {
                        setSoundProfile("retro");
                        playClickSound(1);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        soundProfile === "retro"
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      id="sound_retro_btn"
                    >
                      <Volume1 className="w-4 h-4" />
                      ميكانيكي ريترو (Retro Synth)
                    </button>
                    
                    <button
                      onClick={() => {
                        setSoundProfile("pop");
                        playClickSound(1);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        soundProfile === "pop"
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      id="sound_pop_btn"
                    >
                      <Volume2 className="w-4 h-4" />
                      فقاعات بوب (Pop Synth)
                    </button>

                    <button
                      onClick={() => {
                        setSoundProfile("laser");
                        playClickSound(1);
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        soundProfile === "laser"
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      id="sound_laser_btn"
                    >
                      <Zap className="w-4 h-4" />
                      ليزر حاد (Laser Zap)
                    </button>

                    {/* Quick Mute Toggle */}
                    <button
                      onClick={() => setIsMuted((prev) => !prev)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isMuted
                          ? "bg-red-50 border-red-300 text-red-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      id="sound_mute_btn"
                    >
                      {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                      {isMuted ? "كتم الصوت الآن" : "الصوت مفعل"}
                    </button>

                    {/* Performance Mode Toggle */}
                    <button
                      onClick={() => setIsPerformanceMode((prev) => !prev)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isPerformanceMode
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                      id="sound_perf_toggle_btn"
                      title="يزيل الرسوم العائمة لضمان استجابة لحظية مائة بالمائة"
                    >
                      <Cpu className="w-4 h-4" />
                      {isPerformanceMode ? "وضع الأداء الأقصى: مفعّل ⚡" : "وضع الأداء الأقصى: معطّل 🐢"}
                    </button>
                  </div>
                </div>

                {/* Right Side: Dangerous Area (Reset Infinite score) */}
                <div className="flex flex-col gap-2 w-full md:w-auto md:border-r border-slate-200 md:pr-6" id="danger_reset_zone">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">منطقة الإدارة:</span>
                  
                  {!showResetConfirm ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      id="reset_trigger_btn"
                    >
                      <RotateCcw className="w-4 h-4" />
                      إعادة تعيين وتصفير جميع العدادات
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-red-50 p-1.5 rounded-xl border border-red-200" id="reset_confirm_actions">
                      <span className="text-[10px] font-black text-red-700 px-2">هل أنت متأكد؟</span>
                      <button
                        onClick={handleResetInfinite}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black cursor-pointer shadow-sm transition-all"
                        id="reset_yes"
                      >
                        نعم، تصفير!
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold cursor-pointer transition-all"
                        id="reset_no"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic keyboard and touch tip label */}
        <p className="text-[11px] text-slate-400 font-bold leading-relaxed text-center flex items-center justify-center gap-1.5" id="footer_tips">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>تلميحات: يمكنك الضغط باستخدام مفتاح المسافة <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-indigo-600 font-mono shadow-sm">Space</kbd> أو <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-indigo-600 font-mono shadow-sm">Enter</kbd> لتجربة لعب أسرع وأكثر تفاعلية!</span>
        </p>

        {/* Small lovely developer tag */}
        <div className="text-[10px] text-slate-400/80 font-bold flex items-center gap-1" id="dev_footer_credit">
          <span>صنع بكل</span>
          <Heart className="w-3 h-3 text-red-400 fill-red-400" />
          <span>لتقديم أفضل تجربة تحدي</span>
        </div>
      </footer>
    </div>
  );
}

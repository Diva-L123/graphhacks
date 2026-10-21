"use client"; // Required for Next.js App Router

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { Sparkles, Database, Network, ShieldCheck, ArrowDown } from "lucide-react";

interface InteractiveVideoHeroProps {
  onInitializeSession?: () => void;
}

export default function InteractiveVideoHero({ onInitializeSession }: InteractiveVideoHeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for mouse tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Convert mouse position to 3D rotation (Spring physics for smooth, weighty feel)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20,
  });

  // Mouse spotlight coordinates (with spring physics)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 250, damping: 25 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 250, damping: 25 });

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Normalize mouse position to -0.5 to 0.5
    const mouseXNorm = (event.clientX - rect.left) / width - 0.5;
    const mouseYNorm = (event.clientY - rect.top) / height - 0.5;

    x.set(mouseXNorm);
    y.set(mouseYNorm);

    // Set spotlight exact pixel coordinates
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }

  const handleCtaClick = () => {
    if (onInitializeSession) {
      onInitializeSession();
    } else {
      const target = document.getElementById("interactive-workbench");
      target?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto pt-6 pb-12 px-4">
      {/* Decorative top badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          FalkorDB Graph Engine v0.4
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/30 backdrop-blur-md">
          <Network className="w-3.5 h-3.5 text-purple-400" />
          Cross-Session Relational Memory
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          100% Traceable Decision Path
        </span>
      </div>

      {/* Perspective container for 3D effect */}
      <div className="[perspective:1200px] w-full">
        <motion.div
          ref={ref}
          onMouseMove={handleMouse}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative w-full h-[480px] md:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/25 bg-slate-950 cursor-crosshair group transition-shadow duration-500 hover:shadow-cyan-500/10"
        >
          {/* 1. THE VIDEO */}
          <video
            src="/graph-loop.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-105 pointer-events-none transition-transform duration-700 group-hover:scale-110"
          />

          {/* 2. DARK GRADIENT OVERLAY (For text readability) */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />

          {/* 3. MOUSE-TRACKING NEON SPOTLIGHT */}
          <motion.div
            style={{
              left: smoothMouseX,
              top: smoothMouseY,
              x: "-50%",
              y: "-50%",
            }}
            animate={{ opacity: isHovered ? 1 : 0.2 }}
            transition={{ duration: 0.3 }}
            className="absolute w-[450px] h-[450px] rounded-full pointer-events-none mix-blend-screen"
          >
            <div className="w-full h-full rounded-full bg-cyan-400/25 blur-3xl" />
          </motion.div>

          {/* Floating interactive 3D chip in upper right */}
          <div
            className="absolute top-6 right-6 hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 pointer-events-none"
            style={{ transform: "translateZ(35px)" }}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono text-cyan-200">Live Cypher: Active</span>
          </div>

          {/* 4. INTERACTIVE CONTENT OVERLAY (Pushed forward in 3D space) */}
          <div
            className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 pointer-events-none"
            style={{ transform: "translateZ(55px)" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 mb-3 text-xs md:text-sm font-semibold tracking-wider uppercase text-cyan-400"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Next-Gen Cognitive Architecture
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight"
            >
              Context-Aware <span className="text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">AI Agent</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed mb-2"
            >
              Powered by <strong className="text-white font-semibold">FalkorDB</strong>. Transcends flat context windows with
              relational graph reasoning, persistent memory spanning multiple sessions, and 100% verifiable decision traceability.
            </motion.p>

            {/* Interactive CTA & Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pointer-events-auto">
              <motion.button
                onClick={handleCtaClick}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/50 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Initialize Graph Session</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </motion.button>

              <button
                onClick={() => {
                  const target = document.getElementById("interactive-workbench");
                  target?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ArrowDown className="w-4 h-4 text-cyan-400" />
                Explore Pillars & Architecture
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

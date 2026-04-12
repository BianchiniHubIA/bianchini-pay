import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  ChartLineUp,
  Lightning,
  CaretRight,
  GlobeHemisphere,
  Faders,
  CaretDown,
  CheckCircle,
} from "@phosphor-icons/react";

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

const MagneticButton = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 200, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`relative inline-flex z-10 ${className}`}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.div>
  );
};

const LiquidGlassPanel = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative bg-white/[0.02] backdrop-blur-[24px] border border-white/[0.06] rounded-[2rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const SectionHero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-[100dvh] w-full flex items-center pt-24 pb-12 overflow-hidden px-4 md:px-0">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 120,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-[800px] h-[800px] rounded-full opacity-[0.03]"
          style={{
            background: "conic-gradient(from 0deg, transparent, #FF4A00, transparent)",
            filter: "blur(100px)",
          }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Left Text Content */}
          <motion.div
            style={{ y: y1, opacity }}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start px-4 md:px-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span className="flex h-2 w-2 rounded-full bg-[#FF4A00] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Taste Skill Beta
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] tracking-tighter leading-[0.95] font-bold text-white mb-6 font-heading">
              Conversion <br />
              <span className="text-zinc-500">Engineered.</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-[45ch] leading-relaxed mb-10 font-body mix-blend-lighten">
              Deploy elite payment infrastructure in minutes. We optimized every pixel and latency spec to maximize your conversion rate. Complete white-label control over the entire funnel.
            </p>

            <div className="flex items-center gap-6 cursor-pointer">
              <MagneticButton>
                <Link to="/auth">
                  <div className="group relative overflow-hidden rounded-full bg-zinc-100 text-zinc-950 px-8 py-4 font-semibold shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] transition-all hover:bg-white flex items-center gap-2">
                    Start Building
                    <div className="w-5 h-5 rounded-full bg-zinc-950 text-white flex items-center justify-center transform group-hover:translate-x-1 group-hover:bg-[#FF4A00] transition-all duration-300">
                      <ArrowRight weight="bold" className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </MagneticButton>
              <Link to="/auth" className="group flex items-center gap-2 text-zinc-400 font-medium hover:text-white transition-colors">
                View Documentation
                <CaretRight weight="bold" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right Holographic App Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden md:block perspective-[1200px]"
          >
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              className="relative rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-[0_0_80px_-20px_rgba(255,74,0,0.15)] overflow-hidden h-[600px]"
            >
              <div className="absolute top-0 left-0 right-0 h-12 border-b border-white/[0.06] bg-white/[0.01] flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                </div>
                <div className="flex-1 text-center font-mono text-[10px] text-zinc-600 tracking-wider">
                  pay.bianchini.dev
                </div>
              </div>
              <div className="p-8 pt-20">
                {/* Perpetual Mockup Content */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end mb-12">
                    <div>
                      <div className="h-4 w-16 bg-zinc-800 rounded mb-2" />
                      <div className="h-10 w-48 bg-zinc-100 rounded" />
                    </div>
                    <div className="h-10 w-10 rounded-full border border-zinc-800 flex items-center justify-center">
                      <ChartLineUp weight="bold" className="text-zinc-500" />
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="border-t border-zinc-900 py-4 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
                          <CheckCircle weight="fill" className="text-[#FF4A00] opacity-80" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-24 bg-zinc-800 rounded" />
                          <div className="h-2 w-16 bg-zinc-900 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-12 bg-zinc-800 rounded" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 z-10 pointer-events-none"
                animate={{
                  background: [
                    "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.0) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.0) 55%, transparent 100%)",
                    "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.0) -45%, rgba(255,255,255,0.05) -50%, rgba(255,255,255,0.0) -55%, transparent 100%)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SectionBento = () => {
  return (
    <section className="relative py-32 px-4 md:px-12 max-w-[1400px] mx-auto w-full border-t border-white/[0.04]">
      <div className="mb-20 text-left md:text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-6 uppercase">
          Engineered to Scale
        </h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed mix-blend-lighten">
          An architecture designed specifically for high-volume operators. Stop fighting your infrastructure and start building custom flows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[420px]">
        {/* Bento 1: Asymmetric List */}
        <LiquidGlassPanel className="md:col-span-1 p-8 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
              <GlobeHemisphere weight="duotone" className="text-zinc-300 w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Global Connectivity</h3>
            <p className="text-zinc-500 text-sm max-w-[25ch] leading-relaxed">
              Process payments anywhere with dynamic routing algorithms optimizing success rates.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 relative h-[140px] overflow-hidden -mx-2">
            <motion.div 
               animate={{ y: [0, -48, -96, 0] }} 
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
               className="space-y-3"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                  <div className="w-2 h-2 rounded-full bg-[#FF4A00]" />
                  <div className="h-2 w-32 bg-zinc-700/50 rounded" />
                </div>
              ))}
            </motion.div>
          </div>
        </LiquidGlassPanel>

        {/* Bento 2: Wide Command Area */}
        <LiquidGlassPanel className="md:col-span-2 p-8 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Lightning weight="duotone" className="text-[#FF4A00] w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight">Sub-second Latency</h3>
              <p className="text-zinc-500 text-sm max-w-[40ch] leading-relaxed">
                Deployed on Edge globally. Static asset delivery and server-side rendering ensure instantaneous checkout loads.
              </p>
            </div>
          </div>
          {/* Faux Code Terminal */}
          <div className="rounded-xl border border-zinc-800 bg-[#000] p-4 font-mono text-xs md:text-sm overflow-hidden relative">
            <div className="text-zinc-500 mb-2">// Edge deployment specs</div>
            <div className="text-zinc-300">
              <span className="text-[#FF4A00]">const</span> gateway = <span className="text-blue-400">await</span> initClient(&#123;
            </div>
            <div className="text-zinc-300 ml-4">region: <span className="text-green-400">'global'</span>,</div>
            <div className="text-zinc-300 ml-4">latency_target: <span className="text-orange-300">10</span>, <span className="text-zinc-600">// ms</span></div>
            <div className="text-zinc-300">&#125;);</div>
            {/* Blinking cursor */}
            <motion.div 
               animate={{ opacity: [1, 0] }}
               transition={{ duration: 0.8, repeat: Infinity }}
               className="w-2 h-4 bg-zinc-400 inline-block align-middle ml-1"
            />
          </div>
        </LiquidGlassPanel>

        {/* Bento 3: Data Visualization */}
        <LiquidGlassPanel className="md:col-span-2 p-8 flex flex-col justify-between overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
              <ChartLineUp weight="duotone" className="text-zinc-300 w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight">Dimensional Analytics</h3>
            <p className="text-zinc-500 text-sm max-w-[35ch] leading-relaxed">
              Slice through conversion data with multidimensional charts. Understand drop-offs immediately.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-12 left-[40%] translate-y-12">
            {/* Abstract charts */}
            <div className="w-full text-zinc-800/20 translate-x-12 translate-y-8 flex items-end gap-2 h-full px-6">
                {[40, 65, 30, 85, 55, 95, 45, 100].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="w-full bg-gradient-to-t from-zinc-800 to-zinc-700/50 rounded-t-sm" 
                  />
                ))}
            </div>
          </div>
        </LiquidGlassPanel>

        {/* Bento 4: Architecture */}
        <LiquidGlassPanel className="md:col-span-1 p-8 flex flex-col justify-between group">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
              <ShieldCheck weight="duotone" className="text-zinc-300 w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Military Grade</h3>
            <p className="text-zinc-500 text-sm max-w-[25ch] leading-relaxed">
              PCI-DSS Level 1 compliance and 24/7 proactive fraud detection engines.
            </p>
          </div>
          <div className="mt-8 flex justify-center">
            {/* Radar Sweep Effect */}
            <div className="w-32 h-32 rounded-full border border-zinc-800 relative flex items-center justify-center overflow-hidden">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 border-t-2 border-[#FF4A00]/50 rounded-full" 
               />
               <ShieldCheck weight="fill" className="text-zinc-700 w-10 h-10" />
            </div>
          </div>
        </LiquidGlassPanel>
      </div>
    </section>
  );
};

const SectionFinalCTA = () => {
  return (
    <section className="relative py-40 flex items-center justify-center max-w-7xl mx-auto px-4 border-t border-zinc-900">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FF4A00]/[0.02] pointer-events-none" />
      <div className="text-center relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8 shadow-2xl">
          <CreditCard weight="duotone" className="text-zinc-100 w-8 h-8" />
        </div>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6">
          Architect your <br />
          payment flow.
        </h2>
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-body">
          Stop compromising on revenue. Build an advanced checkout integration using our modern APIs and robust infrastructure.
        </p>
        <MagneticButton>
          <Link to="/auth">
            <div className="group relative overflow-hidden rounded-full bg-white text-zinc-950 px-10 py-5 font-semibold text-lg hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2">
              Create Free Account
              <ArrowRight weight="bold" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </MagneticButton>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

const Index = () => {
  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white selection:bg-[#FF4A00]/30 selection:text-white font-body">
      
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 backdrop-blur-md bg-[#050505]/40 p-2 pr-6 rounded-full border border-white/10"
          >
            <div className="w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center font-heading font-black text-sm">
              BP
            </div>
            <span className="font-heading font-semibold text-sm tracking-widest uppercase text-zinc-100">
              Bianchini
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <Link to="/auth" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-wider hidden md:block">
              Log In
            </Link>
            <Link to="/auth">
              <div className="text-sm font-semibold bg-zinc-900 border border-zinc-800 text-white px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors uppercase tracking-wider">
                Get Started
              </div>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ─── SECTIONS ─── */}
      <SectionHero />
      <SectionBento />
      <SectionFinalCTA />

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-zinc-900 py-12 text-center text-zinc-600 bg-[#050505]">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Bianchini Pay Inc.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300">Privacy</a>
            <a href="#" className="hover:text-zinc-300">Terms</a>
            <a href="#" className="hover:text-zinc-300">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  tilt?: boolean;
}

export function GlowCard({ children, className = "", glowColor = "rgba(255,74,0,0.2)", tilt = true }: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({});

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (tilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      setTiltStyle({
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`,
        transition: "transform 0.1s ease-out",
      });
    }
  }

  function handleMouseLeave() {
    setIsHovered(false);
    setTiltStyle({ transform: "perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)", transition: "transform 0.4s ease-out" });
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden group ${className}`}
      style={tilt ? tiltStyle : undefined}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Cursor glow */}
      {isHovered && (
        <div
          className="absolute pointer-events-none transition-opacity duration-200"
          style={{
            left: mousePos.x - 200,
            top: mousePos.y - 200,
            width: 400,
            height: 400,
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`,
            opacity: 1,
          }}
        />
      )}
      {/* Border glow - breathing */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={isHovered ? {
          boxShadow: [
            "inset 0 0 0 1px rgba(255,74,0,0.4), 0 0 40px -10px rgba(255,74,0,0.3)",
            "inset 0 0 0 1px rgba(255,74,0,0.6), 0 0 60px -10px rgba(255,74,0,0.5)",
            "inset 0 0 0 1px rgba(255,74,0,0.4), 0 0 40px -10px rgba(255,74,0,0.3)",
          ],
        } : { boxShadow: "inset 0 0 0 1px rgba(255,74,0,0), 0 0 0 0 rgba(255,74,0,0)" }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Scan line on hover */}
      {isHovered && (
        <motion.div
          className="absolute left-0 right-0 h-[2px] pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,74,0,0.5), transparent)" }}
          initial={{ top: 0 }}
          animate={{ top: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

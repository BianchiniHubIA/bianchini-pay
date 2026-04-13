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
  Wallet,
  WhatsappLogo,
  CheckCircle,
  CurrencyCircleDollar,
  ArrowsSplit,
  QrCode
} from "@phosphor-icons/react";

/* -------------------------------------------------------------------------- */
/*                                 COMPONENTS                                 */
/* -------------------------------------------------------------------------- */

const MagneticButton = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 20, stiffness: 150, mass: 0.1 });
  const springY = useSpring(y, { damping: 20, stiffness: 150, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.15);
    y.set((e.clientY - centerY) * 0.15);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: springX, y: springY }}
      className={`relative inline-flex z-10 ${className}`}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
};

const PremiumPanel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={`relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden group ${className}`}
  >
    {/* Subtle hover gradient tracker */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/30 via-transparent to-transparent" />
    {children}
  </motion.div>
);

/* -------------------------------------------------------------------------- */
/*                             SECTIONS                                       */
/* -------------------------------------------------------------------------- */

const SectionHero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-[100dvh] w-full flex items-center pt-32 pb-16 overflow-hidden px-4 md:px-0 bg-[#050505]">
      
      {/* Background Animated Grids */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
        <motion.div 
          animate={{ y: [0, -100] }} 
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
          className="w-full h-[200%] absolute top-0"
          style={{ backgroundSize: "40px 40px", backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
      </div>

      <div className="max-w-[1400px] mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Text Content */}
          <motion.div
            style={{ y: y1, opacity }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start px-4 md:px-12"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#FF4A00]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Checkout Transparente</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] tracking-tighter leading-[1.05] font-bold text-white mb-6 font-heading">
              Venda mais,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">sem atrito.</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-[42ch] leading-relaxed mb-10 font-body">
              Aumente sua taxa de aprovação com um checkout de alta conversão. PIX imediato, Cartão de Crédito e Split de Pagamentos na melhor plataforma financeira.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <MagneticButton>
                <Link to="/auth" className="w-full">
                  <div className="group relative overflow-hidden rounded-full bg-white text-zinc-950 px-8 py-4 font-semibold hover:bg-zinc-100 transition-colors flex justify-center items-center gap-3">
                    Criar Conta Agora
                    <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center transform group-hover:translate-x-1 group-hover:bg-[#FF4A00] transition-all duration-300">
                      <ArrowRight weight="bold" className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </MagneticButton>
            </div>
          </motion.div>

          {/* Right Holographic 3D Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block perspective-[1500px] h-[550px] w-full"
          >
            {/* Animating floating cards */}
            <motion.div 
               animate={{ y: [-15, 15, -15], rotateY: [-5, 5, -5], rotateX: [5, -5, 5] }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-10 left-10 w-80 rounded-2xl bg-zinc-900/80 border border-white/10 p-6 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-xl z-20"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-[#FF4A00]/20 flex items-center justify-center text-[#FF4A00]">
                      <QrCode weight="bold" className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="text-white font-medium text-sm">Recebimento PIX</div>
                     <div className="text-zinc-500 text-xs">Aprovado instantaneamente</div>
                   </div>
                </div>
                <div className="text-emerald-400 font-bold font-mono">R$ 1.250,00</div>
              </div>
              
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2, repeat: Infinity }} className="h-full bg-emerald-500" />
              </div>
            </motion.div>

            {/* Back animating card */}
            <motion.div 
               animate={{ y: [10, -10, 10], rotate:-3 }}
               transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute top-36 right-0 w-72 rounded-2xl bg-zinc-950 border border-white/5 p-5 shadow-2xl z-10"
            >
              <div className="text-zinc-500 text-xs uppercase tracking-widest mb-4">Taxa de Conversão</div>
              <div className="flex items-end gap-2 text-white font-heading">
                <span className="text-5xl font-bold">98.4</span><span className="text-xl mb-1">%</span>
              </div>
              <motion.div 
                 className="mt-6 flex items-center justify-between border-t border-white/5 pt-4"
                 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}
              >
                 <div className="text-xs text-zinc-400">Cartão de Crédito</div>
                 <div className="text-xs font-bold text-[#FF4A00]">Processando...</div>
              </motion.div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SectionBento = () => {
  return (
    <section className="relative py-32 px-4 md:px-12 max-w-[1400px] mx-auto w-full border-t border-white/5">
      <div className="mb-24 text-left lg:w-2/3">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white mb-6 block font-heading">
          Feito pra quem vende muito.
        </h2>
        <p className="text-zinc-400 text-lg md:text-xl leading-relaxed font-body">
          Suas vendas não param, e seu dinheiro não deveria ficar travado. Descubra ferramentas inteligentes integradas para automatizar o seu negócio digital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[440px]">
        {/* Bento 1: Checkout Transparente (2-cols) */}
        <PremiumPanel className="md:col-span-2 p-10 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-8 z-10 relative">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4">
                <Wallet weight="duotone" className="text-white w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-white tracking-tight font-heading">Checkout Transparente</h3>
              <p className="text-zinc-500 text-base max-w-[40ch] leading-relaxed font-body">
                Mantenha seu cliente no seu site. Desenvolvemos uma interface limpa, sem fricções, desenhada especificamente para evitar carrinhos abandonados.
              </p>
            </div>
          </div>
          
          <div className="relative flex-1 mt-4 overflow-hidden rounded-xl border border-white/5 bg-zinc-950/50 p-6 flex flex-col items-center justify-center">
            <motion.div 
               initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, type: "spring" }}
               viewport={{ once: true }}
               className="w-full max-w-sm mx-auto bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 shadow-2xl backdrop-blur-md"
            >
               <div className="flex items-center gap-2 mb-2">
                 <div className="w-3 h-3 rounded-full bg-zinc-700" />
                 <div className="h-3 w-1/3 bg-zinc-700 rounded-full" />
               </div>
               <div className="space-y-3">
                 <div className="h-12 w-full bg-zinc-900 rounded-lg border border-zinc-800 flex items-center px-4 gap-3 relative overflow-hidden">
                   <CreditCard className="text-zinc-500 w-5 h-5" />
                   <div className="h-3 w-1/2 bg-zinc-800 rounded-full" />
                   <motion.div 
                     animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/5 to-transparent" 
                   />
                 </div>
                 <div className="flex gap-3">
                   <div className="h-12 w-1/2 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center px-4">
                      <div className="h-3 w-1/2 bg-zinc-800 rounded-full" />
                   </div>
                   <div className="h-12 w-1/2 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center px-4">
                      <div className="h-3 w-1/2 bg-zinc-800 rounded-full" />
                   </div>
                 </div>
               </div>
               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 className="h-14 w-full bg-[#FF4A00] rounded-xl mt-6 flex justify-center items-center font-bold text-white text-sm shadow-[0_10px_20px_-10px_rgba(255,74,0,0.5)]"
               >
                 Finalizar Compra
               </motion.div>
            </motion.div>
          </div>
        </PremiumPanel>

        {/* Bento 2: Recuperação Whats (1-col) */}
        <PremiumPanel className="md:col-span-1 p-10 flex flex-col justify-between group">
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-900/50 flex items-center justify-center mb-4">
              <WhatsappLogo weight="fill" className="text-emerald-400 w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight font-heading">Recuperação Ativa</h3>
            <p className="text-zinc-500 text-sm max-w-[25ch] leading-relaxed font-body">
              Carrinho abandonado ou PIX não pago? Nosso sistema dispara mensagens automáticas no WhatsApp do cliente minutos depois.
            </p>
          </div>
          <div className="mt-8 flex flex-col justify-end relative overflow-hidden h-[160px] pb-4">
            <motion.div 
               animate={{ y: [60, 0, 0, -80, -80] }}
               transition={{ duration: 7, repeat: Infinity, times: [0, 0.15, 0.5, 0.65, 1] }}
               className="absolute bottom-4 w-full space-y-4 px-2"
            >
              <div className="bg-zinc-800 text-zinc-300 text-xs p-3 rounded-tr-2xl rounded-bl-2xl rounded-br-2xl w-5/6 shadow-lg border border-zinc-700 font-medium">
                Opa, notamos que seu PIX expirou. Quer gerar uma nova chave agora?
              </div>
              <div className="bg-emerald-600/90 text-white text-xs p-3 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl w-2/3 ml-auto text-right font-medium shadow-lg shadow-emerald-900/20">
                Sim, por favor!
              </div>
            </motion.div>
          </div>
        </PremiumPanel>

        {/* Bento 3: Pix Direto / Recebimento Rápido */}
        <PremiumPanel className="md:col-span-1 p-10 flex flex-col justify-between">
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4">
              <CurrencyCircleDollar weight="duotone" className="text-white w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight font-heading">Dinheiro na Conta D+0</h3>
            <p className="text-zinc-500 text-sm max-w-[25ch] leading-relaxed font-body">
              Antecipação de cartão ou repasse PIX imediato. Não trave o seu fluxo de caixa para reinvestir em campanhas.
            </p>
          </div>
          <div className="mt-8 flex justify-center pb-4 relative">
             <div className="w-32 h-32 rounded-full border border-zinc-800 flex items-center justify-center relative bg-zinc-950/80 transition-colors duration-500">
                <motion.div 
                   animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-[#FF4A00]/20 rounded-full blur-xl"
                />
               <span className="text-3xl font-heading font-bold text-white z-10 tracking-tighter">D+0</span>
             </div>
          </div>
        </PremiumPanel>

        {/* Bento 4: Split de pagamento */}
        <PremiumPanel className="md:col-span-2 p-10 flex flex-col justify-between overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-4">
              <ArrowsSplit weight="duotone" className="text-white w-6 h-6" />
            </div>
            <h3 className="text-3xl font-bold text-white tracking-tight font-heading">Split Automático</h3>
            <p className="text-zinc-500 text-base max-w-[35ch] leading-relaxed font-body">
              Trabalha com afiliados, sócios ou fornecedores de Dropshipping? O dinheiro é dividido automaticamente na hora da transação para contas diferentes.
            </p>
          </div>
          <div className="absolute right-[-20%] md:right-0 bottom-0 top-16 left-[20%] md:left-[45%] flex items-center justify-center p-8">
             <div className="w-full flex justify-between items-center relative">
               
               {/* Centro (Venda) */}
               <motion.div 
                 animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 z-10 flex items-center justify-center shadow-2xl relative"
               >
                  <span className="text-zinc-950 font-bold text-xs uppercase tracking-widest">R$</span>
               </motion.div>
               
               {/* Lines animating out */}
               <motion.div 
                 className="absolute left-10 h-px bg-zinc-800 w-[calc(100%-8rem)] top-1/2 -z-10" 
                 style={{ translateY: "-50%" }}
               />
               
               {/* Particles */}
               {[0, 1].map((i) => (
                 <motion.div 
                   key={i}
                   animate={{ left: ["10%", "80%"], opacity: [0, 1, 0] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 1 }}
                   className="absolute h-1 w-10 bg-[#FF4A00] rounded-full top-[48%] shadow-[0_0_10px_rgba(255,74,0,0.8)]"
                 />
               ))}

               {/* Destinations */}
               <div className="flex flex-col gap-4 z-10">
                  <motion.div whileHover={{ scale: 1.05 }} className="w-40 bg-zinc-900 border border-white/10 rounded-xl p-4 text-xs font-mono text-zinc-400 shadow-xl flex items-center">
                    <span className="text-white font-bold mr-3 text-sm">90%</span> Loja Oficial
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} className="w-40 bg-zinc-900 border border-white/10 rounded-xl p-4 text-xs font-mono text-zinc-400 shadow-xl flex items-center">
                    <span className="text-white font-bold mr-3 text-sm">10%</span> Afiliado VIP
                  </motion.div>
               </div>

             </div>
          </div>
        </PremiumPanel>
      </div>
    </section>
  );
};

const SectionFinalCTA = () => {
  return (
    <section className="relative py-40 flex items-center justify-center max-w-[1400px] mx-auto px-4 border-t border-white/5">
      <div className="text-center relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div 
          initial={{ rotate: -10, y: 20, opacity: 0 }} 
          whileInView={{ rotate: 0, y: 0, opacity: 1 }} 
          transition={{ type: "spring", duration: 1 }}
          viewport={{ once: true }}
          className="w-20 h-20 rounded-3xl bg-[#FF4A00] flex items-center justify-center mb-8 shadow-xl shadow-[#FF4A00]/20"
        >
          <CreditCard weight="fill" className="text-white w-10 h-10" />
        </motion.div>
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-8 leading-[1.05] font-heading">
          Evolua o seu <br />
          negócio online.
        </h2>
        <p className="text-zinc-400 text-xl md:text-2xl mb-12 leading-relaxed font-body max-w-2xl">
          Crie a sua conta na Bianchini Go e simplifique sua gestão de recebimentos com taxas competitivas e aprovação máxima.
        </p>
        <MagneticButton>
          <Link to="/auth">
            <div className="group rounded-full bg-white text-zinc-950 px-12 py-5 font-bold text-lg hover:bg-zinc-200 transition-colors flex items-center gap-3">
              Cadastrar Minha Empresa
              <ArrowRight weight="bold" className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
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
    <div className="min-h-[100dvh] bg-[#050505] text-white selection:bg-[#FF4A00]/30 selection:text-white font-body selection:font-semibold">
      
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-center gap-3 backdrop-blur-md bg-zinc-900/50 p-2 pr-6 rounded-full border border-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center font-heading font-black text-sm">
              BP
            </div>
            <span className="font-heading font-semibold text-sm tracking-widest uppercase text-zinc-100">
              Bianchini Go
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-6"
          >
            <Link to="/auth" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors uppercase tracking-widest hidden md:block">
              Entrar
            </Link>
            <Link to="/auth">
              <div className="text-sm font-semibold bg-white text-zinc-950 px-6 py-2.5 rounded-full hover:bg-zinc-100 transition-colors uppercase tracking-widest">
                Começar
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
      <footer className="border-t border-white/5 py-12 text-center text-zinc-600 bg-[#050505]">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Bianchini Go Inc.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Termos</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Central de Ajuda</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;


import { Shield, Play, Star, Zap, QrCode, Clock, CheckCircle2 } from "lucide-react";
import { LeadCaptureForm, LeadFormData } from "./LeadCaptureForm";

interface CheckoutPreviewProps {
  template: string;
  headline: string;
  subheadline: string;
  description: string;
  ctaText: string;
  primaryColor: string;
  bgColor: string;
  accentColor: string;
  imageUrl: string;
  logoUrl: string;
  showGuarantee: boolean;
  guaranteeText: string;
  offerName: string;
  priceCents: number;
  billingType: string;
  onLeadSubmit?: (data: LeadFormData) => void;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function getContrastColor(hex: string): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
  } catch {
    return "#1a1a1a";
  }
}

export function CheckoutPreview({
  template,
  headline,
  subheadline,
  description,
  ctaText,
  primaryColor,
  bgColor,
  accentColor,
  imageUrl,
  logoUrl,
  showGuarantee,
  guaranteeText,
  offerName,
  priceCents,
  billingType,
  onLeadSubmit,
}: CheckoutPreviewProps) {
  const textColor = getContrastColor(bgColor);
  const mutedColor = textColor === "#ffffff" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)";
  const btnTextColor = getContrastColor(primaryColor);
  const price = formatPrice(priceCents);
  const isRecurring = billingType === "recurring";
  const accent = accentColor || primaryColor;

  const formProps = {
    primaryColor,
    btnTextColor,
    textColor,
    mutedColor,
    ctaText,
    billingType,
    onSubmit: onLeadSubmit,
  };

  // ─── HOTMART ───
  if (template === "hotmart") {
    return (
      <div style={{ backgroundColor: bgColor, color: textColor }} className="min-h-[500px]">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b" style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(0,0,0,0.08)" }}>
          {logoUrl ? <img src={logoUrl} alt="Logo" className="h-5 object-contain" /> : <div className="h-5 w-20 rounded bg-gray-200" />}
          <span className="text-xs font-medium text-gray-500">{offerName}</span>
        </div>
        <div className="text-center px-8 py-8" style={{ background: `linear-gradient(180deg, ${bgColor} 0%, ${bgColor}ee 100%)` }}>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-4" style={{ backgroundColor: accent + "20", color: accent }}>🔥 OFERTA ESPECIAL</span>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{headline}</h1>
          {subheadline && <p className="text-sm mb-4" style={{ color: mutedColor }}>{subheadline}</p>}
          {imageUrl && <div className="rounded-xl overflow-hidden max-w-md mx-auto mb-4"><img src={imageUrl} alt="" className="w-full h-40 object-cover" /></div>}
          <div className="text-4xl font-bold mb-1" style={{ color: primaryColor }}>{price}</div>
          {isRecurring && <p className="text-xs mb-4" style={{ color: mutedColor }}>por mês</p>}
        </div>
        {/* Lead Form */}
        <div className="px-6 pb-4">
          <div className="max-w-md mx-auto rounded-2xl p-5" style={{ backgroundColor: textColor === "#ffffff" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", border: `1px solid ${textColor === "#ffffff" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}` }}>
            <LeadCaptureForm {...formProps} />
          </div>
        </div>
        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 px-6 py-4">
          {["Acesso Imediato", "Suporte 24h", "Comunidade VIP", "Certificado"].map((b) => (
            <div key={b} className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: primaryColor + "08" }}>
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: accent }} />
              <span className="text-xs font-medium">{b}</span>
            </div>
          ))}
        </div>
        <div className="px-6 pb-4">
          <div className="rounded-xl p-4" style={{ backgroundColor: primaryColor + "06", borderLeft: `3px solid ${accent}` }}>
            <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-current" style={{ color: "#FBBF24" }} />)}</div>
            <p className="text-xs italic" style={{ color: mutedColor }}>"Resultado incrível em apenas 30 dias!"</p>
            <p className="text-[10px] font-medium mt-1">— Maria S.</p>
          </div>
        </div>
        {showGuarantee && (
          <div className="mx-6 mb-4 rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: accent + "10", border: `1px solid ${accent}` }}>
            <Shield className="h-6 w-6 shrink-0" style={{ color: accent }} />
            <div>
              <p className="text-xs font-bold">{guaranteeText}</p>
              <p className="text-[10px]" style={{ color: mutedColor }}>100% do seu dinheiro de volta</p>
            </div>
          </div>
        )}
        <div className="px-6 pb-6 text-center">
          <p className="text-[10px]" style={{ color: mutedColor }}>Pagamento seguro • SSL • Mercado Pago</p>
        </div>
      </div>
    );
  }

  // ─── STRIPE ───
  if (template === "stripe") {
    return (
      <div style={{ backgroundColor: "#FFFFFF", color: "#1a1a1a" }} className="min-h-[500px]">
        <div className="px-8 py-4 border-b" style={{ borderColor: "#f0f0f0" }}>
          {logoUrl ? <img src={logoUrl} alt="Logo" className="h-5 object-contain" /> : <div className="h-5 w-24 rounded bg-gray-100" />}
        </div>
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-8 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-wider font-medium" style={{ color: "#6B7280" }}>{offerName}</p>
              <h1 className="text-2xl font-semibold mt-1" style={{ fontFamily: "Inter, sans-serif" }}>{headline}</h1>
              {subheadline && <p className="text-sm mt-2" style={{ color: "#6B7280" }}>{subheadline}</p>}
            </div>
            {description && <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{description}</p>}
            <div className="space-y-2">
              {["Acesso completo", "Suporte prioritário", "Atualizações gratuitas", "Cancele a qualquer momento"].map(f => (
                <div key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: accentColor || "#0ACF83" }} />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 flex flex-col justify-center" style={{ backgroundColor: "#FAFAFA" }}>
            <div className="rounded-2xl p-6 space-y-4 bg-white" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <p className="text-xs font-medium" style={{ color: "#6B7280" }}>Resumo da compra</p>
              <div className="flex items-baseline justify-between">
                <span className="text-sm">{offerName}</span>
                <span className="text-2xl font-semibold" style={{ color: primaryColor }}>{price}</span>
              </div>
              {isRecurring && <p className="text-xs" style={{ color: "#9CA3AF" }}>cobrado mensalmente</p>}
              <div className="h-px bg-gray-100" />
              <LeadCaptureForm
                primaryColor={primaryColor}
                btnTextColor={btnTextColor}
                textColor="#1a1a1a"
                mutedColor="#6B7280"
                ctaText={ctaText}
                billingType={billingType}
                onSubmit={onLeadSubmit}
              />
              <div className="flex items-center justify-center gap-3 pt-1">
                {["SSL", "Criptografia", "Seguro"].map(s => (
                  <span key={s} className="text-[9px] font-medium" style={{ color: "#9CA3AF" }}>{s}</span>
                ))}
              </div>
            </div>
            {showGuarantee && (
              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs" style={{ color: "#9CA3AF" }}>
                <Shield className="h-3 w-3" /> {guaranteeText}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── ASAAS ───
  if (template === "asaas") {
    return (
      <div style={{ backgroundColor: bgColor, color: textColor }} className="min-h-[500px]">
        <div className="px-6 py-3 flex items-center gap-3" style={{ backgroundColor: "#1B2A4A" }}>
          {logoUrl ? <img src={logoUrl} alt="Logo" className="h-5 object-contain" /> : <div className="h-4 w-16 rounded bg-white/20" />}
          <span className="text-xs font-medium text-white/80">{offerName}</span>
        </div>
        <div className="px-6 py-6 text-center">
          <h1 className="text-xl font-bold mb-1">{headline}</h1>
          {subheadline && <p className="text-xs mb-4" style={{ color: mutedColor }}>{subheadline}</p>}
          <div className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>{price}</div>
          <div className="inline-flex gap-1 items-center rounded-full px-3 py-1 text-[10px] font-bold" style={{ backgroundColor: accent + "15", color: accent }}>
            <Zap className="h-3 w-3" /> Economize 10% no Pix
          </div>
        </div>
        {/* Lead Form */}
        <div className="mx-6 mb-4 rounded-xl p-5" style={{ backgroundColor: textColor === "#ffffff" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)", border: `1px solid ${textColor === "#ffffff" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}` }}>
          <LeadCaptureForm {...formProps} />
        </div>
        {/* Benefits */}
        <div className="flex justify-center gap-4 px-6 pb-4">
          {[{ icon: Zap, label: "Imediato" }, { icon: Shield, label: "Seguro" }, { icon: Clock, label: "24h" }].map(b => (
            <div key={b.label} className="flex flex-col items-center gap-1">
              <b.icon className="h-4 w-4" style={{ color: accent }} />
              <span className="text-[10px] font-medium">{b.label}</span>
            </div>
          ))}
        </div>
        {showGuarantee && (
          <div className="mx-6 mb-4 text-center text-xs" style={{ color: mutedColor }}>
            <Shield className="h-3 w-3 inline mr-1" />{guaranteeText}
          </div>
        )}
      </div>
    );
  }

  // ─── CAKTO ───
  if (template === "cakto") {
    const dark = bgColor === "#0F0F0F" || bgColor === "#000000";
    const bg = dark ? "#0F0F0F" : bgColor;
    const txt = dark ? "#FFFFFF" : textColor;
    const muted = dark ? "rgba(255,255,255,0.5)" : mutedColor;
    return (
      <div style={{ backgroundColor: bg, color: txt }} className="min-h-[500px]">
        <div className="px-8 py-10 text-center" style={{ background: `linear-gradient(135deg, ${bg} 0%, #1A1A2E 100%)` }}>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold mb-3" style={{ backgroundColor: accent + "25", color: accent }}>🏆 MAIS VENDIDO</span>
          <h1 className="text-3xl font-black mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{headline}</h1>
          {subheadline && <p className="text-xs mb-4" style={{ color: muted }}>{subheadline}</p>}
          {imageUrl && <div className="rounded-xl overflow-hidden max-w-sm mx-auto mb-4"><img src={imageUrl} alt="" className="w-full h-36 object-cover" /></div>}
        </div>
        {/* Price box */}
        <div className="mx-6 -mt-2 mb-4 rounded-2xl p-5 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`, color: btnTextColor }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ opacity: 0.8 }}>OFERTA ESPECIAL</p>
          <div className="text-sm line-through mb-0.5" style={{ opacity: 0.6 }}>De R$ 997,00</div>
          <div className="text-4xl font-black">{price}</div>
          {isRecurring && <p className="text-xs mt-1" style={{ opacity: 0.7 }}>por mês</p>}
        </div>
        {/* Lead Form */}
        <div className="mx-6 mb-4 rounded-2xl p-5" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <LeadCaptureForm
            primaryColor={accent}
            btnTextColor={getContrastColor(accent)}
            textColor={txt}
            mutedColor={muted}
            ctaText={ctaText}
            onSubmit={onLeadSubmit}
          />
        </div>
        {/* Benefits */}
        <div className="px-6 pb-4 space-y-2">
          {["Resultado Rápido em 7 dias", "Método Comprovado +5.000", "Acesso Vitalício"].map(b => (
            <div key={b} className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: accent }} />
              <span className="text-xs font-medium">{b}</span>
            </div>
          ))}
        </div>
        <div className="mx-6 mb-4 rounded-lg py-2 text-center text-xs font-bold" style={{ background: `linear-gradient(90deg, ${accent} 0%, ${primaryColor} 100%)`, color: "#fff" }}>
          🔥 147 unidades vendidas hoje • Preço sobe em breve
        </div>
        {showGuarantee && (
          <div className="mx-6 mb-4 rounded-xl p-4 text-center" style={{ background: "linear-gradient(135deg, #065F46 0%, #047857 100%)", color: "#fff" }}>
            <Shield className="h-5 w-5 mx-auto mb-1" />
            <p className="text-xs font-bold">{guaranteeText}</p>
            <p className="text-[10px] mt-0.5 opacity-80">100% RISCO ZERO</p>
          </div>
        )}
        <div className="px-6 pb-4 text-center"><p className="text-[9px]" style={{ color: muted }}>Pagamento seguro • Dados protegidos</p></div>
      </div>
    );
  }

  // ─── BLANK ───
  if (template === "blank") {
    return (
      <div style={{ backgroundColor: bgColor, color: textColor }} className="min-h-[500px] flex flex-col">
        <div className="px-6 py-3 border-b" style={{ borderColor: textColor === "#ffffff" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
          {logoUrl ? <img src={logoUrl} alt="Logo" className="h-5 object-contain" /> : <div className="h-4 w-16 rounded bg-gray-200" />}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
          <h1 className="text-2xl font-bold mb-2">{headline}</h1>
          {subheadline && <p className="text-sm mb-4" style={{ color: mutedColor }}>{subheadline}</p>}
          {description && <p className="text-sm mb-6" style={{ color: mutedColor }}>{description}</p>}
          <div className="text-3xl font-bold mb-6" style={{ color: primaryColor }}>{price}</div>
          <div className="w-full max-w-md">
            <LeadCaptureForm {...formProps} />
          </div>
        </div>
      </div>
    );
  }

  // ─── MINIMAL ───
  if (template === "minimal") {
    return (
      <div className="p-8 min-h-[500px] flex flex-col items-center justify-center text-center" style={{ backgroundColor: bgColor, color: textColor }}>
        {logoUrl && <img src={logoUrl} alt="Logo" className="h-8 mb-6 object-contain" />}
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{headline}</h1>
        {subheadline && <p className="text-sm mb-6" style={{ color: mutedColor }}>{subheadline}</p>}
        <div className="text-3xl font-bold mb-1" style={{ color: primaryColor }}>{price}</div>
        {isRecurring && <p className="text-xs mb-6" style={{ color: mutedColor }}>por mês</p>}
        <div className="w-full max-w-md text-left mt-4">
          <LeadCaptureForm {...formProps} />
        </div>
        {showGuarantee && (
          <div className="flex items-center gap-1.5 mt-4 text-xs" style={{ color: mutedColor }}><Shield className="h-3.5 w-3.5" />{guaranteeText}</div>
        )}
      </div>
    );
  }

  // ─── MODERN ───
  if (template === "modern") {
    return (
      <div className="min-h-[500px]" style={{ backgroundColor: bgColor, color: textColor }}>
        {logoUrl && <div className="p-4"><img src={logoUrl} alt="Logo" className="h-6 object-contain" /></div>}
        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{headline}</h1>
            {subheadline && <p className="text-sm mt-2" style={{ color: mutedColor }}>{subheadline}</p>}
          </div>
          {imageUrl && <div className="rounded-xl overflow-hidden"><img src={imageUrl} alt="Product" className="w-full h-48 object-cover" /></div>}
          {description && <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>{description}</p>}
          <div className="rounded-xl p-6 space-y-4" style={{ backgroundColor: primaryColor + "10", borderLeft: `4px solid ${primaryColor}` }}>
            <div>
              <p className="text-xs uppercase tracking-wider font-medium" style={{ color: mutedColor }}>{offerName}</p>
              <div className="text-3xl font-bold mt-1" style={{ color: primaryColor }}>
                {price}{isRecurring && <span className="text-sm font-normal" style={{ color: mutedColor }}>/mês</span>}
              </div>
            </div>
            <LeadCaptureForm {...formProps} />
          </div>
          {showGuarantee && <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: mutedColor }}><Shield className="h-3.5 w-3.5" />{guaranteeText}</div>}
        </div>
      </div>
    );
  }

  // ─── CLASSIC (default) ───
  return (
    <div className="min-h-[500px]" style={{ backgroundColor: bgColor, color: textColor }}>
      {logoUrl && (
        <div className="p-4 border-b" style={{ borderColor: textColor === "#ffffff" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
          <img src={logoUrl} alt="Logo" className="h-6 object-contain" />
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-0">
        <div className="p-8 space-y-4">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{headline}</h1>
          {subheadline && <p className="text-sm" style={{ color: mutedColor }}>{subheadline}</p>}
          {description && <p className="text-sm leading-relaxed" style={{ color: mutedColor }}>{description}</p>}
          {imageUrl && <div className="rounded-lg overflow-hidden"><img src={imageUrl} alt="Product" className="w-full h-40 object-cover" /></div>}
        </div>
        <div className="p-8 flex flex-col justify-center space-y-4" style={{ backgroundColor: primaryColor + "08" }}>
          <p className="text-xs uppercase tracking-wider font-medium" style={{ color: mutedColor }}>{offerName}</p>
          <div className="text-4xl font-bold" style={{ color: primaryColor }}>{price}</div>
          {isRecurring && <p className="text-xs" style={{ color: mutedColor }}>cobrado mensalmente</p>}
          <LeadCaptureForm {...formProps} />
          {showGuarantee && <div className="flex items-center gap-1.5 text-xs" style={{ color: mutedColor }}><Shield className="h-3.5 w-3.5" />{guaranteeText}</div>}
          <p className="text-[10px] text-center" style={{ color: mutedColor }}>Pagamento seguro • Dados protegidos</p>
        </div>
      </div>
    </div>
  );
}

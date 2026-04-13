import { Shield, CheckCircle2, Lock, Star } from "lucide-react";
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
    return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? "#1a1a1a" : "#ffffff";
  } catch {
    return "#1a1a1a";
  }
}

function lightenColor(hex: string, percent: number): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const lr = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
    const lg = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
    const lb = Math.min(255, Math.floor(b + (255 - b) * percent / 100));
    return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
  } catch {
    return hex;
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
  const mutedColor = textColor === "#ffffff" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)";
  const btnTextColor = getContrastColor(primaryColor);
  const price = formatPrice(priceCents);
  const isRecurring = billingType === "recurring";
  const isDark = textColor === "#ffffff";
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.02)";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const subtleBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  const benefits = description
    ? description.split("\n").filter((l) => l.trim())
    : ["Acesso completo", "Suporte prioritário", "Atualizações gratuitas", "Cancele a qualquer momento"];

  return (
    <div
      style={{ backgroundColor: bgColor, color: textColor }}
      className="min-h-[600px] flex items-start justify-center p-6"
    >
      <div className="w-full max-w-[900px]">
        {/* Logo */}
        {logoUrl && (
          <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          {/* Left: Product info */}
          <div className="space-y-5">
            {/* Header */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: primaryColor }}>
                {offerName}
              </p>
              <h1 className="text-2xl font-bold leading-tight" style={{ color: textColor }}>
                {headline}
              </h1>
              {subheadline && (
                <p className="text-sm mt-2 leading-relaxed" style={{ color: mutedColor }}>
                  {subheadline}
                </p>
              )}
            </div>

            {/* Image */}
            {imageUrl && (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: cardBorder }}>
                <img src={imageUrl} alt="Product" className="w-full h-48 object-cover" />
              </div>
            )}

            {/* Benefits */}
            <div className="space-y-2.5">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div
                    className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: textColor }}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Guarantee */}
            {showGuarantee && (
              <div
                className="flex items-center gap-3 p-3.5 rounded-xl"
                style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <Shield className="h-5 w-5 shrink-0" style={{ color: primaryColor }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: textColor }}>{guaranteeText}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: mutedColor }}>Seu dinheiro de volta, sem perguntas.</p>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="flex items-center gap-4 pt-2">
              {[
                { icon: Lock, text: "Pagamento seguro" },
                { icon: Shield, text: "Dados protegidos" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3" style={{ color: mutedColor }} />
                  <span className="text-[10px] font-medium" style={{ color: mutedColor }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Payment card */}
          <div>
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: isDark
                  ? "0 4px 24px rgba(0,0,0,0.3)"
                  : "0 4px 24px rgba(0,0,0,0.06)",
              }}
            >
              {/* Order summary */}
              <div className="pb-3" style={{ borderBottom: `1px solid ${subtleBorder}` }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: mutedColor }}>
                  Resumo da compra
                </p>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium">{offerName}</span>
                  <span className="text-2xl font-bold" style={{ color: primaryColor }}>{price}</span>
                </div>
                {isRecurring && (
                  <p className="text-xs mt-1" style={{ color: mutedColor }}>cobrado mensalmente</p>
                )}
              </div>

              {/* Form */}
              <LeadCaptureForm
                primaryColor={primaryColor}
                btnTextColor={btnTextColor}
                textColor={textColor}
                mutedColor={mutedColor}
                ctaText={ctaText}
                billingType={billingType}
                onSubmit={onLeadSubmit}
              />

              {/* Security footer */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                <Lock className="h-3 w-3" style={{ color: mutedColor }} />
                <span className="text-[9px]" style={{ color: mutedColor }}>
                  Transação segura • Dados criptografados
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

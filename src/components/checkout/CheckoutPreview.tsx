import { useState } from "react";
import { Shield, Lock, Tag, X, Loader2 } from "lucide-react";
import { LeadCaptureForm, type LeadFormData } from "./LeadCaptureForm";

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
  blocksLayout?: any;
  onLeadSubmit?: (data: LeadFormData) => void;
  onCouponValidate?: (code: string) => Promise<{ valid: boolean; discount_percent: number } | null>;
  appliedCoupon?: { code: string; discount_percent: number } | null;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

function lighten(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  if (c.length < 6) return hex;
  const r = Math.min(255, parseInt(c.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(c.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(c.substring(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function CheckoutPreview({
  template, headline, subheadline, description, ctaText,
  primaryColor, bgColor, accentColor, imageUrl, logoUrl,
  showGuarantee, guaranteeText, offerName, priceCents, billingType,
  onLeadSubmit, onCouponValidate, appliedCoupon: externalCoupon,
}: CheckoutPreviewProps) {
  const price = formatPrice(priceCents);
  const isRecurring = billingType === "recurring";

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [internalCoupon, setInternalCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  const appliedCoupon = externalCoupon ?? internalCoupon;
  const discountCents = appliedCoupon ? Math.round(priceCents * appliedCoupon.discount_percent / 100) : 0;
  const totalCents = priceCents - discountCents;

  const bgIsLight = isLightColor(bgColor || "#FFFFFF");
  const leftBg = bgIsLight ? "#1a1a1a" : bgColor;
  const leftText = bgIsLight ? "#ededed" : (isLightColor(bgColor) ? "#1a1a1a" : "#ededed");
  const rightBg = bgIsLight ? "#f0f0f2" : lighten(bgColor || "#1a1a1a", 15);
  const rightText = isLightColor(rightBg) ? "#1a1a1a" : "#ededed";
  const rightMuted = isLightColor(rightBg) ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";
  const accent = accentColor || primaryColor;
  const leftMuted = `${leftText}40`;
  const leftSubtle = `${leftText}60`;
  const leftDivider = `${leftText}12`;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !onCouponValidate) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const result = await onCouponValidate(couponInput.trim().toUpperCase());
      if (result?.valid) {
        setInternalCoupon({ code: couponInput.trim().toUpperCase(), discount_percent: result.discount_percent });
        setCouponInput("");
      } else {
        setCouponError("Cupom inválido ou expirado");
      }
    } catch {
      setCouponError("Erro ao validar cupom");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => { setInternalCoupon(null); setCouponError(""); };

  return (
    <div className="min-h-[560px] flex flex-col" style={{ fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}>
      <div className="flex flex-1">
        {/* LEFT - Summary */}
        <div className="w-1/2 p-8 flex flex-col justify-between" style={{ backgroundColor: leftBg, color: leftText }}>
          <div>
            <div className="mb-6">
              <span className="text-base font-bold tracking-tight">
                Bianchini <span style={{ color: primaryColor }}>Pay</span>
              </span>
            </div>

            <p className="text-xs mb-0.5" style={{ color: leftSubtle }}>
              {isRecurring ? "Assinar" : "Comprar"} {offerName}
            </p>
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="text-3xl font-bold tracking-tight">{formatPrice(totalCents)}</span>
              {isRecurring && <span className="text-xs" style={{ color: leftMuted }}>por<br />mês</span>}
            </div>
            {appliedCoupon && <p className="text-[11px] mb-0.5" style={{ color: accent }}>{appliedCoupon.discount_percent}% de desconto</p>}
            {isRecurring && <p className="text-[11px] mb-4" style={{ color: leftMuted }}>cobrado mensalmente</p>}

            <div className="border-t my-4" style={{ borderColor: leftDivider }} />

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{offerName}</p>
                  {isRecurring && <p className="text-[11px]" style={{ color: leftMuted }}>Cobrado mensalmente</p>}
                </div>
                <p className="text-sm font-medium">{price}</p>
              </div>
              <div className="border-t my-2" style={{ borderColor: leftDivider }} />
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: leftSubtle }}>Subtotal</p>
                <p className="text-sm font-medium">{price}</p>
              </div>

              {/* Coupon */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: `${leftText}08`, border: `1px solid ${leftDivider}` }}>
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3" style={{ color: accent }} />
                    <code className="text-[11px] font-bold" style={{ color: accent }}>{appliedCoupon.code}</code>
                    <span className="text-[11px]" style={{ color: leftMuted }}>{appliedCoupon.discount_percent}% off</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: "#ef4444" }}>-{formatPrice(discountCents)}</span>
                    <button onClick={removeCoupon} className="p-0.5 rounded hover:opacity-70"><X className="h-3 w-3" style={{ color: leftMuted }} /></button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${leftDivider}` }}>
                    <div className="flex items-center gap-2 flex-1 px-3 py-2" style={{ backgroundColor: `${leftText}06` }}>
                      <Tag className="h-3 w-3" style={{ color: leftMuted }} />
                      <input type="text" placeholder="Código de cupom" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()} className="bg-transparent text-xs placeholder:opacity-30 outline-none flex-1 font-mono" style={{ color: leftText }} />
                    </div>
                    <button onClick={handleApplyCoupon} disabled={!couponInput.trim() || couponLoading || !onCouponValidate} className="px-3 py-2 text-xs font-semibold disabled:opacity-30" style={{ color: accent }}>
                      {couponLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aplicar"}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] mt-1" style={{ color: "#ef4444" }}>{couponError}</p>}
                </div>
              )}

              <div className="border-t my-2" style={{ borderColor: leftDivider }} />
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Total devido hoje</p>
                <p className="text-sm font-bold" style={{ color: accent }}>{formatPrice(totalCents)}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-4 text-[10px]" style={{ color: leftMuted }}>
              <div className="flex items-center gap-1"><Lock className="h-3 w-3" /> Pagamento seguro</div>
              <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> Dados protegidos</div>
            </div>
            <div className="border-t pt-3" style={{ borderColor: leftDivider }}>
              <p className="text-[10px] font-medium" style={{ color: leftMuted }}>
                <span style={{ color: leftSubtle }}>Bianchini <span style={{ color: primaryColor, opacity: 0.6 }}>Pay</span></span>
                {" "}© 2026 · Todos os direitos reservados
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: `${leftText}20` }}>Plataforma segura · Termos de uso · Privacidade</p>
            </div>
          </div>
        </div>

        {/* RIGHT - Form */}
        <div className="w-1/2 p-8 flex flex-col" style={{ backgroundColor: rightBg }}>
          <div className="max-w-sm mx-auto w-full flex-1">
            <LeadCaptureForm
              primaryColor={primaryColor}
              btnTextColor="#ffffff"
              textColor={rightText}
              mutedColor={rightMuted}
              ctaText={ctaText}
              billingType={billingType}
              onSubmit={onLeadSubmit}
            />

            <div className="mt-4 flex items-center justify-center gap-1.5">
              <Lock className="h-3 w-3" style={{ color: rightMuted }} />
              <span className="text-[10px]" style={{ color: rightMuted }}>Transação segura · Dados criptografados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

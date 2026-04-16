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

export function CheckoutPreview({
  headline, ctaText, primaryColor,
  offerName, priceCents, billingType,
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

  // Fixed brand palette
  const leftBg = "#1a1a1a";
  const leftText = "#ededed";
  const rightBg = "#f5f5f7";
  const rightText = "#1a1a1a";
  const rightMuted = "rgba(0,0,0,0.5)";
  const accent = primaryColor;
  const leftMuted = `${leftText}55`;
  const leftSubtle = `${leftText}80`;
  const leftDivider = `${leftText}14`;

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
    <div
      className="w-full lg:min-h-screen lg:h-full flex flex-col lg:flex-row"
      style={{ fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}
    >
      {/* LEFT - Summary */}
      <div
        className="w-full lg:w-1/2 px-5 py-6 sm:px-8 sm:py-8 lg:p-10 xl:p-14 flex flex-col justify-between lg:min-h-screen"
        style={{ backgroundColor: leftBg, color: leftText }}
      >
        <div>
          {/* Logo */}
          <div className="mb-6 lg:mb-10">
            <span className="text-base sm:text-lg font-bold tracking-tight">
              Bianchini <span style={{ color: primaryColor }}>Go</span>
            </span>
          </div>

          {/* Title + price */}
          <p className="text-xs sm:text-sm mb-1" style={{ color: leftSubtle }}>
            {isRecurring ? "Assinar" : "Comprar"} {offerName}
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{formatPrice(totalCents)}</span>
            {isRecurring && <span className="text-xs" style={{ color: leftMuted }}>/ mês</span>}
          </div>
          {appliedCoupon && (
            <p className="text-xs mb-1 font-medium" style={{ color: accent }}>
              {appliedCoupon.discount_percent}% de desconto aplicado
            </p>
          )}
          {isRecurring && <p className="text-xs mb-4" style={{ color: leftMuted }}>cobrado mensalmente</p>}

          <div className="border-t my-5 lg:my-6" style={{ borderColor: leftDivider }} />

          {/* Line items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{offerName}</p>
                {isRecurring && <p className="text-[11px] mt-0.5" style={{ color: leftMuted }}>Cobrado mensalmente</p>}
              </div>
              <p className="text-sm font-medium whitespace-nowrap">{price}</p>
            </div>
            <div className="border-t" style={{ borderColor: leftDivider }} />
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: leftSubtle }}>Subtotal</p>
              <p className="text-sm font-medium">{price}</p>
            </div>

            {/* Coupon */}
            {appliedCoupon ? (
              <div
                className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-lg"
                style={{ backgroundColor: `${leftText}08`, border: `1px solid ${leftDivider}` }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Tag className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accent }} />
                  <code className="text-xs font-bold truncate" style={{ color: accent }}>{appliedCoupon.code}</code>
                  <span className="text-[11px] whitespace-nowrap" style={{ color: leftMuted }}>
                    {appliedCoupon.discount_percent}% off
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-medium" style={{ color: "#ef4444" }}>-{formatPrice(discountCents)}</span>
                  <button onClick={removeCoupon} className="p-1 rounded hover:opacity-70" aria-label="Remover cupom">
                    <X className="h-3 w-3" style={{ color: leftMuted }} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="flex items-center gap-2 rounded-lg overflow-hidden"
                  style={{ border: `1px solid ${leftDivider}` }}
                >
                  <div className="flex items-center gap-2 flex-1 px-3 py-2.5" style={{ backgroundColor: `${leftText}06` }}>
                    <Tag className="h-3.5 w-3.5 flex-shrink-0" style={{ color: leftMuted }} />
                    <input
                      type="text"
                      placeholder="Código de cupom"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      className="bg-transparent text-xs placeholder:opacity-30 outline-none flex-1 font-mono min-w-0"
                      style={{ color: leftText }}
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim() || couponLoading || !onCouponValidate}
                    className="px-4 py-2.5 text-xs font-semibold disabled:opacity-30 hover:opacity-80 transition-opacity"
                    style={{ color: accent }}
                  >
                    {couponLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Aplicar"}
                  </button>
                </div>
                {couponError && <p className="text-[11px] mt-1.5" style={{ color: "#ef4444" }}>{couponError}</p>}
              </div>
            )}

            <div className="border-t" style={{ borderColor: leftDivider }} />
            <div className="flex items-center justify-between pt-1">
              <p className="text-base font-semibold">Total devido hoje</p>
              <p className="text-base font-bold" style={{ color: accent }}>{formatPrice(totalCents)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 lg:mt-12 space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]" style={{ color: leftMuted }}>
            <div className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Pagamento seguro</div>
            <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Dados protegidos</div>
          </div>
          <div className="border-t pt-3" style={{ borderColor: leftDivider }}>
            <p className="text-[11px] font-medium" style={{ color: leftMuted }}>
              <span style={{ color: leftSubtle }}>Bianchini <span style={{ color: primaryColor, opacity: 0.7 }}>Go</span></span>
              {" "}© 2026 · Todos os direitos reservados
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: `${leftText}30` }}>
              Plataforma segura · Termos de uso · Privacidade
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT - Form */}
      <div
        className="w-full lg:w-1/2 px-5 py-8 sm:px-8 sm:py-10 lg:p-10 xl:p-14 flex flex-col lg:min-h-screen"
        style={{ backgroundColor: rightBg }}
      >
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
          {headline && (
            <h2 className="text-lg sm:text-xl font-bold mb-5 hidden lg:block" style={{ color: rightText }}>
              {headline}
            </h2>
          )}
          <LeadCaptureForm
            primaryColor={primaryColor}
            btnTextColor="#ffffff"
            textColor={rightText}
            mutedColor={rightMuted}
            ctaText={ctaText}
            billingType={billingType}
            onSubmit={onLeadSubmit}
          />

          <div className="mt-5 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3" style={{ color: rightMuted }} />
            <span className="text-[10px]" style={{ color: rightMuted }}>
              Transação segura · Dados criptografados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

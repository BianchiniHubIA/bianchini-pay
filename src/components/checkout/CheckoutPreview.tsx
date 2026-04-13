import { useState } from "react";
import { Shield, Lock, Tag, X, Loader2 } from "lucide-react";
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
  onCouponValidate?: (code: string) => Promise<{ valid: boolean; discount_percent: number } | null>;
  appliedCoupon?: { code: string; discount_percent: number } | null;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
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
  onCouponValidate,
  appliedCoupon: externalCoupon,
}: CheckoutPreviewProps) {
  const price = formatPrice(priceCents);
  const isRecurring = billingType === "recurring";

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [internalCoupon, setInternalCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  const appliedCoupon = externalCoupon ?? internalCoupon;

  const discountCents = appliedCoupon
    ? Math.round(priceCents * appliedCoupon.discount_percent / 100)
    : 0;
  const totalCents = priceCents - discountCents;

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

  const removeCoupon = () => {
    setInternalCoupon(null);
    setCouponError("");
  };

  return (
    <div className="min-h-[600px] flex" style={{ fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}>
      {/* LEFT — Dark side */}
      <div
        className="w-1/2 p-10 flex flex-col justify-between"
        style={{ backgroundColor: "#1a1a1a", color: "#ededed" }}
      >
        <div>
          {/* Bianchini Pay brand */}
          <div className="mb-8">
            <span className="text-lg font-bold tracking-tight" style={{ color: "#ededed" }}>
              Bianchini{" "}
              <span style={{ color: primaryColor }}>Pay</span>
            </span>
          </div>

          {/* Product name + price */}
          <p className="text-sm mb-1" style={{ color: "rgba(237,237,237,0.55)" }}>
            {isRecurring ? "Assinar" : "Comprar"} {offerName}
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold tracking-tight">{formatPrice(totalCents)}</span>
            {isRecurring && (
              <span className="text-sm" style={{ color: "rgba(237,237,237,0.4)" }}>
                por<br />mês
              </span>
            )}
          </div>
          {appliedCoupon && (
            <p className="text-xs mb-1" style={{ color: primaryColor }}>
              {appliedCoupon.discount_percent}% de desconto aplicado
            </p>
          )}
          {isRecurring && (
            <p className="text-xs mb-6" style={{ color: "rgba(237,237,237,0.35)" }}>
              cobrado mensalmente
            </p>
          )}

          {/* Divider */}
          <div className="border-t my-6" style={{ borderColor: "rgba(237,237,237,0.08)" }} />

          {/* Order summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{offerName}</p>
                {isRecurring && (
                  <p className="text-xs" style={{ color: "rgba(237,237,237,0.35)" }}>
                    Cobrado mensalmente
                  </p>
                )}
              </div>
              <p className="text-sm font-medium">{price}</p>
            </div>

            <div className="border-t my-3" style={{ borderColor: "rgba(237,237,237,0.08)" }} />

            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: "rgba(237,237,237,0.55)" }}>Subtotal</p>
              <p className="text-sm font-medium">{price}</p>
            </div>

            {/* Coupon section */}
            {appliedCoupon ? (
              <div
                className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                style={{ backgroundColor: "rgba(237,237,237,0.05)", border: "1px solid rgba(237,237,237,0.08)" }}
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                  <code className="text-xs font-bold" style={{ color: primaryColor }}>
                    {appliedCoupon.code}
                  </code>
                  <span className="text-xs" style={{ color: "rgba(237,237,237,0.5)" }}>
                    {appliedCoupon.discount_percent}% off
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: "#ef4444" }}>
                    -{formatPrice(discountCents)}
                  </span>
                  <button onClick={removeCoupon} className="p-0.5 rounded hover:bg-white/10 transition-colors">
                    <X className="h-3.5 w-3.5" style={{ color: "rgba(237,237,237,0.4)" }} />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="flex items-center gap-2 rounded-lg overflow-hidden"
                  style={{ border: "1px solid rgba(237,237,237,0.08)" }}
                >
                  <div className="flex items-center gap-2 flex-1 px-3 py-2.5" style={{ backgroundColor: "rgba(237,237,237,0.04)" }}>
                    <Tag className="h-3.5 w-3.5" style={{ color: "rgba(237,237,237,0.3)" }} />
                    <input
                      type="text"
                      placeholder="Código de cupom"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      className="bg-transparent text-xs text-white placeholder:text-white/25 outline-none flex-1 font-mono"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim() || couponLoading || !onCouponValidate}
                    className="px-4 py-2.5 text-xs font-semibold transition-colors disabled:opacity-30"
                    style={{ color: primaryColor }}
                  >
                    {couponLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Aplicar"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs mt-1.5" style={{ color: "#ef4444" }}>{couponError}</p>
                )}
              </div>
            )}

            {/* Discount line */}
            {appliedCoupon && (
              <>
                <div className="border-t my-3" style={{ borderColor: "rgba(237,237,237,0.08)" }} />
              </>
            )}

            <div className="border-t my-3" style={{ borderColor: "rgba(237,237,237,0.08)" }} />

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Total devido hoje</p>
              <p className="text-sm font-bold" style={{ color: primaryColor }}>
                {formatPrice(totalCents)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-4 text-[10px]" style={{ color: "rgba(237,237,237,0.25)" }}>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" /> Pagamento seguro
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" /> Dados protegidos
            </div>
          </div>
          <div className="border-t pt-4" style={{ borderColor: "rgba(237,237,237,0.06)" }}>
            <p className="text-[10px] font-medium" style={{ color: "rgba(237,237,237,0.2)" }}>
              <span style={{ color: "rgba(237,237,237,0.35)" }}>
                Bianchini{" "}
                <span style={{ color: primaryColor, opacity: 0.6 }}>Pay</span>
              </span>
              {" "}© 2026 · Todos os direitos reservados
            </p>
            <p className="text-[9px] mt-1" style={{ color: "rgba(237,237,237,0.15)" }}>
              Plataforma segura de pagamentos · Termos de uso · Política de privacidade
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT — White/light side */}
      <div className="w-1/2 p-10 flex flex-col" style={{ backgroundColor: "#f8f8f8" }}>
        <div className="max-w-sm mx-auto w-full flex-1">
          {/* Form */}
          <LeadCaptureForm
            primaryColor={primaryColor}
            btnTextColor="#ffffff"
            textColor="#1a1a1a"
            mutedColor="rgba(0,0,0,0.45)"
            ctaText={ctaText}
            billingType={billingType}
            onSubmit={onLeadSubmit}
          />

          {/* Guarantee */}
          {showGuarantee && (
            <div
              className="mt-6 flex items-center gap-3 p-3.5 rounded-xl"
              style={{ backgroundColor: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <Shield className="h-5 w-5 shrink-0" style={{ color: primaryColor }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>
                  {guaranteeText}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(0,0,0,0.35)" }}>
                  Seu dinheiro de volta, sem perguntas.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3" style={{ color: "rgba(0,0,0,0.2)" }} />
            <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.2)" }}>
              Transação segura · Dados criptografados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

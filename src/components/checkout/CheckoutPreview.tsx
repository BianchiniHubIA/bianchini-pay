import { Shield, Lock } from "lucide-react";
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
  const price = formatPrice(priceCents);
  const isRecurring = billingType === "recurring";

  return (
    <div className="min-h-[600px] flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* LEFT — Dark side */}
      <div className="w-1/2 p-10 flex flex-col justify-between" style={{ backgroundColor: "#0a2540", color: "#ffffff" }}>
        <div>
          {/* Logo */}
          {logoUrl ? (
            <div className="mb-8">
              <img src={logoUrl} alt="Logo" className="h-7 object-contain" />
            </div>
          ) : (
            <div className="mb-8">
              <div className="h-7 w-7 rounded-full" style={{ backgroundColor: primaryColor }} />
            </div>
          )}

          {/* Product name + price */}
          <p className="text-sm text-white/60 mb-1">
            {isRecurring ? "Assinar" : "Comprar"} {offerName}
          </p>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold tracking-tight">{price}</span>
            {isRecurring && (
              <span className="text-sm text-white/50">por<br/>mês</span>
            )}
          </div>
          {isRecurring && (
            <p className="text-xs text-white/40 mb-6">cobrado mensalmente</p>
          )}

          {/* Divider */}
          <div className="border-t border-white/10 my-6" />

          {/* Order summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{offerName}</p>
                {isRecurring && <p className="text-xs text-white/40">Cobrado mensalmente</p>}
              </div>
              <p className="text-sm font-medium">{price}</p>
            </div>

            <div className="border-t border-white/10 my-3" />

            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Subtotal</p>
              <p className="text-sm font-medium">{price}</p>
            </div>

            {/* Coupon placeholder */}
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg border border-white/10 bg-white/5">
              <span className="text-xs">🏷️</span>
              <input
                type="text"
                placeholder="Código de cupom"
                className="bg-transparent text-xs text-white placeholder:text-white/30 outline-none flex-1"
                readOnly
              />
            </div>

            <div className="border-t border-white/10 my-3" />

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Total devido hoje</p>
              <p className="text-sm font-bold">{price}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center gap-4 text-[10px] text-white/30">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Pagamento seguro
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" /> Dados protegidos
          </div>
        </div>
      </div>

      {/* RIGHT — White side */}
      <div className="w-1/2 bg-white p-10 flex flex-col">
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
            <div className="mt-6 flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <Shield className="h-5 w-5 shrink-0 text-emerald-500" />
              <div>
                <p className="text-xs font-semibold text-gray-800">{guaranteeText}</p>
                <p className="text-[10px] mt-0.5 text-gray-400">Seu dinheiro de volta, sem perguntas.</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-1.5">
            <Lock className="h-3 w-3 text-gray-300" />
            <span className="text-[10px] text-gray-300">
              Transação segura · Dados criptografados
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

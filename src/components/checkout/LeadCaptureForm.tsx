import { useState, type ReactNode, useMemo } from "react";
import { User, Mail, Phone, FileText, Lock, CreditCard } from "lucide-react";
import { PixIcon, BoletoIcon } from "@/components/icons/PaymentIcons";

interface LeadCaptureFormProps {
  primaryColor: string;
  btnTextColor: string;
  textColor: string;
  mutedColor: string;
  ctaText: string;
  billingType?: string;
  onSubmit?: (data: LeadFormData) => void;
}

export interface LeadFormData {
  name: string;
  email: string;
  whatsapp: string;
  document: string;
  paymentMethod: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  cardHolder?: string;
}

interface PaymentMethod {
  id: string;
  label: string;
  icon: ReactNode;
}

type CardBrand = "visa" | "mastercard" | "elo" | "amex" | "unknown";

function detectCardBrand(number: string): CardBrand {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "unknown";
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(digits)) return "elo";
  return "unknown";
}

function VisaIcon({ className, muted }: { className?: string; muted?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: muted ? 0.25 : 1 }}>
      <rect width="780" height="500" rx="40" fill="#1A1F71"/>
      <path d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8H293.2zM541.7 157.1c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.5-90.3 64.5-.3 28.1 26.5 43.7 46.8 53.1 20.8 9.6 27.8 15.7 27.7 24.3-.1 13.1-16.6 19.1-32 19.1-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 43.8c12.5 5.5 35.6 10.2 59.6 10.5 56.2 0 92.6-26.2 93-66.7.2-22.2-14-39.1-44.8-53.1-18.7-9-30.1-15-30-24.2 0-8.1 9.7-16.8 30.6-16.8 17.5-.3 30.1 3.5 40 7.5l4.8 2.3 7.2-42.7zM646.5 152.9h-41.3c-12.8 0-22.4 3.5-28 16.2l-79.4 179.6h56.2s9.2-24.1 11.2-29.4h68.7c1.6 6.9 6.5 29.4 6.5 29.4h49.7l-43.6-195.8zm-66 126.5c4.4-11.3 21.5-54.7 21.5-54.7-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47.2 12.5 57.2h-44.8v-.7zM231.4 152.9L179 285l-5.6-27.1c-9.7-31.2-39.9-65-73.7-81.9l47.9 171.5h56.6l84.2-195.6h-57z" fill="#fff"/>
      <path d="M146.9 152.9H59.6l-.7 3.8c67.2 16.2 111.7 55.4 130.1 102.5l-18.8-90.1c-3.2-12.4-12.8-15.7-23.3-16.2z" fill="#F9A533"/>
    </svg>
  );
}

function MastercardIcon({ className, muted }: { className?: string; muted?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: muted ? 0.25 : 1 }}>
      <circle cx="312" cy="250" r="148" fill="#EB001B"/>
      <circle cx="468" cy="250" r="148" fill="#F79E1B"/>
      <path d="M390 130.7c37.4 29.5 61.4 75.3 61.4 126.3s-24 96.8-61.4 126.3c-37.4-29.5-61.4-75.3-61.4-126.3s24-96.8 61.4-126.3z" fill="#FF5F00"/>
    </svg>
  );
}

function CardBrandIcons({ brand }: { brand: CardBrand }) {
  if (brand === "visa") return <VisaIcon className="h-5 w-8" />;
  if (brand === "mastercard") return <MastercardIcon className="h-5 w-8" />;
  // Default: show both muted
  return (
    <div className="flex items-center gap-1">
      <VisaIcon className="h-5 w-8" muted={brand !== "unknown"} />
      <MastercardIcon className="h-5 w-8" muted={brand !== "unknown"} />
    </div>
  );
}

export function LeadCaptureForm({
  primaryColor,
  btnTextColor,
  textColor,
  mutedColor,
  ctaText,
  billingType,
  onSubmit,
}: LeadCaptureFormProps) {
  const isRecurring = billingType === "recurring";

  const [form, setForm] = useState<LeadFormData>({
    name: "",
    email: "",
    whatsapp: "",
    document: "",
    paymentMethod: isRecurring ? "credit_card" : "pix",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardHolder: "",
  });

  const cardBrand = useMemo(() => detectCardBrand(form.cardNumber || ""), [form.cardNumber]);

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2);
    return digits;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(form);
    }
  };

  const allPaymentMethods: PaymentMethod[] = [
    { id: "pix", label: "Pix", icon: <PixIcon className="h-[18px] w-[18px]" /> },
    { id: "credit_card", label: "Cartão de Crédito", icon: <CreditCard className="h-[18px] w-[18px] opacity-70" /> },
    { id: "boleto", label: "Boleto", icon: <BoletoIcon className="h-[18px] w-[18px] opacity-60" /> },
  ];

  const paymentMethods = isRecurring
    ? allPaymentMethods.filter((m) => m.id === "credit_card")
    : allPaymentMethods;

  const inputBase =
    "w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200 placeholder:text-gray-300 bg-white";

  const inputStyle = (hasIcon?: boolean): React.CSSProperties => ({
    paddingLeft: hasIcon ? "2.5rem" : undefined,
    borderColor: "rgba(0,0,0,0.10)",
    color: "#1a1a1a",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  });

  const focusRingStyle = `focus:ring-2 focus:ring-offset-0 focus:border-transparent`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3.5"
      style={{ fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}
    >
      {/* E-mail */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
          E-mail
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <input
            type="email"
            placeholder="seu@email.com"
            required
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`${inputBase} ${focusRingStyle}`}
            style={{
              ...inputStyle(true),
              "--tw-ring-color": primaryColor,
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Forma de Pagamento */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
          Forma de pagamento
        </label>
        <div
          className="rounded-lg overflow-hidden"
          style={{
            border: "1px solid rgba(0,0,0,0.10)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          {paymentMethods.map((m, i) => {
            const isActive = form.paymentMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleChange("paymentMethod", m.id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left transition-all duration-200"
                style={{
                  backgroundColor: isActive ? `${primaryColor}0A` : "#fff",
                  borderLeft: isActive ? `3px solid ${primaryColor}` : "3px solid transparent",
                  borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none",
                  color: isActive ? "#1a1a1a" : "rgba(0,0,0,0.5)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span className="flex-shrink-0 flex items-center justify-center w-5">{m.icon}</span>
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Card fields */}
      {form.paymentMethod === "credit_card" && (
        <div
          className="space-y-2.5 p-3.5 rounded-lg"
          style={{
            backgroundColor: "rgba(0,0,0,0.015)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
            Dados do cartão
          </label>
          {/* Card number with auto-detected brand */}
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="1234 1234 1234 1234"
              value={form.cardNumber}
              onChange={(e) => handleChange("cardNumber", formatCardNumber(e.target.value))}
              maxLength={19}
              className={`${inputBase} ${focusRingStyle}`}
              style={{
                ...inputStyle(),
                paddingRight: "5.5rem",
                "--tw-ring-color": primaryColor,
              } as React.CSSProperties}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              <CardBrandIcons brand={cardBrand} />
            </div>
          </div>
          {/* Cardholder name */}
          <input
            type="text"
            placeholder="Nome do titular"
            value={form.cardHolder}
            onChange={(e) => handleChange("cardHolder", e.target.value)}
            className={`${inputBase} ${focusRingStyle}`}
            style={{
              ...inputStyle(),
              "--tw-ring-color": primaryColor,
            } as React.CSSProperties}
          />
          {/* Expiry + CVC */}
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              inputMode="numeric"
              placeholder="MM / AA"
              value={form.cardExpiry}
              onChange={(e) => handleChange("cardExpiry", formatExpiry(e.target.value))}
              maxLength={7}
              className={`${inputBase} ${focusRingStyle}`}
              style={{
                ...inputStyle(),
                "--tw-ring-color": primaryColor,
              } as React.CSSProperties}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="CVC"
              value={form.cardCvc}
              onChange={(e) => handleChange("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
              maxLength={4}
              className={`${inputBase} ${focusRingStyle}`}
              style={{
                ...inputStyle(),
                "--tw-ring-color": primaryColor,
              } as React.CSSProperties}
            />
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
          Nome completo
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <input
            type="text"
            placeholder="Seu nome completo"
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`${inputBase} ${focusRingStyle}`}
            style={{
              ...inputStyle(true),
              "--tw-ring-color": primaryColor,
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* CPF */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
          CPF
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <input
            type="text"
            inputMode="numeric"
            placeholder="000.000.000-00"
            required
            value={form.document}
            onChange={(e) => handleChange("document", e.target.value)}
            className={`${inputBase} ${focusRingStyle}`}
            style={{
              ...inputStyle(true),
              "--tw-ring-color": primaryColor,
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
          Telefone{" "}
          <span className="normal-case font-normal text-gray-300">(Opcional)</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <input
            type="tel"
            placeholder="(00) 00000-0000"
            value={form.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            className={`${inputBase} ${focusRingStyle}`}
            style={{
              ...inputStyle(true),
              "--tw-ring-color": primaryColor,
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99]"
        style={{
          backgroundColor: primaryColor,
          color: btnTextColor,
          boxShadow: `0 4px 16px ${primaryColor}35`,
        }}
      >
        {ctaText}
      </button>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-1.5">
        <Lock className="h-3 w-3 text-gray-300" />
        <p className="text-[10px] text-gray-300">
          Seus dados estão seguros e protegidos
        </p>
      </div>
    </form>
  );
}

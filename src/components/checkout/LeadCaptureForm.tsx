import { useState } from "react";
import { User, Mail, Phone, FileText } from "lucide-react";
import { PixIcon, CreditCardIcon, BoletoIcon } from "@/components/icons/PaymentIcons";

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
  });

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  const allPaymentMethods = [
    { id: "pix", label: "Pix", icon: <PixIcon className="h-5 w-5" /> },
    { id: "credit_card", label: "Cartão de Crédito", icon: <CreditCardIcon className="h-5 w-5 text-blue-400" /> },
    { id: "boleto", label: "Boleto", icon: <BoletoIcon className="h-5 w-5 text-gray-500" /> },
  ];

  const paymentMethods = isRecurring
    ? allPaymentMethods.filter((m) => m.id === "credit_card")
    : allPaymentMethods;

  const inputClasses =
    "w-full px-4 py-3 rounded-lg border text-sm outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" style={{ fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-1" style={{ color: textColor }}>
          Pagar com cartão
        </h2>
      </div>

      {/* E-mail */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
          E-mail
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(0,0,0,0.25)" }} />
          <input
            type="email"
            placeholder="seu@email.com"
            required
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={inputClasses}
            style={{
              paddingLeft: "2.5rem",
              backgroundColor: "#ffffff",
              borderColor: "rgba(0,0,0,0.1)",
              color: textColor,
              "--tw-ring-color": primaryColor,
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Forma de Pagamento */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
          Forma de pagamento
        </label>
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          {paymentMethods.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleChange("paymentMethod", m.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all"
              style={{
                backgroundColor: form.paymentMethod === m.id ? `${primaryColor}08` : "#ffffff",
                borderLeft: form.paymentMethod === m.id ? `3px solid ${primaryColor}` : "3px solid transparent",
                borderTop: i > 0 ? "1px solid rgba(0,0,0,0.06)" : "none",
                color: form.paymentMethod === m.id ? textColor : "rgba(0,0,0,0.55)",
                fontWeight: form.paymentMethod === m.id ? 600 : 400,
              }}
            >
              <span className="flex-shrink-0">{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card fields (when credit card selected) */}
      {form.paymentMethod === "credit_card" && (
        <div
          className="space-y-3 p-4 rounded-lg"
          style={{ backgroundColor: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.08)" }}
        >
          <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
            Dados do cartão
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="1234 1234 1234 1234"
              className={inputClasses}
              style={{ backgroundColor: "#ffffff", borderColor: "rgba(0,0,0,0.1)", color: textColor }}
              readOnly
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="h-5 w-7 rounded bg-blue-700 flex items-center justify-center">
                <span className="text-[7px] font-bold text-white">VISA</span>
              </div>
              <div className="h-5 w-7 rounded bg-red-500 flex items-center justify-center">
                <span className="text-[7px] font-bold text-white">MC</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="MM / AA"
              className={inputClasses}
              style={{ backgroundColor: "#ffffff", borderColor: "rgba(0,0,0,0.1)", color: textColor }}
              readOnly
            />
            <input
              type="text"
              placeholder="CVC"
              className={inputClasses}
              style={{ backgroundColor: "#ffffff", borderColor: "rgba(0,0,0,0.1)", color: textColor }}
              readOnly
            />
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
          Nome completo
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(0,0,0,0.25)" }} />
          <input
            type="text"
            placeholder="Seu nome completo"
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={inputClasses}
            style={{
              paddingLeft: "2.5rem",
              backgroundColor: "#ffffff",
              borderColor: "rgba(0,0,0,0.1)",
              color: textColor,
              "--tw-ring-color": primaryColor,
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* CPF */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
          CPF
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(0,0,0,0.25)" }} />
          <input
            type="text"
            placeholder="000.000.000-00"
            required
            value={form.document}
            onChange={(e) => handleChange("document", e.target.value)}
            className={inputClasses}
            style={{
              paddingLeft: "2.5rem",
              backgroundColor: "#ffffff",
              borderColor: "rgba(0,0,0,0.1)",
              color: textColor,
              "--tw-ring-color": primaryColor,
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* WhatsApp */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: mutedColor }}>
          Telefone{" "}
          <span className="normal-case font-normal" style={{ color: "rgba(0,0,0,0.25)" }}>(Opcional)</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(0,0,0,0.25)" }} />
          <input
            type="tel"
            placeholder="(00) 00000-0000"
            value={form.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            className={inputClasses}
            style={{
              paddingLeft: "2.5rem",
              backgroundColor: "#ffffff",
              borderColor: "rgba(0,0,0,0.1)",
              color: textColor,
              "--tw-ring-color": primaryColor,
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-lg font-bold text-sm transition-all hover:opacity-90"
        style={{
          backgroundColor: primaryColor,
          color: btnTextColor,
          boxShadow: `0 4px 14px ${primaryColor}40`,
        }}
      >
        {ctaText}
      </button>

      <p className="text-[10px] text-center" style={{ color: "rgba(0,0,0,0.2)" }}>
        🔒 Seus dados estão seguros e protegidos
      </p>
    </form>
  );
}

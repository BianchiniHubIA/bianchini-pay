import { useState, type ReactNode } from "react";
import { User, Mail, Phone, FileText, Lock, ShieldCheck } from "lucide-react";
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

interface PaymentMethod {
  id: string;
  label: string;
  icon: ReactNode;
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

  const allPaymentMethods: PaymentMethod[] = [
    { id: "pix", label: "Pix", icon: <PixIcon className="h-[18px] w-[18px]" /> },
    { id: "credit_card", label: "Cartão de Crédito", icon: <CreditCardIcon className="h-[18px] w-[18px] opacity-60" /> },
    { id: "boleto", label: "Boleto", icon: <BoletoIcon className="h-[18px] w-[18px] opacity-50" /> },
  ];

  const paymentMethods = isRecurring
    ? allPaymentMethods.filter((m) => m.id === "credit_card")
    : allPaymentMethods;

  const inputBase =
    "w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all duration-200 placeholder:text-gray-300 bg-white";

  const inputStyle = (hasIcon?: boolean): React.CSSProperties => ({
    paddingLeft: hasIcon ? "2.75rem" : undefined,
    borderColor: "rgba(0,0,0,0.08)",
    color: textColor,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  });

  const focusRingStyle = `focus:ring-2 focus:ring-offset-0 focus:border-transparent`;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      style={{ fontFamily: "'Outfit', 'Inter', system-ui, sans-serif" }}
    >
      {/* E-mail */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
          E-mail
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
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
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
          Forma de pagamento
        </label>
        <div
          className="rounded-xl overflow-hidden"
          style={{
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {paymentMethods.map((m, i) => {
            const isActive = form.paymentMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleChange("paymentMethod", m.id)}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-sm text-left transition-all duration-200"
                style={{
                  backgroundColor: isActive ? `${primaryColor}0A` : "#fff",
                  borderLeft: isActive ? `3px solid ${primaryColor}` : "3px solid transparent",
                  borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none",
                  color: isActive ? textColor : "rgba(0,0,0,0.5)",
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
          className="space-y-3 p-4 rounded-xl"
          style={{
            backgroundColor: "rgba(0,0,0,0.015)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
            Dados do cartão
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="1234 1234 1234 1234"
              className={`${inputBase} ${focusRingStyle}`}
              style={{
                ...inputStyle(),
                "--tw-ring-color": primaryColor,
              } as React.CSSProperties}
              readOnly
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <div className="h-5 w-8 rounded-[3px] bg-[#1a1f71] flex items-center justify-center">
                <span className="text-[6px] font-bold text-white tracking-wider">VISA</span>
              </div>
              <div className="h-5 w-8 rounded-[3px] flex items-center justify-center overflow-hidden">
                <div className="flex">
                  <div className="w-3.5 h-5 rounded-full bg-[#eb001b] opacity-80" />
                  <div className="w-3.5 h-5 rounded-full bg-[#f79e1b] opacity-80 -ml-2" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="MM / AA"
              className={`${inputBase} ${focusRingStyle}`}
              style={{
                ...inputStyle(),
                "--tw-ring-color": primaryColor,
              } as React.CSSProperties}
              readOnly
            />
            <input
              type="text"
              placeholder="CVC"
              className={`${inputBase} ${focusRingStyle}`}
              style={{
                ...inputStyle(),
                "--tw-ring-color": primaryColor,
              } as React.CSSProperties}
              readOnly
            />
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
          Nome completo
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
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
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
          CPF
        </label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <input
            type="text"
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
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: mutedColor }}>
          Telefone{" "}
          <span className="normal-case font-normal text-gray-300">(Opcional)</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
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
        className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 hover:brightness-110 active:scale-[0.99]"
        style={{
          backgroundColor: primaryColor,
          color: btnTextColor,
          boxShadow: `0 4px 16px ${primaryColor}35`,
        }}
      >
        {ctaText}
      </button>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <Lock className="h-3 w-3 text-gray-300" />
        <p className="text-[10px] text-gray-300">
          Seus dados estão seguros e protegidos
        </p>
      </div>
    </form>
  );
}

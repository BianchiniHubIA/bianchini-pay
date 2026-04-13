import { useState } from "react";
import { User, Mail, Phone, CreditCard, FileText } from "lucide-react";

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

  const inputStyle: React.CSSProperties = {
    backgroundColor: textColor === "#ffffff" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
    borderColor: textColor === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
    color: textColor,
  };

  const allPaymentMethods = [
    { id: "pix", label: "Pix", icon: "⚡" },
    { id: "credit_card", label: "Cartão de Crédito", icon: "💳" },
    { id: "boleto", label: "Boleto", icon: "📄" },
  ];

  const paymentMethods = isRecurring
    ? allPaymentMethods.filter((m) => m.id === "credit_card")
    : allPaymentMethods;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-semibold mb-2" style={{ color: textColor }}>
        Preencha seus dados
      </p>

      {/* Nome */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: mutedColor }} />
        <input
          type="text"
          placeholder="Seu nome completo"
          required
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
          style={{ ...inputStyle, "--tw-ring-color": primaryColor } as React.CSSProperties}
        />
      </div>

      {/* Email */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: mutedColor }} />
        <input
          type="email"
          placeholder="seu@email.com"
          required
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
          style={{ ...inputStyle, "--tw-ring-color": primaryColor } as React.CSSProperties}
        />
      </div>

      {/* WhatsApp */}
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: mutedColor }} />
        <input
          type="tel"
          placeholder="(00) 00000-0000"
          required
          value={form.whatsapp}
          onChange={(e) => handleChange("whatsapp", e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
          style={{ ...inputStyle, "--tw-ring-color": primaryColor } as React.CSSProperties}
        />
      </div>

      {/* CPF */}
      <div className="relative">
        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: mutedColor }} />
        <input
          type="text"
          placeholder="CPF (000.000.000-00)"
          required
          value={form.document}
          onChange={(e) => handleChange("document", e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 transition-all"
          style={{ ...inputStyle, "--tw-ring-color": primaryColor } as React.CSSProperties}
        />
      </div>

      {/* Forma de Pagamento */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: mutedColor }}>
          <CreditCard className="inline h-3.5 w-3.5 mr-1" />
          Forma de pagamento
        </p>
        <div className="flex gap-2">
          {paymentMethods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleChange("paymentMethod", m.id)}
              className="flex-1 py-2 px-2 rounded-lg text-xs font-medium border transition-all"
              style={{
                backgroundColor: form.paymentMethod === m.id ? primaryColor : "transparent",
                color: form.paymentMethod === m.id ? btnTextColor : textColor,
                borderColor: form.paymentMethod === m.id ? primaryColor : (textColor === "#ffffff" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"),
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-xl font-bold text-sm transition-transform hover:scale-[1.02]"
        style={{ backgroundColor: primaryColor, color: btnTextColor }}
      >
        {ctaText}
      </button>

      <p className="text-[9px] text-center" style={{ color: mutedColor }}>
        🔒 Seus dados estão seguros e protegidos
      </p>
    </form>
  );
}

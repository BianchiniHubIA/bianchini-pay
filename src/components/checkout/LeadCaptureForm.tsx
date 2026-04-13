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

  const allPaymentMethods = [
    { id: "pix", label: "Pix", icon: "⚡" },
    { id: "credit_card", label: "Cartão de Crédito", icon: "💳" },
    { id: "boleto", label: "Boleto", icon: "📄" },
  ];

  const paymentMethods = isRecurring
    ? allPaymentMethods.filter((m) => m.id === "credit_card")
    : allPaymentMethods;

  const inputClasses =
    "w-full px-4 py-3 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:border-transparent transition-all bg-white text-gray-900 placeholder:text-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Pagar com cartão</h2>
      </div>

      {/* E-mail */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            placeholder="seu@email.com"
            required
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`${inputClasses} pl-10`}
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Forma de Pagamento */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Forma de pagamento
        </label>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          {paymentMethods.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleChange("paymentMethod", m.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                form.paymentMethod === m.id
                  ? "bg-blue-50 border-l-2"
                  : "bg-white hover:bg-gray-50"
              } ${i > 0 ? "border-t border-gray-100" : ""}`}
              style={{
                borderLeftColor: form.paymentMethod === m.id ? primaryColor : "transparent",
              }}
            >
              <span className="text-base">{m.icon}</span>
              <span className={`font-medium ${form.paymentMethod === m.id ? "text-gray-900" : "text-gray-600"}`}>
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Card fields (when credit card selected) */}
      {form.paymentMethod === "credit_card" && (
        <div className="space-y-3 p-4 rounded-lg border border-gray-200 bg-gray-50/50">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dados do cartão</label>
          <div className="relative">
            <input
              type="text"
              placeholder="1234 1234 1234 1234"
              className={inputClasses}
              readOnly
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="h-5 w-7 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-[7px] font-bold text-white">VISA</span>
              </div>
              <div className="h-5 w-7 rounded bg-red-500 flex items-center justify-center">
                <span className="text-[7px] font-bold text-white">MC</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="MM / AA" className={inputClasses} readOnly />
            <input type="text" placeholder="CVC" className={inputClasses} readOnly />
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nome completo</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Seu nome completo"
            required
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`${inputClasses} pl-10`}
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          />
        </div>
      </div>

      {/* CPF */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="000.000.000-00"
            required
            value={form.document}
            onChange={(e) => handleChange("document", e.target.value)}
            className={`${inputClasses} pl-10`}
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          />
        </div>
      </div>

      {/* WhatsApp */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Telefone <span className="text-gray-300 normal-case">(Opcional)</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="tel"
            placeholder="(00) 00000-0000"
            value={form.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            className={`${inputClasses} pl-10`}
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90 shadow-lg"
        style={{ backgroundColor: primaryColor, color: btnTextColor }}
      >
        {ctaText}
      </button>

      <p className="text-[10px] text-center text-gray-300">
        🔒 Seus dados estão seguros e protegidos
      </p>
    </form>
  );
}

import { Shield, Play, Star, Zap, QrCode, Timer, CheckCircle2, FileText } from "lucide-react";
import type { CheckoutTemplate } from "@/data/checkoutTemplates";

interface TemplateCardProps {
  template: CheckoutTemplate;
  selected?: boolean;
  onClick: () => void;
}

function getIcon(templateId: string) {
  switch (templateId) {
    case "hotmart": return "🔥";
    case "stripe": return "💎";
    case "asaas": return "⚡";
    case "cakto": return "🚀";
    case "blank": return "📄";
    default: return "📦";
  }
}

function getCategoryLabel(cat: string) {
  switch (cat) {
    case "infoproduto": return "Infoproduto";
    case "saas": return "SaaS / Ferramenta";
    case "pagamentos": return "Pagamentos BR";
    case "alta-conversao": return "Alta Conversão";
    case "custom": return "Personalizado";
    default: return cat;
  }
}

export function TemplateCard({ template, selected, onClick }: TemplateCardProps) {
  const style = template.thumbnail_style;

  return (
    <button
      onClick={onClick}
      className={`group relative rounded-xl border-2 text-left transition-all overflow-hidden ${
        selected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/30 hover:shadow-lg"
      }`}
    >
      {/* Mini preview */}
      <div
        className="h-36 relative overflow-hidden"
        style={{ backgroundColor: style.bg_color }}
      >
        {/* Simulated layout */}
        <div className="absolute inset-0 p-3 flex flex-col">
          {/* Fake header */}
          <div className="flex items-center justify-between mb-2">
            <div className="h-2 w-10 rounded-full" style={{ backgroundColor: style.primary_color, opacity: 0.6 }} />
            <div className="h-2 w-6 rounded-full bg-current" style={{ color: style.primary_color, opacity: 0.3 }} />
          </div>

          {template.id === "blank" ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-40">
              <FileText className="h-6 w-6" style={{ color: style.primary_color }} />
              <div className="h-1.5 w-16 rounded-full bg-gray-300" />
              <div className="h-1.5 w-12 rounded-full bg-gray-200" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center gap-1.5">
              {/* Title lines */}
              <div className="h-2.5 w-3/4 rounded-full" style={{ backgroundColor: style.bg_color === "#0F0F0F" ? "#fff" : "#1a1a1a", opacity: 0.8 }} />
              <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: style.bg_color === "#0F0F0F" ? "#fff" : "#1a1a1a", opacity: 0.3 }} />

              {/* Price */}
              <div className="h-3 w-1/3 rounded-full mt-1" style={{ backgroundColor: style.primary_color, opacity: 0.9 }} />

              {/* CTA button */}
              <div
                className="h-5 w-2/3 rounded mt-1"
                style={{ backgroundColor: style.primary_color }}
              />

              {/* Feature dots */}
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-0.5">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.accent_color }} />
                    <div className="h-1 w-6 rounded-full bg-current" style={{ color: style.bg_color === "#0F0F0F" ? "#fff" : "#1a1a1a", opacity: 0.2 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute top-2 right-2">
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-black/10 backdrop-blur-sm"
                style={{ color: style.bg_color === "#0F0F0F" ? "#fff" : "#333" }}>
            {getCategoryLabel(template.category)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-card">
        <div className="flex items-center gap-2">
          <span className="text-base">{getIcon(template.id)}</span>
          <p className="font-heading font-semibold text-sm">{template.name}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>

        {/* Block count */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex gap-0.5">
            {template.blocks.slice(0, 5).map((_, i) => (
              <div key={i} className="h-1 w-3 rounded-full" style={{ backgroundColor: style.primary_color, opacity: 0.3 + i * 0.15 }} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground ml-1">{template.blocks.length} blocos</span>
        </div>
      </div>
    </button>
  );
}

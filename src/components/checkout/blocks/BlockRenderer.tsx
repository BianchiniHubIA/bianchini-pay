import { Shield, Check, Star, MessageSquare, Image as ImageIcon } from "lucide-react";
import type { PlacedBlock, DropZoneId } from "./types";

interface BlockRendererProps {
  block: PlacedBlock;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  side: "left" | "right" | "full";
}

export function BlockRenderer({ block, primaryColor, textColor, mutedColor, accentColor, side }: BlockRendererProps) {
  const accent = accentColor || primaryColor;

  switch (block.type) {
    case "image": {
      const url = block.config?.url;
      if (!url) {
        return (
          <div
            className="rounded-lg flex items-center justify-center py-6"
            style={{ backgroundColor: `${textColor}08`, border: `1px solid ${textColor}10` }}
          >
            <ImageIcon className="h-8 w-8" style={{ color: `${textColor}30` }} />
          </div>
        );
      }
      return (
        <img
          src={url}
          alt={block.config?.alt || ""}
          className="w-full rounded-lg object-cover max-h-48"
        />
      );
    }

    case "guarantee": {
      return (
        <div
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ backgroundColor: `${textColor}06`, border: `1px solid ${textColor}10` }}
        >
          <Shield className="h-5 w-5 shrink-0" style={{ color: accent }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: textColor }}>
              {block.config?.text || "7 dias de garantia"}
            </p>
            {block.config?.subtext && (
              <p className="text-[10px] mt-0.5" style={{ color: mutedColor }}>
                {block.config.subtext}
              </p>
            )}
          </div>
        </div>
      );
    }

    case "benefits": {
      const items = block.config?.items || [];
      if (!items.length) return null;
      return (
        <div className="space-y-1.5">
          {items.map((item: string, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: accent }} />
              <p className="text-xs" style={{ color: textColor }}>{item}</p>
            </div>
          ))}
        </div>
      );
    }

    case "testimonials": {
      const items = block.config?.items || [];
      if (!items.length) return null;
      return (
        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <div
              key={i}
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${textColor}06`, border: `1px solid ${textColor}08` }}
            >
              <div className="flex items-center gap-1 mb-1.5">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="h-3 w-3"
                    style={{
                      color: j < (item.rating || 5) ? "#F59E0B" : `${textColor}20`,
                      fill: j < (item.rating || 5) ? "#F59E0B" : "transparent",
                    }}
                  />
                ))}
              </div>
              <p className="text-[11px] italic mb-1" style={{ color: textColor }}>
                "{item.text || "Depoimento..."}"
              </p>
              <p className="text-[10px] font-medium" style={{ color: mutedColor }}>
                — {item.name || "Cliente"}
              </p>
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}

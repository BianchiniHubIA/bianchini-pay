import { type ReactNode } from "react";
import { Image, Shield, MessageSquare, List, Type, CreditCard, Star } from "lucide-react";

export type BlockType = "image" | "guarantee" | "testimonials" | "benefits";

export type DropZoneId = 
  | "left-top" 
  | "left-center" 
  | "right-top" 
  | "right-center" 
  | "footer";

export interface BlockDefinition {
  type: BlockType;
  label: string;
  icon: any;
  description: string;
}

export interface PlacedBlock {
  type: BlockType;
  config: Record<string, any>;
}

export type BlocksLayout = Record<DropZoneId, PlacedBlock[]>;

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  { type: "image", label: "Imagem do Produto", icon: Image, description: "Banner ou foto do produto" },
  { type: "guarantee", label: "Selo de Garantia", icon: Shield, description: "Badge de garantia de X dias" },
  { type: "testimonials", label: "Depoimentos", icon: MessageSquare, description: "Testemunhos de clientes" },
  { type: "benefits", label: "Lista de Benefícios", icon: List, description: "Bullets com benefícios" },
];

export const DROP_ZONES: { id: DropZoneId; label: string; side: "left" | "right" | "full" }[] = [
  { id: "left-top", label: "Topo Esquerdo", side: "left" },
  { id: "left-center", label: "Centro Esquerdo", side: "left" },
  { id: "right-top", label: "Topo Direito", side: "right" },
  { id: "right-center", label: "Centro Direito", side: "right" },
  { id: "footer", label: "Rodapé", side: "full" },
];

export const DEFAULT_BLOCKS_LAYOUT: BlocksLayout = {
  "left-top": [],
  "left-center": [],
  "right-top": [],
  "right-center": [],
  "footer": [],
};

export function getDefaultConfig(type: BlockType): Record<string, any> {
  switch (type) {
    case "image":
      return { url: "", alt: "Imagem do produto" };
    case "guarantee":
      return { text: "7 dias de garantia", subtext: "Seu dinheiro de volta, sem perguntas." };
    case "testimonials":
      return { items: [{ name: "Cliente", text: "Produto incrível!", rating: 5 }] };
    case "benefits":
      return { items: ["Acesso imediato", "Suporte 24h", "Atualizações gratuitas"] };
    default:
      return {};
  }
}

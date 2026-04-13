import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, X, Star } from "lucide-react";
import type { BlockType, PlacedBlock } from "./types";
import { BLOCK_DEFINITIONS } from "./types";

interface BlockConfigPanelProps {
  block: PlacedBlock;
  onChange: (config: Record<string, any>) => void;
}

export function BlockConfigPanel({ block, onChange }: BlockConfigPanelProps) {
  const def = BLOCK_DEFINITIONS.find((b) => b.type === block.type);
  if (!def) return null;

  const Icon = def.icon;
  const config = block.config;

  const updateConfig = (key: string, value: any) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b">
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <p className="text-sm font-semibold">{def.label}</p>
      </div>

      {block.type === "image" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">URL da imagem</Label>
            <Input
              value={config.url || ""}
              onChange={(e) => updateConfig("url", e.target.value)}
              placeholder="https://..."
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Texto alternativo</Label>
            <Input
              value={config.alt || ""}
              onChange={(e) => updateConfig("alt", e.target.value)}
              placeholder="Descrição da imagem"
              className="text-sm"
            />
          </div>
        </div>
      )}

      {block.type === "guarantee" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Título</Label>
            <Input
              value={config.text || ""}
              onChange={(e) => updateConfig("text", e.target.value)}
              placeholder="7 dias de garantia"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Subtítulo</Label>
            <Input
              value={config.subtext || ""}
              onChange={(e) => updateConfig("subtext", e.target.value)}
              placeholder="Seu dinheiro de volta..."
              className="text-sm"
            />
          </div>
        </div>
      )}

      {block.type === "benefits" && (
        <div className="space-y-3">
          <Label className="text-xs">Benefícios (um por linha)</Label>
          <Textarea
            value={(config.items || []).join("\n")}
            onChange={(e) => updateConfig("items", e.target.value.split("\n").filter(Boolean))}
            placeholder={"Acesso imediato\nSuporte 24h\nAtualizações gratuitas"}
            rows={4}
            className="text-sm"
          />
        </div>
      )}

      {block.type === "testimonials" && (
        <div className="space-y-3">
          <Label className="text-xs">Depoimentos</Label>
          {(config.items || []).map((item: any, i: number) => (
            <div key={i} className="space-y-2 p-2.5 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted-foreground">#{i + 1}</span>
                <button
                  onClick={() => {
                    const items = [...(config.items || [])];
                    items.splice(i, 1);
                    updateConfig("items", items);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <Input
                value={item.name || ""}
                onChange={(e) => {
                  const items = [...(config.items || [])];
                  items[i] = { ...items[i], name: e.target.value };
                  updateConfig("items", items);
                }}
                placeholder="Nome do cliente"
                className="text-xs"
              />
              <Textarea
                value={item.text || ""}
                onChange={(e) => {
                  const items = [...(config.items || [])];
                  items[i] = { ...items[i], text: e.target.value };
                  updateConfig("items", items);
                }}
                placeholder="Depoimento..."
                rows={2}
                className="text-xs"
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const items = [...(config.items || [])];
              items.push({ name: "", text: "", rating: 5 });
              updateConfig("items", items);
            }}
            className="w-full gap-1.5 text-xs"
          >
            <Plus className="h-3 w-3" /> Adicionar depoimento
          </Button>
        </div>
      )}
    </div>
  );
}

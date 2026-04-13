import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Eye, Save, Globe, Copy, ExternalLink,
  EyeOff, Palette, CreditCard, Code, Sparkles, LayoutGrid
} from "lucide-react";
import type { Product } from "@/hooks/useProducts";
import { useOffersByProduct, type Offer } from "@/hooks/useOffers";
import { useCheckoutPageByOffer, useUpsertCheckoutPage } from "@/hooks/useCheckoutPages";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";
import { DraggableBlock } from "@/components/checkout/blocks/DraggableBlock";
import { DropZone } from "@/components/checkout/blocks/DropZone";
import { BlockConfigPanel } from "@/components/checkout/blocks/BlockConfigPanel";
import {
  BLOCK_DEFINITIONS, DROP_ZONES, DEFAULT_BLOCKS_LAYOUT,
  getDefaultConfig,
  type BlockType, type BlocksLayout, type DropZoneId, type PlacedBlock,
} from "@/components/checkout/blocks/types";

function generateSlug(offerName: string): string {
  return offerName
    .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    + "-" + Math.random().toString(36).substring(2, 8);
}

interface FormState {
  headline: string;
  subheadline: string;
  description: string;
  cta_text: string;
  primary_color: string;
  bg_color: string;
  accent_color: string;
  image_url: string;
  logo_url: string;
  show_guarantee: boolean;
  guarantee_text: string;
  fb_pixel_id: string;
  ga_tracking_id: string;
  gtm_id: string;
  custom_scripts: string;
  is_published: boolean;
}

const defaultForm: FormState = {
  headline: "Adquira agora",
  subheadline: "",
  description: "",
  cta_text: "Comprar agora",
  primary_color: "#3366FF",
  bg_color: "#FFFFFF",
  accent_color: "#0ACF83",
  image_url: "",
  logo_url: "",
  show_guarantee: false,
  guarantee_text: "7 dias de garantia",
  fb_pixel_id: "",
  ga_tracking_id: "",
  gtm_id: "",
  custom_scripts: "",
  is_published: false,
};

interface Props {
  product: Product;
}

const colorPresets = [
  { primary: "#3366FF", bg: "#FFFFFF", accent: "#0ACF83", label: "Azul" },
  { primary: "#10B981", bg: "#FFFFFF", accent: "#3366FF", label: "Verde" },
  { primary: "#8B5CF6", bg: "#FFFFFF", accent: "#EC4899", label: "Roxo" },
  { primary: "#F59E0B", bg: "#1A1A2E", accent: "#F59E0B", label: "Gold" },
  { primary: "#EF4444", bg: "#FFFFFF", accent: "#F97316", label: "Vermelho" },
  { primary: "#06B6D4", bg: "#0F172A", accent: "#22D3EE", label: "Cyan" },
  { primary: "#EC4899", bg: "#FFFFFF", accent: "#A855F7", label: "Rosa" },
  { primary: "#F97316", bg: "#FFFFFF", accent: "#EAB308", label: "Laranja" },
];

function OfferCheckoutEditor({ offer }: { offer: Offer }) {
  const { data: existingPage, isLoading: pageLoading } = useCheckoutPageByOffer(offer.id);
  const upsert = useUpsertCheckoutPage();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [slug, setSlug] = useState("");
  const [blocksLayout, setBlocksLayout] = useState<BlocksLayout>(DEFAULT_BLOCKS_LAYOUT);
  const [editorTab, setEditorTab] = useState<"blocks" | "design" | "tracking">("blocks");
  const [selectedBlock, setSelectedBlock] = useState<{ zoneId: DropZoneId; index: number } | null>(null);
  const [activeDragType, setActiveDragType] = useState<BlockType | null>(null);

  useEffect(() => {
    if (existingPage) {
      setForm({
        headline: existingPage.headline,
        subheadline: existingPage.subheadline ?? "",
        description: existingPage.description ?? "",
        cta_text: existingPage.cta_text,
        primary_color: existingPage.primary_color,
        bg_color: existingPage.bg_color,
        accent_color: existingPage.accent_color ?? "#0ACF83",
        image_url: existingPage.image_url ?? "",
        logo_url: existingPage.logo_url ?? "",
        show_guarantee: existingPage.show_guarantee,
        guarantee_text: existingPage.guarantee_text ?? "7 dias de garantia",
        fb_pixel_id: existingPage.fb_pixel_id ?? "",
        ga_tracking_id: existingPage.ga_tracking_id ?? "",
        gtm_id: existingPage.gtm_id ?? "",
        custom_scripts: existingPage.custom_scripts ?? "",
        is_published: existingPage.is_published,
      });
      setSlug(existingPage.slug);
      // Load blocks layout
      const saved = (existingPage as any).blocks_layout;
      if (saved && typeof saved === "object") {
        setBlocksLayout({ ...DEFAULT_BLOCKS_LAYOUT, ...saved });
      }
    } else {
      setForm(defaultForm);
      setSlug(generateSlug(offer.name));
      setBlocksLayout(DEFAULT_BLOCKS_LAYOUT);
    }
  }, [existingPage, offer.name]);

  const update = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({
        id: existingPage?.id,
        offer_id: offer.id,
        slug,
        template: "stripe",
        ...form,
        subheadline: form.subheadline || null,
        description: form.description || null,
        accent_color: form.accent_color || null,
        image_url: form.image_url || null,
        logo_url: form.logo_url || null,
        guarantee_text: form.guarantee_text || null,
        fb_pixel_id: form.fb_pixel_id || null,
        ga_tracking_id: form.ga_tracking_id || null,
        gtm_id: form.gtm_id || null,
        custom_scripts: form.custom_scripts || null,
        blocks_layout: blocksLayout,
      } as any);
      toast.success(existingPage ? "Checkout atualizado!" : "Checkout criado!");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar checkout");
    }
  };

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragType(active.data.current?.type as BlockType);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragType(null);

    if (!over) return;

    const dropZoneId = over.id as DropZoneId;
    const isValidZone = DROP_ZONES.some((z) => z.id === dropZoneId);
    if (!isValidZone) return;

    const blockType = active.data.current?.type as BlockType;
    const isAlreadyPlaced = active.data.current?.isPlaced;

    if (isAlreadyPlaced) {
      // Move from one zone to another (or reorder)
      const sourceId = (active.id as string).split("-").slice(1, -1).join("-") as DropZoneId;
      const sourceIndex = parseInt((active.id as string).split("-").pop()!);

      if (sourceId === dropZoneId) return; // Same zone, skip

      setBlocksLayout((prev) => {
        const next = { ...prev };
        const sourceBlocks = [...(next[sourceId] || [])];
        const [moved] = sourceBlocks.splice(sourceIndex, 1);
        next[sourceId] = sourceBlocks;
        next[dropZoneId] = [...(next[dropZoneId] || []), moved];
        return next;
      });
    } else {
      // New block from sidebar
      const newBlock: PlacedBlock = {
        type: blockType,
        config: getDefaultConfig(blockType),
      };
      setBlocksLayout((prev) => ({
        ...prev,
        [dropZoneId]: [...(prev[dropZoneId] || []), newBlock],
      }));
    }
  };

  const removeBlock = (zoneId: DropZoneId, index: number) => {
    setBlocksLayout((prev) => {
      const next = { ...prev };
      const blocks = [...(next[zoneId] || [])];
      blocks.splice(index, 1);
      next[zoneId] = blocks;
      return next;
    });
    if (selectedBlock?.zoneId === zoneId && selectedBlock?.index === index) {
      setSelectedBlock(null);
    }
  };

  const updateBlockConfig = (zoneId: DropZoneId, index: number, config: Record<string, any>) => {
    setBlocksLayout((prev) => {
      const next = { ...prev };
      const blocks = [...(next[zoneId] || [])];
      blocks[index] = { ...blocks[index], config };
      next[zoneId] = blocks;
      return next;
    });
  };

  // Count placed blocks of each type
  const placedTypes = new Set<BlockType>();
  Object.values(blocksLayout).forEach((blocks) => blocks.forEach((b) => placedTypes.add(b.type)));

  const checkoutUrl = `${window.location.origin}/${slug}`;
  const copyUrl = () => { navigator.clipboard.writeText(checkoutUrl); toast.success("Link copiado!"); };

  if (pageLoading) return <Skeleton className="h-64 w-full" />;

  const selectedBlockData = selectedBlock
    ? blocksLayout[selectedBlock.zoneId]?.[selectedBlock.index]
    : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
          <div className="flex items-center gap-3">
            <Badge variant={form.is_published ? "default" : "secondary"} className="gap-1.5">
              {form.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {form.is_published ? "Publicado" : "Rascunho"}
            </Badge>
            <div className="flex items-center gap-1">
              <Switch checked={form.is_published} onCheckedChange={(v) => update("is_published", v)} className="scale-90" />
              <span className="text-xs text-muted-foreground">Publicar</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {existingPage && (
              <>
                <Button variant="outline" size="sm" onClick={copyUrl} className="gap-1.5 text-xs">
                  <Copy className="h-3 w-3" /> Copiar
                </Button>
                <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                  <a href={checkoutUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /> Testar</a>
                </Button>
              </>
            )}
            <Button onClick={handleSave} size="sm" disabled={upsert.isPending} className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              {upsert.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          {/* Left: Editor */}
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex rounded-lg border bg-muted/30 p-1 gap-1">
              {([
                { id: "blocks" as const, label: "Blocos", icon: LayoutGrid },
                { id: "design" as const, label: "Design", icon: Palette },
                { id: "tracking" as const, label: "Tracking", icon: Code },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEditorTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                    editorTab === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {editorTab === "blocks" && (
              <div className="space-y-4">
                {/* Slug */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Slug (URL)</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="text-sm font-mono" />
                  <p className="text-[10px] text-muted-foreground">/{slug}</p>
                </div>

                {/* Headline + CTA */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Título</Label>
                    <Input value={form.headline} onChange={(e) => update("headline", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subtítulo</Label>
                    <Input value={form.subheadline} onChange={(e) => update("subheadline", e.target.value)} placeholder="Opcional" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Texto do botão</Label>
                    <Input value={form.cta_text} onChange={(e) => update("cta_text", e.target.value)} />
                  </div>
                </div>

                <Separator />

                {/* Available blocks */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Blocos disponíveis
                  </p>
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Arraste os blocos para as áreas do checkout à direita
                  </p>
                  <div className="space-y-1.5">
                    {BLOCK_DEFINITIONS.map((def) => (
                      <DraggableBlock
                        key={def.type}
                        id={`sidebar-${def.type}`}
                        type={def.type}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Drop zones management */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Áreas do checkout
                  </p>
                  <div className="space-y-2">
                    {DROP_ZONES.map((zone) => (
                      <div key={zone.id}>
                        <p className="text-[10px] font-medium text-muted-foreground mb-1">{zone.label}</p>
                        <DropZone
                          id={zone.id}
                          label={zone.label}
                          blocks={blocksLayout[zone.id] || []}
                          onRemoveBlock={(i) => removeBlock(zone.id, i)}
                          onSelectBlock={(zId, i) => setSelectedBlock({ zoneId: zId, index: i })}
                          selectedBlock={selectedBlock}
                          isCompact
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Block config panel */}
                {selectedBlockData && selectedBlock && (
                  <>
                    <Separator />
                    <BlockConfigPanel
                      block={selectedBlockData}
                      onChange={(config) => updateBlockConfig(selectedBlock.zoneId, selectedBlock.index, config)}
                    />
                  </>
                )}
              </div>
            )}

            {editorTab === "design" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs flex items-center gap-2">
                      <Palette className="h-3.5 w-3.5 text-primary" /> Cores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 pb-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Cor principal</Label>
                      <div className="flex gap-2">
                        <input type="color" value={form.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="h-9 w-12 rounded-lg border cursor-pointer bg-transparent" />
                        <Input value={form.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="font-mono text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Cor de fundo</Label>
                      <p className="text-[10px] text-muted-foreground -mt-1">Afeta o fundo do resumo</p>
                      <div className="flex gap-2">
                        <input type="color" value={form.bg_color} onChange={(e) => update("bg_color", e.target.value)} className="h-9 w-12 rounded-lg border cursor-pointer bg-transparent" />
                        <Input value={form.bg_color} onChange={(e) => update("bg_color", e.target.value)} className="font-mono text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Cor de destaque</Label>
                      <p className="text-[10px] text-muted-foreground -mt-1">Total, cupons e selos</p>
                      <div className="flex gap-2">
                        <input type="color" value={form.accent_color || "#0ACF83"} onChange={(e) => update("accent_color", e.target.value)} className="h-9 w-12 rounded-lg border cursor-pointer bg-transparent" />
                        <Input value={form.accent_color} onChange={(e) => update("accent_color", e.target.value)} placeholder="#0ACF83" className="font-mono text-sm" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Presets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="grid grid-cols-4 gap-2">
                      {colorPresets.map((preset) => {
                        const isActive = form.primary_color === preset.primary && form.bg_color === preset.bg;
                        return (
                          <button
                            key={preset.label}
                            onClick={() => { update("primary_color", preset.primary); update("bg_color", preset.bg); update("accent_color", preset.accent); }}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-colors ${isActive ? "border-primary bg-primary/5" : "hover:border-primary/30"}`}
                          >
                            <div className="flex gap-0.5">
                              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                              <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: preset.bg }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground">{preset.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {editorTab === "tracking" && (
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Facebook Pixel ID</Label>
                    <Input value={form.fb_pixel_id} onChange={(e) => update("fb_pixel_id", e.target.value)} placeholder="123456789012345" className="font-mono text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Google Analytics (GA4)</Label>
                    <Input value={form.ga_tracking_id} onChange={(e) => update("ga_tracking_id", e.target.value)} placeholder="G-XXXXXXXXXX" className="font-mono text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Google Tag Manager</Label>
                    <Input value={form.gtm_id} onChange={(e) => update("gtm_id", e.target.value)} placeholder="GTM-XXXXXXX" className="font-mono text-sm" />
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <Label className="text-xs">Scripts personalizados</Label>
                    <Textarea value={form.custom_scripts} onChange={(e) => update("custom_scripts", e.target.value)} placeholder="<script>...</script>" rows={4} className="font-mono text-xs" />
                    <p className="text-[10px] text-muted-foreground">Inserido no &lt;head&gt;</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Preview */}
          <Card className="sticky top-4 overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" /> Pré-visualização
              </CardTitle>
              {existingPage && (
                <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                  <a href={checkoutUrl} target="_blank" rel="noreferrer"><Globe className="h-3 w-3" /> Abrir</a>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                <CheckoutPreview
                  template="stripe"
                  headline={form.headline}
                  subheadline={form.subheadline}
                  description={form.description}
                  ctaText={form.cta_text}
                  primaryColor={form.primary_color}
                  bgColor={form.bg_color}
                  accentColor={form.accent_color}
                  imageUrl={form.image_url}
                  logoUrl={form.logo_url}
                  showGuarantee={form.show_guarantee}
                  guaranteeText={form.guarantee_text}
                  offerName={offer.name}
                  priceCents={offer.price_cents}
                  billingType={offer.billing_type}
                  blocksLayout={blocksLayout}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDragType && (
          <div className="bg-background border border-primary/50 rounded-lg p-2.5 shadow-xl opacity-90">
            <p className="text-xs font-medium">
              {BLOCK_DEFINITIONS.find((b) => b.type === activeDragType)?.label}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export function ProductCheckoutTab({ product }: Props) {
  const { data: offers, isLoading } = useOffersByProduct(product.id);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  useEffect(() => {
    if (offers?.length && !selectedOfferId) {
      setSelectedOfferId(offers[0].id);
    }
  }, [offers, selectedOfferId]);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  if (!offers?.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <CardTitle className="text-lg mb-2">Crie uma oferta primeiro</CardTitle>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            O checkout é criado automaticamente para cada oferta. Vá na aba "Geral" e crie uma oferta.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedOffer = offers.find((o) => o.id === selectedOfferId) ?? offers[0];

  return (
    <div className="space-y-4">
      {offers.length > 1 && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Oferta</Label>
          <Select value={selectedOffer.id} onValueChange={setSelectedOfferId}>
            <SelectTrigger className="w-full max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {offers.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name} — {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(o.price_cents / 100)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <OfferCheckoutEditor key={selectedOffer.id} offer={selectedOffer} />
    </div>
  );
}

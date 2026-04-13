import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Eye, Save, Globe, Copy, ExternalLink, GripVertical,
  Type, Image, Shield, List, MessageSquare, ChevronUp, ChevronDown,
  EyeOff, Palette, CreditCard, Code
} from "lucide-react";
import type { Product } from "@/hooks/useProducts";
import { useOffersByProduct, type Offer } from "@/hooks/useOffers";
import { useCheckoutPageByOffer, useUpsertCheckoutPage } from "@/hooks/useCheckoutPages";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";

function generateSlug(offerName: string): string {
  return offerName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Math.random().toString(36).substring(2, 8);
}

interface CheckoutBlock {
  id: string;
  type: "header" | "image" | "benefits" | "guarantee" | "testimonial" | "form";
  label: string;
  icon: any;
  enabled: boolean;
}

const defaultBlocks: CheckoutBlock[] = [
  { id: "header", type: "header", label: "Título e Subtítulo", icon: Type, enabled: true },
  { id: "image", type: "image", label: "Imagem do Produto", icon: Image, enabled: false },
  { id: "benefits", type: "benefits", label: "Lista de Benefícios", icon: List, enabled: true },
  { id: "guarantee", type: "guarantee", label: "Selo de Garantia", icon: Shield, enabled: false },
  { id: "testimonial", type: "testimonial", label: "Depoimentos", icon: MessageSquare, enabled: false },
  { id: "form", type: "form", label: "Formulário de Pagamento", icon: CreditCard, enabled: true },
];

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
  accent_color: "",
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

function BlockItem({
  block,
  onToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isSelected,
  onClick,
}: {
  block: CheckoutBlock;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = block.icon;
  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:border-primary/30 hover:bg-muted/30"
      } ${!block.enabled ? "opacity-50" : ""}`}
    >
      <div className="flex flex-col gap-0.5">
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={isFirst}
          className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={isLast}
          className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>
      <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{block.label}</p>
      </div>
      <Switch
        checked={block.enabled}
        onCheckedChange={(e) => { onToggle(); }}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      />
    </div>
  );
}

function OfferCheckoutEditor({ offer }: { offer: Offer }) {
  const { data: existingPage, isLoading: pageLoading } = useCheckoutPageByOffer(offer.id);
  const upsert = useUpsertCheckoutPage();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [slug, setSlug] = useState("");
  const [blocks, setBlocks] = useState<CheckoutBlock[]>(defaultBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>("header");
  const [editorTab, setEditorTab] = useState<"blocks" | "design" | "tracking">("blocks");

  useEffect(() => {
    if (existingPage) {
      setForm({
        headline: existingPage.headline,
        subheadline: existingPage.subheadline ?? "",
        description: existingPage.description ?? "",
        cta_text: existingPage.cta_text,
        primary_color: existingPage.primary_color,
        bg_color: existingPage.bg_color,
        accent_color: existingPage.accent_color ?? "",
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
    } else {
      setForm(defaultForm);
      setSlug(generateSlug(offer.name));
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
      } as any);
      toast.success(existingPage ? "Checkout atualizado!" : "Checkout criado!");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar checkout");
    }
  };

  const toggleBlock = (id: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)));
    // Sync guarantee
    if (id === "guarantee") {
      update("show_guarantee", !blocks.find((b) => b.id === "guarantee")?.enabled);
    }
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const checkoutUrl = `${window.location.origin}/${slug}`;
  const copyUrl = () => {
    navigator.clipboard.writeText(checkoutUrl);
    toast.success("Link copiado!");
  };

  if (pageLoading) return <Skeleton className="h-64 w-full" />;

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2">
        <div className="flex items-center gap-3">
          <Badge variant={form.is_published ? "default" : "secondary"} className="gap-1.5">
            {form.is_published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {form.is_published ? "Publicado" : "Rascunho"}
          </Badge>
          <div className="flex items-center gap-1">
            <Switch
              checked={form.is_published}
              onCheckedChange={(v) => update("is_published", v)}
              className="scale-90"
            />
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
                <a href={checkoutUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3 w-3" /> Testar
                </a>
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
          {/* Editor tabs */}
          <div className="flex rounded-lg border bg-muted/30 p-1 gap-1">
            {[
              { id: "blocks" as const, label: "Blocos", icon: List },
              { id: "design" as const, label: "Design", icon: Palette },
              { id: "tracking" as const, label: "Tracking", icon: Code },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setEditorTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                  editorTab === tab.id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
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

              {/* Blocks list */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Seções do Checkout</p>
                <div className="space-y-2">
                  {blocks.map((block, i) => (
                    <BlockItem
                      key={block.id}
                      block={block}
                      onToggle={() => toggleBlock(block.id)}
                      onMoveUp={() => moveBlock(block.id, -1)}
                      onMoveDown={() => moveBlock(block.id, 1)}
                      isFirst={i === 0}
                      isLast={i === blocks.length - 1}
                      isSelected={selectedBlockId === block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Block settings */}
              {selectedBlock && (
                <Card className="border-primary/20">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <selectedBlock.icon className="h-4 w-4 text-primary" />
                      {selectedBlock.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-4 pb-4">
                    {selectedBlock.type === "header" && (
                      <>
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
                      </>
                    )}
                    {selectedBlock.type === "image" && (
                      <>
                        <div className="space-y-1.5">
                          <Label className="text-xs">URL da imagem</Label>
                          <Input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://..." />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs">URL do logo</Label>
                          <Input value={form.logo_url} onChange={(e) => update("logo_url", e.target.value)} placeholder="https://..." />
                        </div>
                      </>
                    )}
                    {selectedBlock.type === "benefits" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Descrição / Benefícios</Label>
                        <Textarea
                          value={form.description}
                          onChange={(e) => update("description", e.target.value)}
                          placeholder="Liste os benefícios do produto..."
                          rows={4}
                        />
                      </div>
                    )}
                    {selectedBlock.type === "guarantee" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Texto da garantia</Label>
                        <Input value={form.guarantee_text} onChange={(e) => update("guarantee_text", e.target.value)} />
                      </div>
                    )}
                    {selectedBlock.type === "form" && (
                      <p className="text-xs text-muted-foreground">
                        O formulário de pagamento é gerado automaticamente com os campos de nome, email, WhatsApp, CPF e forma de pagamento.
                      </p>
                    )}
                    {selectedBlock.type === "testimonial" && (
                      <p className="text-xs text-muted-foreground">
                        Em breve: adicione depoimentos de clientes ao seu checkout.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {editorTab === "design" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Cor principal</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="h-9 w-12 rounded-lg border cursor-pointer bg-transparent" />
                      <Input value={form.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cor de fundo</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.bg_color} onChange={(e) => update("bg_color", e.target.value)} className="h-9 w-12 rounded-lg border cursor-pointer bg-transparent" />
                      <Input value={form.bg_color} onChange={(e) => update("bg_color", e.target.value)} className="font-mono text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Cor de destaque</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.accent_color || "#0ACF83"} onChange={(e) => update("accent_color", e.target.value)} className="h-9 w-12 rounded-lg border cursor-pointer bg-transparent" />
                      <Input value={form.accent_color} onChange={(e) => update("accent_color", e.target.value)} placeholder="#0ACF83" className="font-mono text-sm" />
                    </div>
                  </div>

                  {/* Quick presets */}
                  <div className="space-y-2">
                    <Label className="text-xs">Presets</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { primary: "#3366FF", bg: "#FFFFFF", label: "Azul" },
                        { primary: "#10B981", bg: "#FFFFFF", label: "Verde" },
                        { primary: "#8B5CF6", bg: "#FFFFFF", label: "Roxo" },
                        { primary: "#F59E0B", bg: "#1A1A2E", label: "Gold" },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            update("primary_color", preset.primary);
                            update("bg_color", preset.bg);
                          }}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-lg border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex gap-0.5">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: preset.bg }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {editorTab === "tracking" && (
            <div className="space-y-4">
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
                    <p className="text-[10px] text-muted-foreground">Inserido no &lt;head&gt; da página</p>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                <a href={checkoutUrl} target="_blank" rel="noreferrer">
                  <Globe className="h-3 w-3" /> Abrir
                </a>
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
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
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

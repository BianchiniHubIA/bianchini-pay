import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Palette, Type, Image, Code, Eye, Save, ArrowLeft, Globe, Copy, Shield, Plus, BookmarkPlus, Trash2,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useOffersByProduct, type Offer } from "@/hooks/useOffers";
import { useCheckoutPageByOffer, useUpsertCheckoutPage, type CheckoutPage } from "@/hooks/useCheckoutPages";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";
import { OrderBumpsSection } from "@/components/checkout/OrderBumpsSection";
import { TemplateCard } from "@/components/checkout/TemplateCard";
import { CHECKOUT_TEMPLATES, getTemplateById } from "@/data/checkoutTemplates";

const TEMPLATE_OPTIONS = CHECKOUT_TEMPLATES.map((t) => ({ id: t.id, name: t.name, desc: t.description }));

function generateSlug(offerName: string): string {
  return offerName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Math.random().toString(36).substring(2, 8);
}

interface FormState {
  template: string;
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
  template: "classic",
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

interface Preset {
  id: string;
  name: string;
  form: FormState;
}

function loadPresets(): Preset[] {
  try {
    return JSON.parse(localStorage.getItem("checkout-presets") ?? "[]");
  } catch {
    return [];
  }
}

function savePresets(presets: Preset[]) {
  localStorage.setItem("checkout-presets", JSON.stringify(presets));
}

// Demo preview data
const DEMO_OFFER = { name: "Produto Exemplo", price_cents: 9900, billing_type: "one_time" };

export default function PageBuilder() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const { data: offers } = useOffersByProduct(selectedProductId);
  const { data: existingPage, isLoading: pageLoading } = useCheckoutPageByOffer(selectedOffer?.id ?? null);
  const upsert = useUpsertCheckoutPage();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [slug, setSlug] = useState("");

  // Presets
  const [presets, setPresets] = useState<Preset[]>(loadPresets);
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (existingPage) {
      setForm({
        template: existingPage.template,
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
    } else if (selectedOffer) {
      // Apply selected template defaults if one was chosen
      const tmpl = previewTemplate ? getTemplateById(previewTemplate) : null;
      if (tmpl) {
        const d = tmpl.form_defaults;
        setForm({
          ...defaultForm,
          template: d.template,
          headline: d.headline,
          subheadline: d.subheadline,
          description: d.description,
          cta_text: d.cta_text,
          primary_color: d.primary_color,
          bg_color: d.bg_color,
          accent_color: d.accent_color,
          show_guarantee: d.show_guarantee,
          guarantee_text: d.guarantee_text,
        });
      } else {
        setForm(defaultForm);
      }
      setSlug(generateSlug(selectedOffer.name));
    }
  }, [existingPage, selectedOffer]);

  const update = (key: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!selectedOffer) return;
    try {
      await upsert.mutateAsync({
        id: existingPage?.id,
        offer_id: selectedOffer.id,
        slug,
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
      toast.success(existingPage ? "Página atualizada!" : "Página criada!");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const newPreset: Preset = {
      id: crypto.randomUUID(),
      name: presetName.trim(),
      form: { ...form },
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    savePresets(updated);
    setPresetName("");
    setPresetDialogOpen(false);
    toast.success("Predefinição salva!");
  };

  const handleApplyPreset = (preset: Preset) => {
    setForm({ ...preset.form });
    toast.success(`Predefinição "${preset.name}" aplicada!`);
  };

  const handleDeletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    savePresets(updated);
    toast.success("Predefinição removida!");
  };

  const checkoutUrl = `${window.location.origin}/checkout/${slug}`;
  const copyUrl = () => {
    navigator.clipboard.writeText(checkoutUrl);
    toast.success("Link copiado!");
  };

  // Step 1: Select product and offer
  if (!selectedOffer) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold">Page Builder</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Crie e personalize páginas de checkout para suas ofertas
            </p>
          </div>
        </div>

        {/* Template Previews */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 pt-5 pb-3">
            <h2 className="font-heading font-semibold">Templates</h2>
            <div className="w-12 h-0.5 bg-primary mt-1 rounded-full" />
            <p className="text-xs text-muted-foreground mt-2">Escolha um template como base para sua página de checkout</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 px-6 pb-6">
            {CHECKOUT_TEMPLATES.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                selected={previewTemplate === t.id}
                onClick={() => setPreviewTemplate(previewTemplate === t.id ? null : t.id)}
              />
            ))}
          </div>
          {previewTemplate && (() => {
            const tmpl = getTemplateById(previewTemplate);
            if (!tmpl) return null;
            const d = tmpl.form_defaults;
            return (
              <div className="border-t border-border p-4">
                <div className="rounded-xl overflow-hidden border border-border max-w-2xl mx-auto">
                  <CheckoutPreview
                    template={d.template}
                    headline={d.headline}
                    subheadline={d.subheadline}
                    description={d.description}
                    ctaText={d.cta_text}
                    primaryColor={d.primary_color}
                    bgColor={d.bg_color}
                    accentColor={d.accent_color}
                    imageUrl=""
                    logoUrl=""
                    showGuarantee={d.show_guarantee}
                    guaranteeText={d.guarantee_text}
                    offerName={DEMO_OFFER.name}
                    priceCents={DEMO_OFFER.price_cents}
                    billingType={DEMO_OFFER.billing_type}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Presets */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 pt-5 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-heading font-semibold">Minhas Predefinições</h2>
              <div className="w-12 h-0.5 bg-primary mt-1 rounded-full" />
            </div>
          </div>
          {presets.length === 0 ? (
            <div className="px-6 pb-6 text-sm text-muted-foreground">
              Nenhuma predefinição salva. Crie uma ao editar uma página de checkout.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 pb-6">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="rounded-xl border border-border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-heading font-semibold text-sm">{preset.name}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDeletePreset(preset.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-border" style={{ maxHeight: 160, overflow: "hidden" }}>
                    <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}>
                      <CheckoutPreview
                        template={preset.form.template}
                        headline={preset.form.headline}
                        subheadline={preset.form.subheadline}
                        description={preset.form.description}
                        ctaText={preset.form.cta_text}
                        primaryColor={preset.form.primary_color}
                        bgColor={preset.form.bg_color}
                        accentColor={preset.form.accent_color}
                        imageUrl={preset.form.image_url}
                        logoUrl={preset.form.logo_url}
                        showGuarantee={preset.form.show_guarantee}
                        guaranteeText={preset.form.guarantee_text}
                        offerName="Produto"
                        priceCents={9900}
                        billingType="one_time"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Template: {TEMPLATE_OPTIONS.find((t) => t.id === preset.form.template)?.name ?? preset.form.template}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products */}
        {productsLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : !products?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Palette className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="font-heading text-lg mb-2">Crie um produto primeiro</CardTitle>
              <p className="text-muted-foreground text-sm">
                Você precisa de pelo menos um produto com uma oferta para criar uma página de checkout.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h2 className="font-heading font-semibold mb-4">Selecione um produto e oferta</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-colors hover:border-primary/50 ${
                    selectedProductId === product.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedProductId(product.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="font-heading text-base">{product.name}</CardTitle>
                    <CardDescription className="text-xs">{product.description ?? "Sem descrição"}</CardDescription>
                  </CardHeader>
                  {selectedProductId === product.id && offers && (
                    <CardContent className="space-y-2">
                      {!offers.length ? (
                        <p className="text-xs text-muted-foreground">Nenhuma oferta neste produto.</p>
                      ) : (
                        offers.map((offer) => (
                          <Button
                            key={offer.id}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOffer(offer);
                            }}
                          >
                            {offer.name} —{" "}
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                              offer.price_cents / 100
                            )}
                          </Button>
                        ))
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Page Builder editor
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedOffer(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold">Page Builder</h1>
            <p className="text-muted-foreground text-sm">Oferta: {selectedOffer.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Apply preset */}
          {presets.length > 0 && (
            <Select onValueChange={(id) => {
              const p = presets.find((x) => x.id === id);
              if (p) handleApplyPreset(p);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Usar predefinição" />
              </SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" onClick={() => setPresetDialogOpen(true)} className="gap-1">
            <BookmarkPlus className="h-4 w-4" /> Salvar predefinição
          </Button>
          {existingPage && (
            <>
              <Badge variant={form.is_published ? "default" : "secondary"}>
                {form.is_published ? "Publicada" : "Rascunho"}
              </Badge>
              <Button variant="outline" size="sm" onClick={copyUrl}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Copiar link
              </Button>
            </>
          )}
          <Button onClick={handleSave} disabled={upsert.isPending}>
            <Save className="h-4 w-4 mr-1" />
            {upsert.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {pageLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Editor */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="content">
              <TabsList className="w-full">
                <TabsTrigger value="content" className="flex-1">
                  <Type className="h-3.5 w-3.5 mr-1" /> Conteúdo
                </TabsTrigger>
                <TabsTrigger value="design" className="flex-1">
                  <Palette className="h-3.5 w-3.5 mr-1" /> Design
                </TabsTrigger>
                <TabsTrigger value="tracking" className="flex-1">
                  <Code className="h-3.5 w-3.5 mr-1" /> Tracking
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={form.template} onValueChange={(v) => update("template", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_OPTIONS.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name} — {t.desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                  <p className="text-xs text-muted-foreground">/checkout/{slug}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Título principal</Label>
                  <Input value={form.headline} onChange={(e) => update("headline", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input value={form.subheadline} onChange={(e) => update("subheadline", e.target.value)} placeholder="Opcional" />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Descreva o produto..." rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Texto do botão (CTA)</Label>
                  <Input value={form.cta_text} onChange={(e) => update("cta_text", e.target.value)} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Selo de garantia</Label>
                    <p className="text-xs text-muted-foreground">Mostra badge de garantia</p>
                  </div>
                  <Switch checked={form.show_guarantee} onCheckedChange={(v) => update("show_guarantee", v)} />
                </div>

                {form.show_guarantee && (
                  <div className="space-y-2">
                    <Label>Texto da garantia</Label>
                    <Input value={form.guarantee_text} onChange={(e) => update("guarantee_text", e.target.value)} />
                  </div>
                )}

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Publicar página</Label>
                    <p className="text-xs text-muted-foreground">Torna acessível via link público</p>
                  </div>
                  <Switch checked={form.is_published} onCheckedChange={(v) => update("is_published", v)} />
                </div>
              </TabsContent>

              <TabsContent value="design" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Cor principal</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="h-10 w-12 rounded border cursor-pointer" />
                    <Input value={form.primary_color} onChange={(e) => update("primary_color", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cor de fundo</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.bg_color} onChange={(e) => update("bg_color", e.target.value)} className="h-10 w-12 rounded border cursor-pointer" />
                    <Input value={form.bg_color} onChange={(e) => update("bg_color", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cor de destaque (opcional)</Label>
                  <div className="flex gap-2">
                    <input type="color" value={form.accent_color || "#FF6B35"} onChange={(e) => update("accent_color", e.target.value)} className="h-10 w-12 rounded border cursor-pointer" />
                    <Input value={form.accent_color} onChange={(e) => update("accent_color", e.target.value)} placeholder="#FF6B35" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>URL da imagem do produto</Label>
                  <Input value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://..." />
                </div>

                <div className="space-y-2">
                  <Label>URL do logo</Label>
                  <Input value={form.logo_url} onChange={(e) => update("logo_url", e.target.value)} placeholder="https://..." />
                </div>
              </TabsContent>

              <TabsContent value="tracking" className="space-y-4 mt-4">
                <Card className="border-dashed">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Configure seus pixels de rastreamento para acompanhar conversões e tráfego.
                    </p>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Label>Facebook Pixel ID</Label>
                  <Input value={form.fb_pixel_id} onChange={(e) => update("fb_pixel_id", e.target.value)} placeholder="123456789012345" />
                </div>

                <div className="space-y-2">
                  <Label>Google Analytics (GA4 Measurement ID)</Label>
                  <Input value={form.ga_tracking_id} onChange={(e) => update("ga_tracking_id", e.target.value)} placeholder="G-XXXXXXXXXX" />
                </div>

                <div className="space-y-2">
                  <Label>Google Tag Manager ID</Label>
                  <Input value={form.gtm_id} onChange={(e) => update("gtm_id", e.target.value)} placeholder="GTM-XXXXXXX" />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Scripts personalizados</Label>
                  <Textarea value={form.custom_scripts} onChange={(e) => update("custom_scripts", e.target.value)} placeholder="<script>...</script>" rows={4} className="font-mono text-xs" />
                  <p className="text-xs text-muted-foreground">
                    Inserido no &lt;head&gt; da página de checkout. Use com cautela.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            <OrderBumpsSection
              checkoutPageId={existingPage?.id ?? null}
              offers={offers ?? []}
              currentOfferId={selectedOffer.id}
            />
          </div>

          {/* Preview */}
          <div className="lg:col-span-3">
            <Card className="sticky top-6">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Pré-visualização
                  </CardTitle>
                  {existingPage && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={checkoutUrl} target="_blank" rel="noreferrer">
                        <Globe className="h-3.5 w-3.5 mr-1" /> Abrir
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-lg">
                <div className="border-t">
                  <CheckoutPreview
                    template={form.template}
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
                    offerName={selectedOffer.name}
                    priceCents={selectedOffer.price_cents}
                    billingType={selectedOffer.billing_type}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Save Preset Dialog */}
      <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Salvar Predefinição</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Nome da predefinição</Label>
            <Input
              placeholder="Ex: Checkout Dark Premium"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPresetDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSavePreset} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

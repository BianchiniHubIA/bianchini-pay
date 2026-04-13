import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import { Palette, Type, Code, Eye, Save, Globe, Copy, ExternalLink } from "lucide-react";
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

function OfferCheckoutEditor({ offer }: { offer: Offer }) {
  const { data: existingPage, isLoading: pageLoading } = useCheckoutPageByOffer(offer.id);
  const upsert = useUpsertCheckoutPage();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [slug, setSlug] = useState("");

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

  const checkoutUrl = `${window.location.origin}/${slug}`;
  const copyUrl = () => {
    navigator.clipboard.writeText(checkoutUrl);
    toast.success("Link copiado!");
  };

  if (pageLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={form.is_published ? "default" : "secondary"}>
            {form.is_published ? "Publicado" : "Rascunho"}
          </Badge>
          {existingPage && (
            <>
              <Button variant="outline" size="sm" onClick={copyUrl}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Copiar link
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={checkoutUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Testar
                </a>
              </Button>
            </>
          )}
        </div>
        <Button onClick={handleSave} disabled={upsert.isPending}>
          <Save className="h-4 w-4 mr-1" />
          {upsert.isPending ? "Salvando..." : "Salvar Checkout"}
        </Button>
      </div>

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
                <Label>Slug (URL)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
                <p className="text-xs text-muted-foreground">/{slug}</p>
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
                  <Label>Publicar checkout</Label>
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
                  <input type="color" value={form.accent_color || "#0ACF83"} onChange={(e) => update("accent_color", e.target.value)} className="h-10 w-12 rounded border cursor-pointer" />
                  <Input value={form.accent_color} onChange={(e) => update("accent_color", e.target.value)} placeholder="#0ACF83" />
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
                    Configure seus pixels de rastreamento para acompanhar conversões.
                  </p>
                </CardContent>
              </Card>
              <div className="space-y-2">
                <Label>Facebook Pixel ID</Label>
                <Input value={form.fb_pixel_id} onChange={(e) => update("fb_pixel_id", e.target.value)} placeholder="123456789012345" />
              </div>
              <div className="space-y-2">
                <Label>Google Analytics (GA4)</Label>
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
                  Inserido no &lt;head&gt; da página de checkout.
                </p>
              </div>
            </TabsContent>
          </Tabs>
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
    </div>
  );
}

export function ProductCheckoutTab({ product }: Props) {
  const { data: offers, isLoading } = useOffersByProduct(product.id);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // Auto-select first offer
  useEffect(() => {
    if (offers?.length && !selectedOfferId) {
      setSelectedOfferId(offers[0].id);
    }
  }, [offers, selectedOfferId]);

  if (isLoading) return <Skeleton className="h-64 w-full mt-4" />;

  if (!offers?.length) {
    return (
      <div className="mt-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Eye className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="font-heading text-lg mb-2">Crie uma oferta primeiro</CardTitle>
            <p className="text-muted-foreground text-sm text-center">
              O checkout é criado automaticamente para cada oferta. Vá na aba "Geral" e crie uma oferta.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedOffer = offers.find((o) => o.id === selectedOfferId) ?? offers[0];

  return (
    <div className="space-y-4 mt-4">
      {/* Offer selector if multiple */}
      {offers.length > 1 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Oferta</Label>
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

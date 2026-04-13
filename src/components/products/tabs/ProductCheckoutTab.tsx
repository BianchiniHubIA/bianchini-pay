import { useState, useEffect } from "react";
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
  Eye, Save, Copy, ExternalLink,
  EyeOff, Code
} from "lucide-react";
import type { Product } from "@/hooks/useProducts";
import { useOffersByProduct, type Offer } from "@/hooks/useOffers";
import { useCheckoutPageByOffer, useUpsertCheckoutPage } from "@/hooks/useCheckoutPages";
import { CheckoutPreview } from "@/components/checkout/CheckoutPreview";

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
  primary_color: "#FF6A00",
  bg_color: "#1a1a1a",
  accent_color: "#FF6A00",
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
  const copyUrl = () => { navigator.clipboard.writeText(checkoutUrl); toast.success("Link copiado!"); };

  if (pageLoading) return <Skeleton className="h-64 w-full" />;

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
            <Switch checked={form.is_published} onCheckedChange={(v) => update("is_published", v)} className="scale-90" />
            <span className="text-xs text-muted-foreground">Publicar</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {existingPage && (
            <>
              <Button variant="outline" size="sm" onClick={copyUrl} className="gap-1.5 text-xs">
                <Copy className="h-3 w-3" /> Copiar link
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

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Left: Editor */}
        <div className="space-y-4">
          {/* Slug */}
          <div className="space-y-1.5">
            <Label className="text-xs">Slug (URL)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="text-sm font-mono" />
            <p className="text-[10px] text-muted-foreground">/{slug}</p>
          </div>

          {/* CTA text */}
          <div className="space-y-1.5">
            <Label className="text-xs">Texto do botão</Label>
            <Input value={form.cta_text} onChange={(e) => update("cta_text", e.target.value)} />
          </div>

          <Separator />

          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs flex items-center gap-2">
                <Code className="h-3.5 w-3.5 text-primary" /> Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
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
        </div>

        {/* Right: Preview */}
        <Card className="sticky top-4 overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" /> Pré-visualização
            </CardTitle>
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

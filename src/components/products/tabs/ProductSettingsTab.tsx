import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, CreditCard, BarChart3, Trash2, Plus } from "lucide-react";
import type { Product } from "@/hooks/useProducts";

interface Props {
  product: Product;
  onSave: (updates: Record<string, any>) => Promise<void>;
}

export function ProductSettingsTab({ product, onSave }: Props) {
  const [requireAddress, setRequireAddress] = useState(product.require_address ?? false);
  const [showCouponField, setShowCouponField] = useState(product.show_coupon_field ?? false);
  const [requireEmailConfirm, setRequireEmailConfirm] = useState(product.require_email_confirm ?? false);

  const [fbPixelId, setFbPixelId] = useState(product.fb_pixel_id ?? "");
  const [gaTrackingId, setGaTrackingId] = useState(product.ga_tracking_id ?? "");
  const [googleAdsId, setGoogleAdsId] = useState(product.google_ads_id ?? "");
  const [metaAdsId, setMetaAdsId] = useState(product.meta_ads_id ?? "");

  const [pixelTab, setPixelTab] = useState("facebook");

  const handleSave = () =>
    onSave({
      require_address: requireAddress,
      show_coupon_field: showCouponField,
      require_email_confirm: requireEmailConfirm,
      fb_pixel_id: fbPixelId || null,
      ga_tracking_id: gaTrackingId || null,
      google_ads_id: googleAdsId || null,
      meta_ads_id: metaAdsId || null,
    });

  const pixelConfigs = [
    { id: "facebook", label: "Facebook Pixel", value: fbPixelId, set: setFbPixelId, placeholder: "123456789012345", color: "text-blue-500" },
    { id: "google-ads", label: "Google Ads", value: googleAdsId, set: setGoogleAdsId, placeholder: "AW-XXXXXXXXXX", color: "text-yellow-500" },
    { id: "google-analytics", label: "Google Analytics", value: gaTrackingId, set: setGaTrackingId, placeholder: "G-XXXXXXXXXX", color: "text-orange-500" },
    { id: "meta-ads", label: "Meta Ads", value: metaAdsId, set: setMetaAdsId, placeholder: "123456789012345", color: "text-blue-600" },
  ];

  const currentPixel = pixelConfigs.find((p) => p.id === pixelTab)!;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Checkout options */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Opções de Pagamento</CardTitle>
              <CardDescription>Configure o comportamento do checkout</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[
              { label: "Confirmar e-mail", desc: "Pedir para o comprador repetir o e-mail", checked: requireEmailConfirm, onChange: setRequireEmailConfirm },
              { label: "Campo de cupom", desc: "Exibir campo de cupom de desconto no checkout", checked: showCouponField, onChange: setShowCouponField },
              { label: "Endereço", desc: "Solicitar endereço completo do comprador", checked: requireAddress, onChange: setRequireAddress },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 px-1 rounded-lg hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={item.checked} onCheckedChange={item.onChange} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pixels */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-base">Pixels de Conversão</CardTitle>
              <CardDescription>Rastreie conversões com suas plataformas de anúncios</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={pixelTab} onValueChange={setPixelTab}>
            <TabsList className="w-full justify-start bg-muted/30 p-1 rounded-lg">
              {pixelConfigs.map((p) => (
                <TabsTrigger key={p.id} value={p.id} className="text-xs gap-1.5 data-[state=active]:bg-background">
                  <span className={`h-2 w-2 rounded-full ${p.value ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                  {p.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {pixelConfigs.map((p) => (
              <TabsContent key={p.id} value={p.id} className="mt-4">
                <div className="space-y-3">
                  <Label>{p.label} ID</Label>
                  {p.value ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 rounded-lg bg-muted/30 border font-mono text-sm">{p.value}</div>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => p.set("")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={p.placeholder}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            p.set((e.target as HTMLInputElement).value);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                          if (input?.value) p.set(input.value);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end pb-4">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Salvar alterações
        </Button>
      </div>
    </div>
  );
}

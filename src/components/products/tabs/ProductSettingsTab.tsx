import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import type { Product } from "@/hooks/useProducts";

// Platform icons
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#0866FF" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
  </svg>
);

const GoogleAdsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#FBBC04" d="M3.9998 22.9291C1.7908 22.9291 0 21.1383 0 18.9293s1.7908-3.9998 3.9998-3.9998 3.9998 1.7908 3.9998 3.9998-1.7908 3.9998-3.9998 3.9998z"/>
    <path fill="#4285F4" d="M23.4641 16.9287L15.4632 3.072C14.3586 1.1587 11.9121.5028 9.9988 1.6074S7.4295 5.1585 8.5341 7.0718l8.0009 13.8567c1.1046 1.9133 3.5511 2.5679 5.4644 1.4646 1.9134-1.1046 2.568-3.5511 1.4647-5.4644z"/>
    <path fill="#34A853" d="M7.5137 4.8438L1.5645 15.1484A4.5 4.5 0 0 1 4 14.4297c2.5597-.0075 4.6248 2.1585 4.4941 4.7148l3.2168-5.5723-3.6094-6.25c-.4499-.7793-.6322-1.6394-.5878-2.4784z"/>
  </svg>
);

const GoogleAnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#F9AB00" d="M22.84 2.9982v17.9987c.0086 1.6473-1.3197 2.9897-2.967 2.9984a2.9808 2.9808 0 01-.3677-.0208c-1.528-.226-2.6477-1.5558-2.6105-3.1V3.1204c-.0369-1.5458 1.0856-2.8762 2.6157-3.1 1.6361-.1915 3.1178.9796 3.3093 2.6158.014.1201.0208.241.0202.3619z"/>
    <path fill="#E37400" d="M4.1326 18.0548c-1.6417 0-2.9726 1.331-2.9726 2.9726C1.16 22.6691 2.4909 24 4.1326 24s2.9726-1.3309 2.9726-2.9726-1.331-2.9726-2.9726-2.9726zm7.8728-9.0098c-.0171 0-.0342 0-.0513.0003-1.6495.0904-2.9293 1.474-2.891 3.1256v7.9846c0 2.167.9535 3.4825 2.3505 3.763 1.6118.3266 3.1832-.7152 3.5098-2.327.04-.1974.06-.3983.0593-.5998v-8.9585c.003-1.6474-1.33-2.9852-2.9773-2.9882z"/>
  </svg>
);

const MetaAdsIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5">
    <path fill="#0081FB" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/>
  </svg>
);

interface PixelEntry {
  id: string;
  pixelId: string;
  domain: string;
}

interface Props {
  product: Product;
  onSave: (updates: Record<string, any>) => Promise<void>;
}

export function ProductSettingsTab({ product, onSave }: Props) {
  const [requireAddress, setRequireAddress] = useState(product.require_address ?? false);
  const [showCouponField, setShowCouponField] = useState(product.show_coupon_field ?? false);
  const [requireEmailConfirm, setRequireEmailConfirm] = useState(product.require_email_confirm ?? false);

  // Pixels state (stored as JSON-like in the single fields for now)
  const [fbPixelId, setFbPixelId] = useState(product.fb_pixel_id ?? "");
  const [gaTrackingId, setGaTrackingId] = useState(product.ga_tracking_id ?? "");
  const [googleAdsId, setGoogleAdsId] = useState(product.google_ads_id ?? "");
  const [metaAdsId, setMetaAdsId] = useState(product.meta_ads_id ?? "");

  // Pixel tab
  const [pixelTab, setPixelTab] = useState("facebook");

  // Purchase event toggles
  const [purchaseOnPix, setPurchaseOnPix] = useState(true);
  const [purchaseOnBoleto, setPurchaseOnBoleto] = useState(true);
  const [pixConversionValue, setPixConversionValue] = useState("100");
  const [boletoConversionValue, setBoletoConversionValue] = useState("100");

  // New pixel input
  const [newPixelId, setNewPixelId] = useState("");

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

  const currentPixelValue = pixelTab === "facebook" ? fbPixelId : pixelTab === "google-ads" ? googleAdsId : pixelTab === "google-analytics" ? gaTrackingId : metaAdsId;
  const setCurrentPixel = (val: string) => {
    if (pixelTab === "facebook") setFbPixelId(val);
    else if (pixelTab === "google-ads") setGoogleAdsId(val);
    else if (pixelTab === "google-analytics") setGaTrackingId(val);
    else setMetaAdsId(val);
  };

  const addPixel = () => {
    if (!newPixelId.trim()) return;
    setCurrentPixel(newPixelId.trim());
    setNewPixelId("");
  };

  const pixelLabel = pixelTab === "facebook" ? "Facebook Pixel" : pixelTab === "google-ads" ? "Google Ads" : pixelTab === "google-analytics" ? "Google Analytics" : "Meta Ads";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] mt-4">
      <div className="space-y-6">
        <div>
          <h3 className="font-heading font-bold text-lg">Pagamento</h3>
          <p className="text-sm text-muted-foreground mt-1">Configure as opções do checkout</p>
        </div>

        <div className="pt-6 border-t">
          <h3 className="font-heading font-bold text-lg">Pixels de conversão</h3>
          <p className="text-sm text-muted-foreground mt-1">Aprenda mais sobre os pixels de conversão</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Checkout options */}
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="flex items-center justify-between">
              <Label>Pedir para o comprador repetir o e-mail</Label>
              <Switch checked={requireEmailConfirm} onCheckedChange={setRequireEmailConfirm} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Exibir campo de cupom de desconto</Label>
              <Switch checked={showCouponField} onCheckedChange={setShowCouponField} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Solicitar endereço do comprador</Label>
              <Switch checked={requireAddress} onCheckedChange={setRequireAddress} />
            </div>
          </CardContent>
        </Card>

        {/* Pixels - tabbed layout */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Tabs value={pixelTab} onValueChange={setPixelTab}>
              <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto gap-0">
                <TabsTrigger value="facebook" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 px-4 pb-3">
                  <FacebookIcon /> Facebook
                </TabsTrigger>
                <TabsTrigger value="google-ads" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 px-4 pb-3">
                  <GoogleAdsIcon /> Google Ads
                </TabsTrigger>
                <TabsTrigger value="google-analytics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 px-4 pb-3">
                  <GoogleAnalyticsIcon /> Google Analytics
                </TabsTrigger>
                <TabsTrigger value="meta-ads" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 px-4 pb-3">
                  <MetaAdsIcon /> Meta Ads
                </TabsTrigger>
              </TabsList>

              {["facebook", "google-ads", "google-analytics", "meta-ads"].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
                  {/* Pixel table */}
                  <Card className="bg-muted/30 border">
                    <CardContent className="pt-4 pb-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pixel Id</TableHead>
                            <TableHead>Domínio <span className="text-primary cursor-pointer text-xs ml-1">(Gerenciar)</span></TableHead>
                            <TableHead className="w-10"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentPixelValue ? (
                            <TableRow>
                              <TableCell className="font-mono text-sm">{currentPixelValue}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">—</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setCurrentPixel("")}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-4">
                                Nenhum pixel adicionado
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Add pixel */}
                  {!currentPixelValue && (
                    <div className="flex items-center gap-2">
                      <Input
                        value={newPixelId}
                        onChange={(e) => setNewPixelId(e.target.value)}
                        placeholder={`ID do ${pixelLabel}`}
                        className="max-w-xs"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Button size="sm" onClick={addPixel} disabled={!!currentPixelValue}>
                      <Plus className="h-4 w-4" /> Adicionar
                    </Button>
                    <span className="text-xs text-muted-foreground">{currentPixelValue ? 1 : 0} / 50</span>
                  </div>

                  {/* Purchase event toggles */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Switch checked={purchaseOnPix} onCheckedChange={setPurchaseOnPix} />
                        <Label>Disparar evento "Purchase" ao gerar um pix?</Label>
                      </div>
                      {purchaseOnPix && (
                        <div className="ml-12 space-y-1">
                          <p className="text-xs text-muted-foreground">Valor de conversão personalizado para pix</p>
                          <div className="flex items-center gap-2 max-w-[120px]">
                            <Input
                              value={pixConversionValue}
                              onChange={(e) => setPixConversionValue(e.target.value)}
                              className="text-center"
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Switch checked={purchaseOnBoleto} onCheckedChange={setPurchaseOnBoleto} />
                        <Label>Disparar evento "Purchase" ao gerar um boleto?</Label>
                      </div>
                      {purchaseOnBoleto && (
                        <div className="ml-12 space-y-1">
                          <p className="text-xs text-muted-foreground">Valor de conversão personalizado para boleto</p>
                          <div className="flex items-center gap-2 max-w-[120px]">
                            <Input
                              value={boletoConversionValue}
                              onChange={(e) => setBoletoConversionValue(e.target.value)}
                              className="text-center"
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}

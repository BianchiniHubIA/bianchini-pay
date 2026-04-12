import { useState } from "react";
import { usePaymentGateways, PaymentGateway } from "@/hooks/usePaymentGateways";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Star, Trash2, Settings, Shield, AlertTriangle } from "lucide-react";

const GATEWAY_PROVIDERS = [
  {
    id: "mercado_pago",
    name: "Mercado Pago",
    color: "#00B1EA",
    description: "Principal gateway de pagamentos do Brasil. Pix, cartão, boleto.",
    fields: [
      { key: "access_token", label: "Access Token", type: "password" },
      { key: "public_key", label: "Public Key", type: "text" },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    color: "#635BFF",
    description: "Pagamentos globais. Cartão de crédito, Apple Pay, Google Pay.",
    fields: [
      { key: "secret_key", label: "Secret Key", type: "password" },
      { key: "publishable_key", label: "Publishable Key", type: "text" },
      { key: "webhook_secret", label: "Webhook Secret", type: "password" },
    ],
  },
  {
    id: "pagarme",
    name: "Pagar.me",
    color: "#65A300",
    description: "Gateway brasileiro completo. Pix, cartão, boleto e marketplace.",
    fields: [
      { key: "api_key", label: "API Key", type: "password" },
      { key: "encryption_key", label: "Encryption Key", type: "password" },
    ],
  },
  {
    id: "asaas",
    name: "Asaas",
    color: "#1B6CE5",
    description: "Cobranças e pagamentos. Pix, boleto, cartão e assinaturas.",
    fields: [
      { key: "api_key", label: "API Key", type: "password" },
    ],
  },
  {
    id: "paghiper",
    name: "PagHiper",
    color: "#00A859",
    description: "Especializado em Pix e boleto com taxas competitivas.",
    fields: [
      { key: "api_key", label: "API Key", type: "password" },
      { key: "token", label: "Token", type: "password" },
    ],
  },
  {
    id: "picpay",
    name: "PicPay",
    color: "#21C25E",
    description: "Pagamentos via carteira digital PicPay e QR Code.",
    fields: [
      { key: "x_picpay_token", label: "X-PicPay-Token", type: "password" },
      { key: "x_seller_token", label: "X-Seller-Token", type: "password" },
    ],
  },
  {
    id: "paypal",
    name: "PayPal",
    color: "#003087",
    description: "Pagamentos internacionais via PayPal e cartão.",
    fields: [
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", type: "password" },
    ],
  },
  {
    id: "cielo",
    name: "Cielo",
    color: "#0066B3",
    description: "Gateway tradicional brasileiro. Cartão de crédito e débito.",
    fields: [
      { key: "merchant_id", label: "Merchant ID", type: "text" },
      { key: "merchant_key", label: "Merchant Key", type: "password" },
    ],
  },
];

export default function PaymentGatewaysPage() {
  const { data: gateways = [], isLoading, upsertGateway, toggleActive, setPrimary, deleteGateway } = usePaymentGateways();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [environment, setEnvironment] = useState("sandbox");
  const [displayName, setDisplayName] = useState("");

  const configuredProviders = new Set(gateways.map((g) => g.provider));

  const openAddDialog = (providerId: string) => {
    const existing = gateways.find((g) => g.provider === providerId);
    const provider = GATEWAY_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return;

    if (existing) {
      setEditingGateway(existing);
      setFormData(existing.credentials || {});
      setEnvironment(existing.environment);
      setDisplayName(existing.display_name);
    } else {
      setEditingGateway(null);
      setFormData({});
      setEnvironment("sandbox");
      setDisplayName(provider.name);
    }
    setSelectedProvider(providerId);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedProvider) return;
    const provider = GATEWAY_PROVIDERS.find((p) => p.id === selectedProvider);
    if (!provider) return;

    upsertGateway.mutate(
      {
        ...(editingGateway ? { id: editingGateway.id } : {}),
        provider: selectedProvider,
        display_name: displayName || provider.name,
        environment,
        credentials: formData,
      },
      { onSuccess: () => setDialogOpen(false) }
    );
  };

  const activeProvider = GATEWAY_PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Gateways de Pagamento</h1>
        <p className="text-muted-foreground text-sm">
          Configure múltiplos gateways. Se um falhar, ative outro instantaneamente.
        </p>
      </div>

      {/* Active gateways */}
      {gateways.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gateways configurados</h2>
          <div className="grid gap-4">
            {gateways.map((gw) => {
              const provider = GATEWAY_PROVIDERS.find((p) => p.id === gw.provider);
              return (
                <Card key={gw.id} className={`transition-all ${gw.is_active ? "border-primary/30" : "opacity-60"}`}>
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: provider?.color || "hsl(var(--primary))" }}
                      >
                        {(provider?.name || gw.provider)[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{gw.display_name}</span>
                          {gw.is_primary && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">
                              <Star className="h-3 w-3 mr-0.5" /> Principal
                            </Badge>
                          )}
                          <Badge variant={gw.environment === "production" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                            {gw.environment === "production" ? "Produção" : "Sandbox"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{provider?.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!gw.is_primary && gw.is_active && (
                        <Button size="sm" variant="ghost" onClick={() => setPrimary.mutate(gw.id)} title="Definir como principal">
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => openAddDialog(gw.provider)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteGateway.mutate(gw.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Switch
                        checked={gw.is_active}
                        onCheckedChange={(val) => toggleActive.mutate({ id: gw.id, is_active: val })}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Info card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Redundância de pagamentos</p>
            <p className="text-xs text-muted-foreground mt-1">
              Configure múltiplos gateways para garantir que seus clientes sempre consigam pagar. 
              Defina um como principal e mantenha outros como backup. Se um gateway apresentar problemas, 
              basta ativar outro com um clique.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Available gateways */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Gateways disponíveis</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {GATEWAY_PROVIDERS.map((provider) => {
            const isConfigured = configuredProviders.has(provider.id);
            return (
              <Card
                key={provider.id}
                className={`cursor-pointer hover:border-primary/30 transition-all ${isConfigured ? "border-primary/20" : ""}`}
                onClick={() => openAddDialog(provider.id)}
              >
                <CardContent className="flex items-center gap-4 p-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ backgroundColor: provider.color }}
                  >
                    {provider.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{provider.name}</span>
                      {isConfigured && (
                        <Badge variant="outline" className="text-[10px]">Configurado</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
                  </div>
                  <Button size="sm" variant={isConfigured ? "outline" : "default"}>
                    {isConfigured ? "Editar" : "Configurar"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Config dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeProvider && (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{ backgroundColor: activeProvider.color }}
                >
                  {activeProvider.name[0]}
                </div>
              )}
              {editingGateway ? `Editar ${activeProvider?.name}` : `Configurar ${activeProvider?.name}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome de exibição</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Ambiente</Label>
              <Select value={environment} onValueChange={setEnvironment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-warning" /> Sandbox (testes)
                    </div>
                  </SelectItem>
                  <SelectItem value="production">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3 text-primary" /> Produção
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeProvider?.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label>{field.label}</Label>
                <Input
                  type={field.type}
                  placeholder={`Insira seu ${field.label}`}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={upsertGateway.isPending}>
              {upsertGateway.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

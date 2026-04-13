import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOffersByProduct, useCreateOffer, useDeleteOffer } from "@/hooks/useOffers";
import { OfferFormDialog } from "@/components/products/OfferFormDialog";
import { Plus, Trash2, Package, DollarSign, Headphones, Save } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/hooks/useProducts";

function formatCents(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

interface Props {
  product: Product;
  onSave: (updates: Record<string, any>) => Promise<void>;
}

export function ProductGeneralTab({ product, onSave }: Props) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [type, setType] = useState(product.type);
  const [guaranteeDays, setGuaranteeDays] = useState(product.guarantee_days ?? 7);
  const [salesPageUrl, setSalesPageUrl] = useState(product.sales_page_url ?? "");
  const [supportEmail, setSupportEmail] = useState(product.support_email ?? "");
  const [producerName, setProducerName] = useState(product.producer_name ?? "");

  const [offerFormOpen, setOfferFormOpen] = useState(false);
  const { data: offers, isLoading: offersLoading } = useOffersByProduct(product.id);
  const createOffer = useCreateOffer();
  const deleteOffer = useDeleteOffer();

  const handleSave = () =>
    onSave({ name, description, type, guarantee_days: guaranteeDays, sales_page_url: salesPageUrl, support_email: supportEmail, producer_name: producerName });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Product info */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Informações do Produto</CardTitle>
              <CardDescription>Dados básicos do seu produto</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Nome do produto</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Curso de Marketing Digital" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Uma breve descrição do seu produto..." />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="physical">Físico</SelectItem>
                  <SelectItem value="service">Serviço</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Garantia</Label>
              <Select value={String(guaranteeDays)} onValueChange={(v) => setGuaranteeDays(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sem garantia</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="15">15 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offers / Prices / Plans */}
      {(() => {
        const hasRecurring = offers?.some((o) => o.billing_type === "recurring");
        const intervalLabels: Record<string, string> = {
          monthly: "Mensal",
          quarterly: "Trimestral",
          semiannual: "Semestral",
          annual: "Anual",
        };
        return (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {hasRecurring ? "Planos de Assinatura" : "Ofertas e Preços"}
                    </CardTitle>
                    <CardDescription>
                      {hasRecurring
                        ? "Gerencie os planos de assinatura do seu produto (mensal, trimestral, anual, etc.)"
                        : "Gerencie as ofertas vinculadas a este produto"}
                    </CardDescription>
                  </div>
                </div>
                <Button size="sm" onClick={() => setOfferFormOpen(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> {hasRecurring ? "Novo plano" : "Nova oferta"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {offersLoading ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Carregando...</p>
              ) : !offers?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma oferta criada</p>
                  <p className="text-xs mt-1">Crie uma oferta para definir preços e métodos de cobrança</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold">Nome</TableHead>
                        <TableHead className="font-semibold">Preço</TableHead>
                        <TableHead className="font-semibold">Tipo</TableHead>
                        {hasRecurring && <TableHead className="font-semibold">Intervalo</TableHead>}
                        {hasRecurring && <TableHead className="font-semibold">Trial</TableHead>}
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell className="font-medium">{offer.name}</TableCell>
                          <TableCell className="font-mono text-sm">{formatCents(offer.price_cents)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {offer.billing_type === "one_time" ? "Único" : "Recorrente"}
                            </Badge>
                          </TableCell>
                          {hasRecurring && (
                            <TableCell className="text-sm">
                              {offer.billing_type === "recurring" && offer.billing_interval
                                ? intervalLabels[offer.billing_interval] ?? offer.billing_interval
                                : "—"}
                            </TableCell>
                          )}
                          {hasRecurring && (
                            <TableCell className="text-sm">
                              {offer.trial_days ? `${offer.trial_days} dias` : "—"}
                            </TableCell>
                          )}
                          <TableCell>
                            <Badge variant={offer.is_active ? "default" : "secondary"} className="text-xs">
                              {offer.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={async () => {
                                await deleteOffer.mutateAsync(offer.id);
                                toast.success("Oferta excluída!");
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Support */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Headphones className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base">Suporte ao Cliente</CardTitle>
              <CardDescription>Informações de contato e suporte</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Página de vendas</Label>
              <Input value={salesPageUrl} onChange={(e) => setSalesPageUrl(e.target.value)} placeholder="https://seusite.com/" />
            </div>
            <div className="space-y-2">
              <Label>E-mail de suporte</Label>
              <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="suporte@email.com" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Nome de exibição do produtor</Label>
              <Input value={producerName} onChange={(e) => setProducerName(e.target.value)} placeholder="Seu nome ou marca" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end pb-4">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Salvar alterações
        </Button>
      </div>

      <OfferFormDialog
        open={offerFormOpen}
        onClose={() => setOfferFormOpen(false)}
        onSubmit={async (data) => {
          await createOffer.mutateAsync({ name: data.name, price_cents: data.price_cents, billing_type: data.billing_type, billing_interval: data.billing_interval, installments: data.installments, trial_days: data.trial_days, is_active: data.is_active, product_id: product.id });
          toast.success("Oferta criada!");
        }}
        offer={null}
      />
    </div>
  );
}

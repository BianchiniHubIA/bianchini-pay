import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOffersByProduct, useCreateOffer, useDeleteOffer } from "@/hooks/useOffers";
import { OfferFormDialog } from "@/components/products/OfferFormDialog";
import { Plus, Trash2 } from "lucide-react";
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
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] mt-4">
      {/* Left: Info */}
      <div className="space-y-6">
        <div>
          <h3 className="font-heading font-bold text-lg">Produto</h3>
          <p className="text-sm text-muted-foreground mt-1">
            A aprovação do produto é instantânea, ou seja, você pode cadastrar e já começar a vender.
          </p>
        </div>

        <div className="pt-6 border-t">
          <h3 className="font-heading font-bold text-lg">Preços</h3>
          <p className="text-sm text-muted-foreground mt-1">Gerencie as ofertas do produto</p>
        </div>

        <div className="pt-6 border-t">
          <h3 className="font-heading font-bold text-lg">Suporte ao cliente</h3>
          <p className="text-sm text-muted-foreground mt-1">Preencha os dados de suporte ao cliente</p>
        </div>
      </div>

      {/* Right: Form */}
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>Nome do produto</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
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
              <div>
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

        {/* Offers / Prices */}
        <Card>
          <CardContent className="pt-6">
            {offersLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : (
              <>
                {offers && offers.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="w-10">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map((offer) => (
                        <TableRow key={offer.id}>
                          <TableCell>{offer.name}</TableCell>
                          <TableCell>{formatCents(offer.price_cents)}</TableCell>
                          <TableCell>{offer.billing_type === "one_time" ? "Único" : "Recorrente"}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
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
                )}
                <div className="flex items-center gap-3 mt-3">
                  <Button size="sm" onClick={() => setOfferFormOpen(true)}>
                    <Plus className="h-4 w-4" /> Adicionar
                  </Button>
                  <span className="text-xs text-muted-foreground">{offers?.length ?? 0} / 10</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>Página de vendas</Label>
              <Input
                value={salesPageUrl}
                onChange={(e) => setSalesPageUrl(e.target.value)}
                placeholder="https://seusite.com/"
              />
            </div>
            <div>
              <Label>E-mail de suporte</Label>
              <Input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="suporte@email.com"
              />
            </div>
            <div>
              <Label>Nome de exibição do produtor</Label>
              <Input
                value={producerName}
                onChange={(e) => setProducerName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar</Button>
        </div>
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

import { useState } from "react";
import { Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useOrderBumps, useCreateOrderBump, useDeleteOrderBump, useToggleOrderBump } from "@/hooks/useOrderBumps";
import type { Offer } from "@/hooks/useOffers";
import { toast } from "sonner";

interface Props {
  checkoutPageId: string | null;
  offers: Offer[];
  currentOfferId: string;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function OrderBumpsSection({ checkoutPageId, offers, currentOfferId }: Props) {
  const { data: bumps = [], isLoading } = useOrderBumps(checkoutPageId);
  const createBump = useCreateOrderBump();
  const deleteBump = useDeleteOrderBump();
  const toggleBump = useToggleOrderBump();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [bumpOfferId, setBumpOfferId] = useState("");
  const [bumpTitle, setBumpTitle] = useState("Aproveite esta oferta!");
  const [bumpDescription, setBumpDescription] = useState("");
  const [bumpPrice, setBumpPrice] = useState("");

  const availableOffers = offers.filter((o) => o.id !== currentOfferId);

  const handleCreate = async () => {
    if (!checkoutPageId || !bumpOfferId) return;
    try {
      await createBump.mutateAsync({
        checkout_page_id: checkoutPageId,
        offer_id: bumpOfferId,
        title: bumpTitle,
        description: bumpDescription || null,
        display_price_cents: Math.round(Number(bumpPrice) * 100) || 0,
      });
      toast.success("Order Bump adicionado!");
      setDialogOpen(false);
      setBumpOfferId("");
      setBumpTitle("Aproveite esta oferta!");
      setBumpDescription("");
      setBumpPrice("");
    } catch {
      toast.error("Erro ao criar order bump");
    }
  };

  if (!checkoutPageId) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Salve a página primeiro para configurar Order Bumps
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" /> Order Bumps
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ofertas extras exibidas no checkout
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          disabled={availableOffers.length === 0}
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="h-16 rounded-lg bg-muted animate-pulse" />
      ) : bumps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">Nenhum order bump configurado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bumps.map((bump) => (
            <div key={bump.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{bump.title}</p>
                <p className="text-xs text-muted-foreground">
                  {(bump.offers as any)?.name ?? "Oferta"} — {formatCurrency(bump.display_price_cents || (bump.offers as any)?.price_cents || 0)}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Switch
                  checked={bump.is_active}
                  onCheckedChange={(v) => toggleBump.mutate({ id: bump.id, is_active: v })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => {
                    deleteBump.mutate(bump.id);
                    toast.success("Order bump removido!");
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Adicionar Order Bump</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Oferta do bump</Label>
              <Select value={bumpOfferId} onValueChange={setBumpOfferId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma oferta" />
                </SelectTrigger>
                <SelectContent>
                  {availableOffers.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name} — {formatCurrency(o.price_cents)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Título exibido</Label>
              <Input value={bumpTitle} onChange={(e) => setBumpTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={bumpDescription}
                onChange={(e) => setBumpDescription(e.target.value)}
                placeholder="Ex: Adicione o módulo avançado por apenas..."
              />
            </div>

            <div className="space-y-2">
              <Label>Preço exibido (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={bumpPrice}
                onChange={(e) => setBumpPrice(e.target.value)}
                placeholder="0,00"
              />
              <p className="text-xs text-muted-foreground">Deixe 0 para usar o preço da oferta</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleCreate}
              disabled={!bumpOfferId || createBump.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {createBump.isPending ? "Criando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

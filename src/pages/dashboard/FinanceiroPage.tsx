import { useState, useMemo } from "react";
import { Eye, RefreshCw, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useOrgMembers } from "@/hooks/useOrganizationSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default function FinanceiroPage() {
  const { orders, products, productMembers, isLoading, refetch } = useFinanceiro();
  const { data: members } = useOrgMembers();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"extrato" | "identidade">("extrato");
  const [manageProductId, setManageProductId] = useState<string | null>(null);
  const [addMemberId, setAddMemberId] = useState("");
  const [addPercentage, setAddPercentage] = useState("0");

  // Total do mês
  const totalMonth = useMemo(() => orders.reduce((s, o) => s + o.amount_cents, 0), [orders]);

  // Revenue per product
  const revenueByProduct = useMemo(() => {
    const map: Record<string, number> = {};
    for (const order of orders) {
      const productId = (order.offers as any)?.product_id;
      if (productId) {
        map[productId] = (map[productId] ?? 0) + order.amount_cents;
      }
    }
    return map;
  }, [orders]);

  // Members per product
  const membersByProduct = useMemo(() => {
    const map: Record<string, Array<{ member_id: string; member_name: string; percentage: number; id: string }>> = {};
    for (const pm of productMembers) {
      if (!map[pm.product_id]) map[pm.product_id] = [];
      map[pm.product_id].push({
        member_id: pm.member_id,
        member_name: (pm as any).member_name ?? "?",
        percentage: Number(pm.percentage),
        id: pm.id,
      });
    }
    return map;
  }, [productMembers]);

  const managedProduct = products.find((p) => p.id === manageProductId);
  const managedMembers = manageProductId ? (membersByProduct[manageProductId] ?? []) : [];

  const existingMemberIds = new Set(managedMembers.map((m) => m.member_id));
  const availableMembers = (members ?? []).filter((m) => {
    const omId = m.id;
    return !existingMemberIds.has(omId);
  });

  const handleAddMember = async () => {
    if (!manageProductId || !addMemberId) return;
    const { error } = await supabase.from("product_members").insert({
      product_id: manageProductId,
      member_id: addMemberId,
      percentage: Number(addPercentage) || 0,
    });
    if (error) {
      toast.error("Erro ao adicionar membro");
      return;
    }
    toast.success("Membro adicionado!");
    setAddMemberId("");
    setAddPercentage("0");
    queryClient.invalidateQueries({ queryKey: ["product-members"] });
  };

  const handleRemoveMember = async (pmId: string) => {
    const { error } = await supabase.from("product_members").delete().eq("id", pmId);
    if (error) {
      toast.error("Erro ao remover");
      return;
    }
    toast.success("Removido!");
    queryClient.invalidateQueries({ queryKey: ["product-members"] });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Financeiro</h1>
          <p className="text-muted-foreground text-xs mt-1">Última atualização: menos de um minuto</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="border-primary text-primary hover:bg-primary/10 font-semibold gap-2"
        >
          Atualizar <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="rounded-xl border border-primary/30 bg-card p-6">
        <p className="text-sm text-primary font-medium">Saldo Disponível</p>
        <div className="flex items-end justify-between mt-2">
          <p className="text-3xl font-heading font-bold">{formatCurrency(totalMonth)}</p>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Tabs Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-border">
          {[
            { key: "extrato" as const, label: "Extrato" },
            { key: "identidade" as const, label: "Por Produto" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "extrato" ? (
          <>
            {orders.length === 0 ? (
              <div className="px-6 py-4">
                <div className="flex items-center gap-3 rounded-lg bg-warning/10 border border-warning/30 px-4 py-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                  <p className="text-sm">Nenhuma venda neste mês ainda.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <div key={order.id} className="grid grid-cols-3 px-6 py-4 text-sm items-center">
                    <span className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </span>
                    <span>{(order.offers as any)?.name ?? "—"}</span>
                    <span className="text-right font-medium text-primary">
                      + {formatCurrency(order.amount_cents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="p-6 space-y-4">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum produto cadastrado.</p>
            ) : (
              products.map((product) => {
                const revenue = revenueByProduct[product.id] ?? 0;
                const pMembers = membersByProduct[product.id] ?? [];
                return (
                  <div
                    key={product.id}
                    className="rounded-xl border border-border bg-accent/30 p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-heading font-semibold">{product.name}</p>
                        <p className="text-xl font-heading font-bold text-primary mt-1">
                          {formatCurrency(revenue)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setManageProductId(product.id)}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" /> Gerenciar
                      </Button>
                    </div>

                    {pMembers.length > 0 ? (
                      <div className="flex items-center gap-3 flex-wrap">
                        {pMembers.map((pm) => (
                          <Tooltip key={pm.id}>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1.5">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                    {pm.member_name[0]?.toUpperCase() ?? "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  @{pm.member_name.split(" ")[0]?.toLowerCase()} ({pm.percentage}%)
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {pm.member_name} — {pm.percentage}% = {formatCurrency((revenue * pm.percentage) / 100)}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Nenhum membro associado</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Manage product members dialog */}
      <Dialog open={!!manageProductId} onOpenChange={(o) => !o && setManageProductId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              Membros — {managedProduct?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Existing members */}
            {managedMembers.length > 0 && (
              <div className="space-y-2">
                {managedMembers.map((pm) => (
                  <div key={pm.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {pm.member_name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{pm.member_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{pm.percentage}%</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleRemoveMember(pm.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new member */}
            {availableMembers.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-border">
                <Label>Adicionar membro</Label>
                <Select value={addMemberId} onValueChange={setAddMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um membro" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.full_name ?? "Sem nome"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-1">
                  <Label>Porcentagem (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={addPercentage}
                    onChange={(e) => setAddPercentage(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddMember}
                  disabled={!addMemberId}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Adicionar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { Eye, RefreshCw, Search, SlidersHorizontal, ChevronDown, RotateCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/useOrders";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function formatCents(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

const tabs = [
  { key: "paid", label: "Aprovadas" },
  { key: "refunded", label: "Reembolsadas" },
  { key: "chargeback", label: "Chargeback" },
  { key: "med", label: "MED" },
  { key: "all", label: "Todas" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "Pendente", variant: "outline" },
  paid: { label: "Aprovada", variant: "default" },
  refunded: { label: "Reembolsada", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  expired: { label: "Expirado", variant: "secondary" },
};

export default function Orders() {
  const { data: orders, isLoading, refetch } = useOrders();
  const [activeTab, setActiveTab] = useState("paid");
  const [search, setSearch] = useState("");

  const allOrders = orders ?? [];
  const paidOrders = allOrders.filter((o) => o.status === "paid");
  const refundedOrders = allOrders.filter((o) => o.status === "refunded");

  const totalRevenue = paidOrders.reduce((s, o) => s + o.amount_cents, 0);
  const totalRefunded = refundedOrders.reduce((s, o) => s + o.amount_cents, 0);
  const pixOrders = paidOrders.filter((o) => o.payment_method === "pix");
  const pixTotal = pixOrders.reduce((s, o) => s + o.amount_cents, 0);
  const refundRate = allOrders.length > 0 ? ((refundedOrders.length / allOrders.length) * 100).toFixed(0) : "0";

  const filtered = activeTab === "all"
    ? allOrders
    : allOrders.filter((o) => o.status === activeTab);

  const searched = search
    ? filtered.filter((o) => {
        const name = (o.customers as any)?.name ?? "";
        const email = (o.customers as any)?.email ?? "";
        return name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());
      })
    : filtered;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Minhas Vendas</h1>
          <p className="text-muted-foreground text-xs mt-1">Última atualização: menos de um minuto</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-primary text-primary hover:bg-primary/10 font-semibold gap-2"
          >
            Atualizar <RefreshCw className="h-4 w-4" />
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
            Exportar <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-primary/30 bg-card p-6">
          <p className="text-sm text-primary font-medium">Vendas encontradas</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-heading font-bold">{paidOrders.length}</p>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="rounded-xl border border-primary/30 bg-card p-6">
          <p className="text-sm text-primary font-medium">Valor líquido</p>
          <div className="flex items-end justify-between mt-2">
            <p className="text-3xl font-heading font-bold">{formatCents(totalRevenue)}</p>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total reembolsado", value: formatCents(totalRefunded) },
          { label: "Vendas no pix", value: formatCents(pixTotal) },
          { label: "Porcentagem de reembolso", value: `${refundRate}%` },
          { label: "Chargeback", value: formatCents(0) },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-xl font-heading font-bold">{item.value}</p>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-border">
          {tabs.map((tab) => (
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

        {/* Search + Filter */}
        <div className="flex items-center justify-between px-6 py-4 gap-4">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-transparent border-border"
            />
          </div>
          <Button variant="outline" className="gap-2 border-border">
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </Button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-6 gap-0 px-6 py-3 bg-accent/50 text-xs text-primary font-medium">
          <span>Data</span>
          <span>Produto</span>
          <span>Cliente</span>
          <span>Status</span>
          <span>Juros Recebidos</span>
          <span>Valor Líquido</span>
        </div>

        {/* Table Body */}
        {searched.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Nenhum registro encontrado
          </div>
        ) : (
          searched.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-6 gap-0 px-6 py-3 border-t border-border text-sm items-center"
            >
              <span className="text-xs text-muted-foreground">
                {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
              </span>
              <span>{(order.offers as any)?.name ?? "—"}</span>
              <span>{(order.customers as any)?.name ?? "—"}</span>
              <span>
                <Badge variant={statusMap[order.status]?.variant ?? "outline"}>
                  {statusMap[order.status]?.label ?? order.status}
                </Badge>
              </span>
              <span className="text-muted-foreground">R$ 0,00</span>
              <span className="font-medium">{formatCents(order.amount_cents)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

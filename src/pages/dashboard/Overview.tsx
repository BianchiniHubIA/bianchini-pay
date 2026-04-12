import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default function Overview() {
  const { data: stats, isLoading } = useDashboardStats();

  const cards = [
    { label: "Receita Total", value: formatCurrency(stats?.revenue ?? 0), icon: DollarSign },
    { label: "Pedidos", value: String(stats?.orders ?? 0), icon: ShoppingCart },
    { label: "Clientes", value: String(stats?.customers ?? 0), icon: Users },
    { label: "Produtos", value: String(stats?.products ?? 0), icon: Package },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Visão Geral</h1>
        <p className="text-muted-foreground text-sm mt-1">Acompanhe as métricas do seu negócio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <div className="text-2xl font-heading font-bold">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhuma atividade registrada ainda. Comece criando seu primeiro produto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

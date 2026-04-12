import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { useRevenueOverTime, useOrdersByStatus, useTopProducts } from "@/hooks/useAnalytics";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const revenueConfig = {
  amount: { label: "Receita", color: "hsl(220, 80%, 56%)" },
};

const statusConfig = {
  value: { label: "Pedidos" },
};

const productsConfig = {
  revenue: { label: "Receita", color: "hsl(220, 80%, 56%)" },
};

export default function Analytics() {
  const { data: revenue, isLoading: revenueLoading } = useRevenueOverTime(30);
  const { data: statusData, isLoading: statusLoading } = useOrdersByStatus();
  const { data: topProducts, isLoading: topLoading } = useTopProducts(5);
  const { data: stats } = useDashboardStats();

  const hasData = (stats?.orders ?? 0) > 0;

  if (!hasData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-heading font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Métricas e relatórios detalhados</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="font-heading text-lg mb-2">Sem dados suficientes</CardTitle>
            <p className="text-muted-foreground text-sm">
              Os gráficos aparecerão quando houver vendas registradas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Métricas e relatórios dos últimos 30 dias</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">
              {formatCurrency((revenue ?? []).reduce((s, r) => s + r.amount, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos Pagos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">
              {statusData?.find((s) => s.name === "Pago")?.value ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold">
              {(() => {
                const total = (statusData ?? []).reduce((s, d) => s + d.value, 0);
                const paid = statusData?.find((s) => s.name === "Pago")?.value ?? 0;
                return total > 0 ? `${((paid / total) * 100).toFixed(1)}%` : "0%";
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Receita Diária (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ChartContainer config={revenueConfig} className="h-64 w-full">
              <AreaChart data={revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220, 80%, 56%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(220, 80%, 56%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} className="text-muted-foreground" />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(220, 80%, 56%)"
                  fill="url(#fillRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by status */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Pedidos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ChartContainer config={statusConfig} className="h-48 w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {(statusData ?? []).map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {(statusData ?? []).map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.fill }} />
                  <span className="text-muted-foreground">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Top Ofertas por Receita</CardTitle>
          </CardHeader>
          <CardContent>
            {topLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : !topProducts?.length ? (
              <p className="text-muted-foreground text-sm text-center py-8">Nenhuma venda registrada.</p>
            ) : (
              <ChartContainer config={productsConfig} className="h-48 w-full">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={100}
                    className="text-muted-foreground"
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                  />
                  <Bar dataKey="revenue" fill="hsl(220, 80%, 56%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

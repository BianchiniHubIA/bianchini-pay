import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye, MousePointerClick, ShoppingCart, TrendingUp, BarChart3, ArrowLeft, Download,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Bar, BarChart } from "recharts";
import {
  useCheckoutAnalytics,
  useCheckoutTimeline,
  type CheckoutStats,
} from "@/hooks/useCheckoutAnalytics";

const chartConfig = {
  views: { label: "Visualizações", color: "hsl(220, 80%, 56%)" },
  clicks: { label: "Cliques CTA", color: "hsl(38, 92%, 50%)" },
  purchases: { label: "Compras", color: "hsl(142, 71%, 45%)" },
};

const PERIOD_OPTIONS = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
] as const;

function exportCsv(stats: CheckoutStats[], days: number) {
  const header = "Produto,Oferta,Slug,Views,Únicos,Cliques CTA,Compras,Taxa Clique (%),Conversão (%)";
  const rows = stats.map((r) =>
    [r.productName, r.offerName, r.slug, r.pageViews, r.uniqueVisitors, r.ctaClicks, r.purchases, r.clickRate.toFixed(1), r.conversionRate.toFixed(1)].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `checkout-analytics-${days}d.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CheckoutAnalytics() {
  const [days, setDays] = useState<number>(7);
  const { data: stats, isLoading } = useCheckoutAnalytics(days);
  const [selected, setSelected] = useState<CheckoutStats | null>(null);
  const { data: timeline, isLoading: timelineLoading } = useCheckoutTimeline(
    selected?.checkoutPageId ?? null,
    days
  );

  const periodSelector = (
    <Tabs value={String(days)} onValueChange={(v) => { setDays(Number(v)); setSelected(null); }}>
      <TabsList>
        {PERIOD_OPTIONS.map((p) => (
          <TabsTrigger key={p.value} value={String(p.value)} className="text-xs">
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Detail view
  if (selected) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-heading font-bold">Métricas do Checkout</h1>
              <p className="text-muted-foreground text-sm">
                {selected.productName} → {selected.offerName}
              </p>
            </div>
          </div>
          {periodSelector}
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold">{selected.pageViews}</div>
              <p className="text-xs text-muted-foreground">{selected.uniqueVisitors} únicos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cliques no CTA</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold">{selected.ctaClicks}</div>
              <p className="text-xs text-muted-foreground">{selected.clickRate.toFixed(1)}% taxa de clique</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Compras</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold">{selected.purchases}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold">{selected.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">views → compra</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeline chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Últimos {days} dias</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220, 80%, 56%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(220, 80%, 56%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillPurchases" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="views" stroke="hsl(220, 80%, 56%)" fill="url(#fillViews)" strokeWidth={2} />
                  <Area type="monotone" dataKey="clicks" stroke="hsl(38, 92%, 50%)" fill="url(#fillClicks)" strokeWidth={2} />
                  <Area type="monotone" dataKey="purchases" stroke="hsl(142, 71%, 45%)" fill="url(#fillPurchases)" strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-48 w-full">
              <BarChart
                data={[
                  { step: "Visualizações", value: selected.pageViews, fill: "hsl(220, 80%, 56%)" },
                  { step: "Cliques CTA", value: selected.ctaClicks, fill: "hsl(38, 92%, 50%)" },
                  { step: "Compras", value: selected.purchases, fill: "hsl(142, 71%, 45%)" },
                ]}
                margin={{ left: 0, right: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="step" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">Métricas de Checkout</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visualizações, cliques e conversões por página de checkout
          </p>
        </div>
        <div className="flex items-center gap-2">
          {periodSelector}
          {stats && stats.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => exportCsv(stats, days)}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          )}
        </div>
      </div>

      {!stats?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="font-heading text-lg mb-2">Nenhuma página de checkout</CardTitle>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              Crie e publique uma página no Page Builder para começar a rastrear métricas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Oferta</TableHead>
                  <TableHead className="text-center">Views</TableHead>
                  <TableHead className="text-center">Únicos</TableHead>
                  <TableHead className="text-center">Cliques CTA</TableHead>
                  <TableHead className="text-center">Compras</TableHead>
                  <TableHead className="text-center">Conversão</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((row) => (
                  <TableRow
                    key={row.checkoutPageId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelected(row)}
                  >
                    <TableCell className="font-medium">{row.productName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{row.offerName}</TableCell>
                    <TableCell className="text-center">{row.pageViews}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{row.uniqueVisitors}</TableCell>
                    <TableCell className="text-center">{row.ctaClicks}</TableCell>
                    <TableCell className="text-center">{row.purchases}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={row.conversionRate > 5 ? "default" : row.conversionRate > 0 ? "secondary" : "outline"}
                      >
                        {row.conversionRate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

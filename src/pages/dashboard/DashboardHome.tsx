import { useState } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useOrders } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { PixIcon, BoletoIcon, CreditCardIcon, PicPayIcon, ApplePayIcon, GooglePayIcon } from "@/components/icons/PaymentIcons";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

const HIDDEN = "••••••";

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

const paymentMethods = [
  { name: "Pix", icon: PixIcon },
  { name: "Boleto", icon: BoletoIcon },
  { name: "Cartão de crédito", icon: CreditCardIcon },
  { name: "Pic Pay", icon: PicPayIcon },
  { name: "Apple Pay", icon: ApplePayIcon },
  { name: "Google Pay", icon: GooglePayIcon },
];

export default function DashboardHome() {
  const { data: stats, isLoading, refetch } = useDashboardStats();
  const { data: orders } = useOrders();
  const [period, setPeriod] = useState("today");

  // Privacy toggles
  const [showRevenue, setShowRevenue] = useState(true);
  const [showQtd, setShowQtd] = useState(true);
  const [showPaymentValues, setShowPaymentValues] = useState(true);
  const [hiddenSideStats, setHiddenSideStats] = useState<Record<string, boolean>>({});

  const toggleSideStat = (label: string) =>
    setHiddenSideStats((prev) => ({ ...prev, [label]: !prev[label] }));

  const totalRevenue = stats?.revenue ?? 0;
  const totalOrders = stats?.orders ?? 0;

  const paidOrders = orders?.filter((o) => o.status === "paid") ?? [];
  const refundedOrders = orders?.filter((o) => o.status === "refunded") ?? [];
  const cancelledOrders = orders?.filter((o) => o.status === "cancelled") ?? [];

  const refundRate = totalOrders > 0 ? ((refundedOrders.length / totalOrders) * 100).toFixed(0) : "0";

  const chartData = HOURS.map((hour) => ({
    hour,
    vendas: paidOrders.filter((o) => {
      const h = new Date(o.created_at).getHours();
      return `${String(h).padStart(2, "0")}:00` === hour;
    }).length,
  }));

  const EyeToggle = ({ visible, onToggle }: { visible: boolean; onToggle: () => void }) => {
    const Icon = visible ? Eye : EyeOff;
    return (
      <button onClick={onToggle} className="text-muted-foreground hover:text-foreground transition-colors">
        <Icon className="h-4 w-4" />
      </button>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-xs mt-1">Última atualização: agora</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] border-border bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => refetch()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
          >
            Atualizar <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-primary/30 bg-card p-6">
          <p className="text-sm text-primary font-medium">Vendas realizadas</p>
          {isLoading ? (
            <Skeleton className="h-9 w-32 mt-2" />
          ) : (
            <p className="text-3xl font-heading font-bold mt-2">
              {showRevenue ? formatCurrency(totalRevenue) : HIDDEN}
            </p>
          )}
          <div className="flex justify-end mt-2">
            <EyeToggle visible={showRevenue} onToggle={() => setShowRevenue((v) => !v)} />
          </div>
        </div>
        <div className="rounded-xl border border-primary/30 bg-card p-6">
          <p className="text-sm text-primary font-medium">Quantidade de vendas</p>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mt-2" />
          ) : (
            <p className="text-3xl font-heading font-bold mt-2">
              {showQtd ? totalOrders : HIDDEN}
            </p>
          )}
          <div className="flex justify-end mt-2">
            <EyeToggle visible={showQtd} onToggle={() => setShowQtd((v) => !v)} />
          </div>
        </div>
      </div>

      {/* Payment Methods + Side Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payment Methods Table */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-3 gap-0 px-6 py-3 border-b border-border text-sm text-primary font-medium">
            <span>Meios de Pagamento</span>
            <span>Conversão</span>
            <span className="flex items-center gap-1">
              Valor{" "}
              <EyeToggle visible={showPaymentValues} onToggle={() => setShowPaymentValues((v) => !v)} />
            </span>
          </div>
          {paymentMethods.map((pm) => (
            <div
              key={pm.name}
              className="grid grid-cols-3 gap-0 px-6 py-4 border-b border-border last:border-b-0 text-sm"
            >
              <span className="flex items-center gap-3">
                <pm.icon className="h-5 w-5 text-muted-foreground" />
                {pm.name}
              </span>
              <span className="text-muted-foreground">{showPaymentValues ? "0%" : HIDDEN}</span>
              <span className="text-muted-foreground">{showPaymentValues ? "R$ 0,00" : HIDDEN}</span>
            </div>
          ))}
        </div>

        {/* Side Stats */}
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {[
            { label: "Abandono C.", value: String(cancelledOrders.length) },
            { label: "Reembolso", value: `${refundRate}%` },
            { label: "Charge Back", value: "0%" },
            { label: "MED", value: "0%" },
          ].map((item) => {
            const isHidden = !!hiddenSideStats[item.label];
            return (
              <div key={item.label} className="px-6 py-4 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xl font-heading font-bold mt-1">
                    {isHidden ? HIDDEN : item.value}
                  </p>
                </div>
                <EyeToggle visible={!isHidden} onToggle={() => toggleSideStat(item.label)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Chart */}
      <div className="rounded-xl border border-border bg-card p-6">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="hour"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Area
              type="monotone"
              dataKey="vendas"
              stroke="hsl(var(--success))"
              fill="url(#colorVendas)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

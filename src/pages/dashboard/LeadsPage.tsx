import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, UserCheck, UserX, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  lead: { label: "Lead", variant: "secondary" },
  qualified: { label: "Qualificado", variant: "default" },
  converted: { label: "Convertido", variant: "default" },
  lost: { label: "Perdido", variant: "destructive" },
};

const paymentMethodMap: Record<string, string> = {
  pix: "Pix",
  credit_card: "Cartão de Crédito",
  boleto: "Boleto",
  picpay: "PicPay",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
};

export default function LeadsPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: leads = [], isLoading } = useLeads(selectedProduct);
  const { data: products = [] } = useProducts();

  const filtered = leads.filter((lead: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(s) ||
      lead.email?.toLowerCase().includes(s) ||
      lead.whatsapp?.includes(s)
    );
  });

  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l: any) => l.status === "converted").length;
  const lostLeads = leads.filter((l: any) => l.status === "lost").length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Leads</h1>
        <p className="text-muted-foreground text-sm">
          Todos os leads capturados nos seus checkouts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{totalLeads}</p>
                <p className="text-xs text-muted-foreground">Total de leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{convertedLeads}</p>
                <p className="text-xs text-muted-foreground">Convertidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <UserX className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{lostLeads}</p>
                <p className="text-xs text-muted-foreground">Perdidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Filter className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Taxa de conversão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={selectedProduct ?? "all"}
          onValueChange={(v) => setSelectedProduct(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Todos os produtos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os produtos</SelectItem>
            {products.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((lead: any) => {
                  const st = statusMap[lead.status] || statusMap.lead;
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.whatsapp || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.products?.name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {lead.payment_method ? (paymentMethodMap[lead.payment_method] || lead.payment_method) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

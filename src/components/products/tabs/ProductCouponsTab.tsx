import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Tag, Percent } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCoupons } from "@/hooks/useCoupons";
import type { Product } from "@/hooks/useProducts";
import { useState } from "react";

interface Props {
  product: Product;
}

export function ProductCouponsTab({ product }: Props) {
  const [search, setSearch] = useState("");
  const { data: coupons } = useCoupons();

  const productCoupons = coupons?.filter(
    (c) => !c.product_id || c.product_id === product.id
  ) ?? [];
  const filtered = productCoupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Tag className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base">Cupons de Desconto</CardTitle>
                <CardDescription>Gerencie cupons vinculados a este produto</CardDescription>
              </div>
            </div>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Novo cupom
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cupom..." className="pl-9" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Percent className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Nenhum cupom encontrado</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Crie cupons de desconto para atrair mais clientes</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="font-semibold">Código</TableHead>
                    <TableHead className="font-semibold">Escopo</TableHead>
                    <TableHead className="font-semibold">Desconto</TableHead>
                    <TableHead className="font-semibold">Validade</TableHead>
                    <TableHead className="font-semibold">Usos</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <code className="px-2 py-0.5 rounded bg-muted text-xs font-bold">{coupon.code}</code>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {coupon.product_id ? product.name : "Todos os produtos"}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-emerald-500">{coupon.discount_percent}%</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("pt-BR") : "Sem prazo"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {coupon.used_count}{coupon.max_uses ? `/${coupon.max_uses}` : ""}
                      </TableCell>
                      <TableCell>
                        <Badge variant={coupon.is_active ? "default" : "secondary"} className="text-xs">
                          {coupon.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

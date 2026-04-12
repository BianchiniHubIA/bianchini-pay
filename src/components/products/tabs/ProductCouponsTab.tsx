import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useCoupons } from "@/hooks/useCoupons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Product } from "@/hooks/useProducts";
import { useState } from "react";

interface Props {
  product: Product;
}

export function ProductCouponsTab({ product }: Props) {
  const [search, setSearch] = useState("");
  const { data: coupons } = useCoupons();

  // Filter coupons for this product or global
  const productCoupons = coupons?.filter(
    (c) => !c.product_id || c.product_id === product.id
  ) ?? [];
  const filtered = productCoupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar"
                className="pl-9"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4" /> Adicionar Cupom
            </Button>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro encontrado</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead># Usos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {coupon.product_id ? product.name : "Todos"}
                    </TableCell>
                    <TableCell>{coupon.discount_percent}%</TableCell>
                    <TableCell className="text-xs">{coupon.starts_at ?? "—"}</TableCell>
                    <TableCell className="text-xs">{coupon.expires_at ?? "—"}</TableCell>
                    <TableCell>{coupon.used_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Product } from "@/hooks/useProducts";
import { useOffersByProduct } from "@/hooks/useOffers";
import { useCheckoutPageByOffer } from "@/hooks/useCheckoutPages";
import { useState } from "react";

function formatCents(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

interface Props {
  product: Product;
}

export function ProductCheckoutTab({ product }: Props) {
  const [search, setSearch] = useState("");
  const { data: offers } = useOffersByProduct(product.id);

  // For now, show offers with their checkout info
  // A full implementation would list all checkout pages for this product's offers

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
              <Plus className="h-4 w-4" /> Adicionar Checkout
            </Button>
          </div>

          {!offers?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum checkout encontrado. Crie uma oferta primeiro.</p>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Configure checkouts para suas ofertas na página de Page Builder.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

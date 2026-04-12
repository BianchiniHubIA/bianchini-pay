import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, Search } from "lucide-react";
import { useOffersByProduct } from "@/hooks/useOffers";
import { useCheckoutPageByOffer } from "@/hooks/useCheckoutPages";
import type { Product } from "@/hooks/useProducts";
import { useState } from "react";
import { toast } from "sonner";

function formatCents(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

interface Props {
  product: Product;
}

function CheckoutLinkRow({ offerId, offerName, priceCents }: { offerId: string; offerName: string; priceCents: number }) {
  const { data: checkoutPage } = useCheckoutPageByOffer(offerId);
  const baseUrl = window.location.origin;

  if (!checkoutPage) return null;

  const url = `${baseUrl}/checkout/${checkoutPage.slug}`;
  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{checkoutPage.headline}</TableCell>
      <TableCell>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={copyLink}>
          <Copy className="h-3 w-3" />
          {url.length > 40 ? url.slice(0, 40) + "..." : url}
        </Button>
      </TableCell>
      <TableCell className="text-xs">{offerName}</TableCell>
      <TableCell><Badge variant="secondary" className="text-xs">Checkout</Badge></TableCell>
      <TableCell>{formatCents(priceCents)}</TableCell>
      <TableCell>
        <Badge variant={checkoutPage.is_published ? "default" : "secondary"} className="text-xs">
          {checkoutPage.is_published ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

export function ProductLinksTab({ product }: Props) {
  const [search, setSearch] = useState("");
  const { data: offers } = useOffersByProduct(product.id);

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
          </div>

          {!offers?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum link disponível. Crie uma oferta e publique um checkout primeiro.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <CheckoutLinkRow
                    key={offer.id}
                    offerId={offer.id}
                    offerName={offer.name}
                    priceCents={offer.price_cents}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

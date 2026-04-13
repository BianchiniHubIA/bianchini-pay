import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Link2 } from "lucide-react";
import { useOffersByProduct } from "@/hooks/useOffers";
import { useCheckoutPageByOffer } from "@/hooks/useCheckoutPages";
import type { Product } from "@/hooks/useProducts";
import { toast } from "sonner";

function formatCents(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

interface Props {
  product: Product;
}

function CheckoutLinkCard({ offerId, offerName, priceCents }: { offerId: string; offerName: string; priceCents: number }) {
  const { data: checkoutPage } = useCheckoutPageByOffer(offerId);
  const baseUrl = window.location.origin;

  if (!checkoutPage) return null;

  const url = `${baseUrl}/${checkoutPage.slug}`;
  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">{offerName}</p>
          <Badge variant={checkoutPage.is_published ? "default" : "secondary"} className="text-xs shrink-0">
            {checkoutPage.is_published ? "Publicado" : "Rascunho"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground font-mono truncate">{url}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatCents(priceCents)}</p>
      </div>
      <div className="flex items-center gap-1.5 ml-3">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyLink}>
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export function ProductLinksTab({ product }: Props) {
  const { data: offers } = useOffersByProduct(product.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Link2 className="h-4 w-4 text-cyan-500" />
            </div>
            <div>
              <CardTitle className="text-base">Links do Checkout</CardTitle>
              <CardDescription>Links públicos de cada oferta para compartilhar</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!offers?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Link2 className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Nenhum link disponível</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Crie uma oferta e publique o checkout para gerar links</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <CheckoutLinkCard
                  key={offer.id}
                  offerId={offer.id}
                  offerName={offer.name}
                  priceCents={offer.price_cents}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

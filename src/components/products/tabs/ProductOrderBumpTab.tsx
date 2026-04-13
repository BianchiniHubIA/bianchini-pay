import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, GripVertical } from "lucide-react";
import type { Product } from "@/hooks/useProducts";

interface Props {
  product: Product;
}

export function ProductOrderBumpTab({ product }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <CardTitle className="text-base">Order Bumps</CardTitle>
                <CardDescription>Adicione ofertas extras que aparecem no checkout</CardDescription>
              </div>
            </div>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Novo bump
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nenhum order bump adicionado</p>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
              Order bumps são ofertas adicionais exibidas no checkout que aumentam o valor médio do pedido
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

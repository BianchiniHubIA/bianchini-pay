import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Product } from "@/hooks/useProducts";
import { useProducts } from "@/hooks/useProducts";
import { useState } from "react";

interface Props {
  product: Product;
}

export function ProductOrderBumpTab({ product }: Props) {
  // Placeholder - order bumps will reference other products
  const [bumps, setBumps] = useState<string[]>([]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] mt-4">
      <div>
        <h3 className="font-heading font-bold text-lg">Order bump</h3>
        <p className="text-sm text-muted-foreground mt-1">Aprenda mais sobre os order bumps</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {bumps.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-3">Nenhum bump adicionado</p>
          ) : null}
          <div className="flex items-center gap-3">
            <Button size="sm">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
            <span className="text-xs text-muted-foreground">{bumps.length} / 5</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

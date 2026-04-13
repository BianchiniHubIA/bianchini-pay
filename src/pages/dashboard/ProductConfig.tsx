import { useParams, useNavigate } from "react-router-dom";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Package, Settings, ShoppingCart, CreditCard, Tag, Link2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { ProductGeneralTab } from "@/components/products/tabs/ProductGeneralTab";
import { ProductSettingsTab } from "@/components/products/tabs/ProductSettingsTab";
import { ProductOrderBumpTab } from "@/components/products/tabs/ProductOrderBumpTab";
import { ProductCheckoutTab } from "@/components/products/tabs/ProductCheckoutTab";
import { ProductCouponsTab } from "@/components/products/tabs/ProductCouponsTab";
import { ProductLinksTab } from "@/components/products/tabs/ProductLinksTab";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  draft: { label: "Rascunho", variant: "secondary" },
  inactive: { label: "Inativo", variant: "outline" },
};

export default function ProductConfig() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();
  const updateProduct = useUpdateProduct();
  const [saving, setSaving] = useState(false);

  const product = products?.find((p) => p.id === productId);

  const handleSave = async (updates: Record<string, any>) => {
    if (!product) return;
    setSaving(true);
    try {
      await updateProduct.mutateAsync({ id: product.id, ...updates });
      toast.success("Produto salvo!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Package className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground text-lg">Produto não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/products")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar aos produtos
        </Button>
      </div>
    );
  }

  const status = statusMap[product.status] ?? statusMap.draft;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="border-b bg-card/50 -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/products")}
              className="flex items-center justify-center h-9 w-9 rounded-lg border bg-background hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight">{product.name}</h1>
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {product.type === "digital" ? "Digital" : product.type === "physical" ? "Físico" : "Serviço"}
                {product.description && ` · ${product.description.slice(0, 60)}${product.description.length > 60 ? "..." : ""}`}
              </p>
            </div>
          </div>
          <Button onClick={() => handleSave({})} disabled={saving} size="sm" className="gap-2">
            {saving && <Loader2 className="animate-spin h-4 w-4" />}
            Salvar Produto
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start p-0 h-auto gap-0">
          {[
            { value: "geral", label: "Geral", icon: Package },
            { value: "configuracoes", label: "Configurações", icon: Settings },
            { value: "order-bump", label: "Order Bump", icon: ShoppingCart },
            { value: "checkout", label: "Checkout", icon: CreditCard },
            { value: "cupons", label: "Cupons", icon: Tag },
            { value: "links", label: "Links", icon: Link2 },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none gap-2 px-5 pb-3 pt-1 text-sm"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="pt-6">
          <TabsContent value="geral" className="m-0">
            <ProductGeneralTab product={product} onSave={handleSave} />
          </TabsContent>
          <TabsContent value="configuracoes" className="m-0">
            <ProductSettingsTab product={product} onSave={handleSave} />
          </TabsContent>
          <TabsContent value="order-bump" className="m-0">
            <ProductOrderBumpTab product={product} />
          </TabsContent>
          <TabsContent value="checkout" className="m-0">
            <ProductCheckoutTab product={product} />
          </TabsContent>
          <TabsContent value="cupons" className="m-0">
            <ProductCouponsTab product={product} />
          </TabsContent>
          <TabsContent value="links" className="m-0">
            <ProductLinksTab product={product} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

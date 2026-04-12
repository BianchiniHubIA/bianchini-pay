import { useParams, useNavigate } from "react-router-dom";
import { useProducts, useUpdateProduct } from "@/hooks/useProducts";
import { useOffersByProduct, useCreateOffer, useUpdateOffer, useDeleteOffer } from "@/hooks/useOffers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { ProductGeneralTab } from "@/components/products/tabs/ProductGeneralTab";
import { ProductSettingsTab } from "@/components/products/tabs/ProductSettingsTab";
import { ProductOrderBumpTab } from "@/components/products/tabs/ProductOrderBumpTab";
import { ProductCheckoutTab } from "@/components/products/tabs/ProductCheckoutTab";
import { ProductCouponsTab } from "@/components/products/tabs/ProductCouponsTab";
import { ProductLinksTab } from "@/components/products/tabs/ProductLinksTab";

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
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Produto não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/products")}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/dashboard/products")}
          className="flex items-center gap-1 text-primary hover:underline text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <Button onClick={() => handleSave({})} disabled={saving}>
          {saving && <Loader2 className="animate-spin h-4 w-4" />}
          Salvar Produto
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="w-full justify-start bg-card border rounded-lg p-1 h-auto flex-wrap">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          <TabsTrigger value="order-bump">Order Bump</TabsTrigger>
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="cupons">Cupons</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <ProductGeneralTab product={product} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="configuracoes">
          <ProductSettingsTab product={product} onSave={handleSave} />
        </TabsContent>
        <TabsContent value="order-bump">
          <ProductOrderBumpTab product={product} />
        </TabsContent>
        <TabsContent value="checkout">
          <ProductCheckoutTab product={product} />
        </TabsContent>
        <TabsContent value="cupons">
          <ProductCouponsTab product={product} />
        </TabsContent>
        <TabsContent value="links">
          <ProductLinksTab product={product} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

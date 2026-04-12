import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Package, Pencil, Trash2, Eye, MoreHorizontal, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProducts, useCreateProduct, useDeleteProduct, type Product } from "@/hooks/useProducts";
import { useCreateOffer } from "@/hooks/useOffers";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  inactive: { label: "Inativo", variant: "secondary" },
  draft: { label: "Rascunho", variant: "outline" },
};

const typeMap: Record<string, string> = {
  digital: "Digital",
  physical: "Físico",
  service: "Serviço",
};

export default function Products() {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const createOffer = useCreateOffer();
  const deleteProduct = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreateProduct = async (data: { name: string; description?: string; type: "digital" | "physical" | "service"; status: "active" | "inactive" | "draft"; price_cents: number; access_type: string }) => {
    try {
      const product = await createProduct.mutateAsync({
        name: data.name,
        description: data.description,
        type: data.type,
        status: data.status,
        access_type: data.access_type,
      });
      // Auto-create the main offer
      await createOffer.mutateAsync({
        name: "Oferta Principal",
        price_cents: data.price_cents,
        billing_type: "one_time",
        product_id: product.id,
      });
      toast.success("Produto criado!");
      // Navigate to config page
      navigate(`/dashboard/products/${product.id}`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar produto");
      throw e;
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteId) return;
    await deleteProduct.mutateAsync(deleteId);
    toast.success("Produto excluído!");
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Produtos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie seus produtos e ofertas</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {!products?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="font-heading text-lg mb-2">Nenhum produto ainda</CardTitle>
            <p className="text-muted-foreground text-sm text-center max-w-sm">
              Crie seu primeiro produto para começar a gerar checkouts e processar pagamentos.
            </p>
            <Button className="mt-4" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Criar Produto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/dashboard/products/${product.id}`)}
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{typeMap[product.type]}</TableCell>
                    <TableCell>
                      <Badge variant={statusMap[product.status]?.variant ?? "outline"}>
                        {statusMap[product.status]?.label ?? product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/products/${product.id}`); }}>
                            <Settings className="h-4 w-4 mr-2" /> Configurar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteId(product.id); }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateProduct}
        product={null}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso também excluirá todas as ofertas vinculadas. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

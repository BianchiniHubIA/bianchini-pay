import { useState } from "react";
import { Search, Trash2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCoupons, useCreateCoupon, useDeleteCoupon } from "@/hooks/useCoupons";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function CouponsPage() {
  const { data: coupons, isLoading } = useCoupons();
  const { data: products } = useProducts();
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [code, setCode] = useState("");
  const [productId, setProductId] = useState<string>("all");
  const [discount, setDiscount] = useState("");
  const [startsAtDate, setStartsAtDate] = useState<Date | undefined>();
  const [expiresAtDate, setExpiresAtDate] = useState<Date | undefined>();
  const [applyBumps, setApplyBumps] = useState(false);

  const filtered = (coupons ?? []).filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setCode("");
    setProductId("all");
    setDiscount("");
    setStartsAtDate(undefined);
    setExpiresAtDate(undefined);
    setApplyBumps(false);
  };

  const handleCreate = async () => {
    if (!code || !discount) {
      toast.error("Preencha código e desconto");
      return;
    }
    try {
      await createCoupon.mutateAsync({
        code,
        product_id: productId === "all" ? null : productId,
        discount_percent: Number(discount),
        starts_at: startsAtDate ? format(startsAtDate, "yyyy-MM-dd") : null,
        expires_at: expiresAtDate ? format(expiresAtDate, "yyyy-MM-dd") : null,
        apply_to_bumps: applyBumps,
      });
      toast.success("Cupom criado!");
      resetForm();
      setDialogOpen(false);
    } catch {
      toast.error("Erro ao criar cupom. Verifique se o código já existe.");
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCoupon.mutateAsync(id);
    toast.success("Cupom removido!");
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-heading font-bold">Cupons</h1>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          Adicionar Cupom
        </Button>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <h2 className="font-heading font-semibold">Meus Cupons</h2>
          <div className="w-12 h-0.5 bg-primary mt-1 rounded-full" />
        </div>

        {/* Search */}
        <div className="px-6 py-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-transparent border-border"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-6 gap-0 px-6 py-3 bg-accent/50 text-xs text-primary font-medium">
          <span>Código</span>
          <span>Produtos</span>
          <span>Desconto</span>
          <span>Início</span>
          <span>Fim</span>
          <span># Usos</span>
        </div>

        {/* Table Body */}
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Nenhum registro encontrado
          </div>
        ) : (
          filtered.map((coupon) => (
            <div
              key={coupon.id}
              className="grid grid-cols-6 gap-0 px-6 py-4 border-t border-border text-sm items-center"
            >
              <span className="font-mono font-medium">{coupon.code}</span>
              <span className="text-muted-foreground">
                {(coupon.products as any)?.name ?? "Todos"}
              </span>
              <span>{Number(coupon.discount_percent)}%</span>
              <span className="text-muted-foreground">
                {coupon.starts_at ? format(new Date(coupon.starts_at), "dd/MM/yyyy") : "—"}
              </span>
              <span className="text-muted-foreground">
                {coupon.expires_at ? format(new Date(coupon.expires_at), "dd/MM/yyyy") : "Eterno"}
              </span>
              <div className="flex items-center justify-between">
                <span>{coupon.used_count ?? 0}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleDelete(coupon.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Coupon Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Adicionar Cupom</DialogTitle>
            <DialogDescription>
              Adicione aqui os cupons para os seus produtos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                placeholder="Código"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <Label>Produtos</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Produtos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {(products ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Desconto (%)</Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Desconto"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data de início do cupom</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startsAtDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startsAtDate ? format(startsAtDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startsAtDate}
                    onSelect={setStartsAtDate}
                    locale={ptBR}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de expiração do cupom</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !expiresAtDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAtDate ? format(expiresAtDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiresAtDate}
                    onSelect={setExpiresAtDate}
                    locale={ptBR}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">Deixe sem valor para a validade ser eterna</p>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={applyBumps} onCheckedChange={setApplyBumps} />
              <Label className="cursor-pointer">Aplicar desconto aos Order Bumps</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createCoupon.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {createCoupon.isPending ? "Criando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

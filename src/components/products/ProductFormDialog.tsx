import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import type { Product } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";
import { WhatsAppIcon, GmailIcon, MembersIcon, ExternalLinkIcon } from "@/components/icons/AccessTypeIcons";

const productSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  description: z.string().optional(),
  type: z.enum(["digital", "physical", "service"]),
  status: z.enum(["active", "inactive", "draft"]),
  price_cents: z.number().min(1, "Preço obrigatório"),
  access_type: z.string().default("link"),
});

type ProductFormValues = z.infer<typeof productSchema>;

const accessOptions = [
  { value: "members_area", label: "Área de membros", description: "Bianchini Workspace", icon: MembersIcon },
  { value: "whatsapp", label: "WhatsApp", description: "Envio via WhatsApp", icon: WhatsAppIcon },
  { value: "email", label: "Email", description: "Envio por email", icon: GmailIcon },
  { value: "link", label: "Outro (link)", description: "Link externo", icon: ExternalLinkIcon },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  product?: Product | null;
}

export function ProductFormDialog({ open, onClose, onSubmit, product }: Props) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const isEditing = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      type: (product?.type as any) ?? "digital",
      status: (product?.status as any) ?? "draft",
      price_cents: 0,
      access_type: product?.access_type ?? "link",
    },
  });

  useEffect(() => {
    if (open) {
      setStep(1);
      form.reset({
        name: product?.name ?? "",
        description: product?.description ?? "",
        type: (product?.type as any) ?? "digital",
        status: (product?.status as any) ?? "draft",
        price_cents: 0,
        access_type: product?.access_type ?? "link",
      });
    }
  }, [open, product]);

  const handleNext = async () => {
    const valid = await form.trigger(["name", "type", "status", "price_cents"]);
    if (valid) setStep(2);
  };

  const handleSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      await onSubmit(data);
      form.reset();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const selectedAccess = form.watch("access_type");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEditing ? "Editar Produto" : step === 1 ? "Novo Produto" : "Tipo de Acesso"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {step === 1 && (
              <>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do produto</FormLabel>
                    <FormControl><Input placeholder="Ex: Curso de Marketing" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl><Textarea placeholder="Descreva seu produto..." rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="digital">Digital</SelectItem>
                          <SelectItem value="physical">Físico</SelectItem>
                          <SelectItem value="service">Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="price_cents" render={({ field }) => {
                  const [priceText, setPriceText] = useState(
                    field.value ? (field.value / 100).toFixed(2) : ""
                  );
                  return (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="97.00"
                          value={priceText}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
                            setPriceText(val);
                            const parsed = parseFloat(val);
                            if (!isNaN(parsed)) {
                              field.onChange(Math.round(parsed * 100));
                            } else {
                              field.onChange(0);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }} />
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                  {isEditing ? (
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="animate-spin" />}
                      Salvar
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleNext}>Próximo</Button>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-sm text-muted-foreground">Como será o acesso do usuário?</p>
                <div className="grid grid-cols-2 gap-3">
                  {accessOptions.map((opt) => {
                    const Icon = opt.icon;
                    const selected = selectedAccess === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => form.setValue("access_type", opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all text-center",
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-muted-foreground/50"
                        )}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="font-medium text-sm">{opt.label}</span>
                        <span className="text-xs text-muted-foreground">{opt.description}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between pt-2">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4" /> Voltar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="animate-spin" />}
                    Criar
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

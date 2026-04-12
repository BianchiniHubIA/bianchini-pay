import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Offer } from "@/hooks/useOffers";

const offerSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  price: z.string().min(1, "Preço obrigatório"),
  billing_type: z.enum(["one_time", "recurring"]),
  billing_interval: z.enum(["monthly", "quarterly", "semiannual", "annual"]).optional(),
  installments: z.coerce.number().min(1).max(12).default(1),
  trial_days: z.coerce.number().min(0).default(0),
  is_active: z.boolean().default(true),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OfferFormValues & { price_cents: number }) => Promise<void>;
  offer?: Offer | null;
}

export function OfferFormDialog({ open, onClose, onSubmit, offer }: Props) {
  const [loading, setLoading] = useState(false);
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      name: offer?.name ?? "",
      price: offer ? (offer.price_cents / 100).toFixed(2) : "",
      billing_type: offer?.billing_type ?? "one_time",
      billing_interval: offer?.billing_interval ?? undefined,
      installments: offer?.installments ?? 1,
      trial_days: offer?.trial_days ?? 0,
      is_active: offer?.is_active ?? true,
    },
  });

  const billingType = form.watch("billing_type");

  const handleSubmit = async (data: OfferFormValues) => {
    setLoading(true);
    try {
      const price_cents = Math.round(parseFloat(data.price.replace(",", ".")) * 100);
      await onSubmit({ ...data, price_cents });
      form.reset();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {offer ? "Editar Oferta" : "Nova Oferta"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da oferta</FormLabel>
                <FormControl><Input placeholder="Ex: Plano Mensal" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (R$)</FormLabel>
                <FormControl><Input placeholder="97.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="billing_type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cobrança</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="one_time">Única</SelectItem>
                      <SelectItem value="recurring">Recorrente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              {billingType === "recurring" && (
                <FormField control={form.control} name="billing_interval" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervalo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="semiannual">Semestral</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="installments" render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas</FormLabel>
                  <FormControl><Input type="number" min={1} max={12} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="trial_days" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias de trial</FormLabel>
                  <FormControl><Input type="number" min={0} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="is_active" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel className="!mt-0">Oferta ativa</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                {offer ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Customers() {
  const { data: customers, isLoading } = useCustomers();

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
      <div>
        <h1 className="text-2xl font-heading font-bold">Clientes</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie sua base de clientes</p>
      </div>

      {!customers?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="font-heading text-lg mb-2">Nenhum cliente ainda</CardTitle>
            <p className="text-muted-foreground text-sm">Os clientes serão registrados automaticamente com cada venda.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Desde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{customer.phone ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{customer.document ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(customer.created_at), "dd/MM/yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

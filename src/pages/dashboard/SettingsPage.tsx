import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
  useOrganizationDetails,
  useUpdateOrganization,
  useOrgMembers,
  useUpdateMemberRole,
  useRemoveMember,
  useUpdateProfile,
} from "@/hooks/useOrganizationSettings";
import { toast } from "sonner";
import { Trash2, Building2, Users2, User } from "lucide-react";

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Admin",
  editor: "Editor",
  viewer: "Visualizador",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: org, isLoading: orgLoading } = useOrganizationDetails();
  const updateOrg = useUpdateOrganization();
  const { data: members, isLoading: membersLoading } = useOrgMembers();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const updateProfile = useUpdateProfile();

  const [profileName, setProfileName] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);

  const displayProfileName = profileName ?? user?.user_metadata?.full_name ?? "";
  const displayOrgName = orgName ?? org?.name ?? "";

  const currentMember = members?.find((m) => m.user_id === user?.id);
  const isAdmin = currentMember?.role === "owner" || currentMember?.role === "admin";

  const handleSaveProfile = async () => {
    if (!user) return;
    await updateProfile.mutateAsync({ userId: user.id, fullName: displayProfileName });
    toast.success("Perfil atualizado!");
  };

  const handleSaveOrg = async () => {
    if (!org) return;
    await updateOrg.mutateAsync({ id: org.id, name: displayOrgName });
    toast.success("Organização atualizada!");
  };

  const handleRemoveMember = async () => {
    if (!removeMemberId) return;
    await removeMember.mutateAsync(removeMemberId);
    toast.success("Membro removido!");
    setRemoveMemberId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-heading font-bold">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie sua conta, organização e equipe</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="font-heading text-base">Perfil</CardTitle>
              <CardDescription>Suas informações pessoais</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={displayProfileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Salvando..." : "Salvar perfil"}
          </Button>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="font-heading text-base">Organização</CardTitle>
              <CardDescription>Configurações do seu negócio</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {orgLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <>
              <div className="space-y-2">
                <Label>Nome da organização</Label>
                <Input
                  value={displayOrgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={org?.slug ?? ""} disabled />
                <p className="text-xs text-muted-foreground">Identificador único, não editável.</p>
              </div>
              {isAdmin && (
                <Button onClick={handleSaveOrg} disabled={updateOrg.isPending}>
                  {updateOrg.isPending ? "Salvando..." : "Salvar organização"}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="font-heading text-base">Equipe</CardTitle>
              <CardDescription>Membros da organização e suas permissões</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {membersLoading ? (
            <div className="p-6">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Função</TableHead>
                  {isAdmin && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(members ?? []).map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {(member.full_name ?? "U")[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.full_name ?? "Sem nome"}</p>
                          {member.user_id === user?.id && (
                            <span className="text-xs text-muted-foreground">Você</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdmin && member.user_id !== user?.id ? (
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            updateRole.mutate({
                              id: member.id,
                              role: value as "owner" | "admin" | "editor" | "viewer",
                            })
                          }
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary">{roleLabels[member.role] ?? member.role}</Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {member.user_id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setRemoveMemberId(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Remove member dialog */}
      <AlertDialog open={!!removeMemberId} onOpenChange={(o) => !o && setRemoveMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro?</AlertDialogTitle>
            <AlertDialogDescription>
              O membro perderá acesso a esta organização. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

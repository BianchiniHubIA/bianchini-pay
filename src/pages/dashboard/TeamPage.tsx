import { useState } from "react";
import { UserPlus, Trash2, Mail, Shield, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import {
  useOrgMembers, useUpdateMemberRole, useRemoveMember,
} from "@/hooks/useOrganizationSettings";
import { useOrganization } from "@/hooks/useOrganization";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Admin",
  editor: "Editor",
  viewer: "Visualizador",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  pending: { label: "Pendente", variant: "secondary", icon: Clock },
  accepted: { label: "Aceito", variant: "default", icon: CheckCircle2 },
  expired: { label: "Expirado", variant: "destructive", icon: Clock },
};

function useTeamInvites() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["team_invites", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from("team_invites")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const createInvite = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!organizationId) throw new Error("Sem organização");
      // Check if invite already exists
      const { data: existing } = await supabase
        .from("team_invites")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("email", email)
        .eq("status", "pending")
        .maybeSingle();
      if (existing) throw new Error("Já existe um convite pendente para este email");

      const { error } = await supabase.from("team_invites").insert({
        organization_id: organizationId,
        email,
        role,
        invited_by: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_invites", organizationId] });
    },
  });

  const deleteInvite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_invites").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_invites", organizationId] });
    },
  });

  return { ...query, createInvite, deleteInvite };
}

export default function TeamPage() {
  const { user } = useAuth();
  const { organizationId } = useOrganization();
  const { data: members, isLoading: membersLoading } = useOrgMembers();
  const { data: invites = [], isLoading: invitesLoading, createInvite, deleteInvite } = useTeamInvites();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const [activeTab, setActiveTab] = useState<"members" | "invites">("members");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("editor");
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);

  const currentMember = members?.find((m) => m.user_id === user?.id);
  const isAdmin = currentMember?.role === "owner" || currentMember?.role === "admin";
  const isLoading = membersLoading || invitesLoading;

  const pendingInvites = invites.filter((i: any) => i.status === "pending");

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await createInvite.mutateAsync({ email: inviteEmail, role: inviteRole });
      toast.success(`Convite enviado para ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("editor");
      setInviteOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeMemberId) return;
    await removeMember.mutateAsync(removeMemberId);
    toast.success("Membro removido!");
    setRemoveMemberId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Equipe</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie os membros da sua organização e convide novos colaboradores.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar membro
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{members?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Membros ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-4 w-4 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{pendingInvites.length}</p>
                <p className="text-xs text-muted-foreground">Convites pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-heading">{invites.filter((i: any) => i.status === "accepted").length}</p>
                <p className="text-xs text-muted-foreground">Convites aceitos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-border">
          {[
            { key: "members" as const, label: "Membros" },
            { key: "invites" as const, label: `Convites (${invites.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <CardContent className="p-0">
          {activeTab === "members" ? (
            <>
              <div className="grid grid-cols-4 gap-0 px-6 py-3 bg-muted/50 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <span>Nome</span>
                <span>Função</span>
                <span>Desde</span>
                <span className="text-right">Ações</span>
              </div>

              {(members ?? []).length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Nenhum membro encontrado
                </div>
              ) : (
                (members ?? []).map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-4 gap-0 px-6 py-4 border-t border-border text-sm items-center"
                  >
                    <span className="font-medium">
                      {member.full_name ?? "Sem nome"}
                      {member.user_id === user?.id && (
                        <span className="text-xs text-muted-foreground ml-2">(Você)</span>
                      )}
                    </span>
                    <span>
                      {isAdmin && member.user_id !== user?.id && member.role !== "owner" ? (
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
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(member.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <span className="text-right">
                      {isAdmin && member.user_id !== user?.id && member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setRemoveMemberId(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </span>
                  </div>
                ))
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-0 px-6 py-3 bg-muted/50 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                <span>Email</span>
                <span>Função</span>
                <span>Status</span>
                <span className="text-right">Ações</span>
              </div>

              {invites.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  Nenhum convite enviado ainda
                </div>
              ) : (
                invites.map((invite: any) => {
                  const st = statusConfig[invite.status] || statusConfig.pending;
                  const StIcon = st.icon;
                  return (
                    <div
                      key={invite.id}
                      className="grid grid-cols-4 gap-0 px-6 py-4 border-t border-border text-sm items-center"
                    >
                      <span className="font-medium">{invite.email}</span>
                      <span>
                        <Badge variant="outline">{roleLabels[invite.role] ?? invite.role}</Badge>
                      </span>
                      <span>
                        <Badge variant={st.variant} className="gap-1">
                          <StIcon className="h-3 w-3" />
                          {st.label}
                        </Badge>
                      </span>
                      <span className="text-right">
                        {invite.status === "pending" && isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteInvite.mutate(invite.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Convidar membro</DialogTitle>
            <DialogDescription>
              Insira o email da pessoa. Quando ela se registrar com esse email, terá acesso automático à plataforma.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                placeholder="email@exemplo.com"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — Acesso total</SelectItem>
                  <SelectItem value="editor">Editor — Pode editar conteúdo</SelectItem>
                  <SelectItem value="viewer">Visualizador — Apenas visualização</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail || createInvite.isPending}>
              {createInvite.isPending ? "Enviando..." : "Enviar convite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

import {
  LayoutDashboard,
  Eye,
  Package,
  ShoppingBag,
  UsersRound,
  UserPlus,
  
  MousePointerClick,
  BarChart3,
  HandCoins,
  Tag,
  Settings,
  Users,
  CreditCard,
  LogOut,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Visão Geral", url: "/dashboard/overview", icon: Eye },
  { title: "Produtos", url: "/dashboard/products", icon: Package },
  { title: "Minhas Vendas", url: "/dashboard/orders", icon: ShoppingBag },
  { title: "Clientes", url: "/dashboard/customers", icon: UsersRound },
  { title: "Leads", url: "/dashboard/leads", icon: UserPlus },
  
  { title: "Checkout Analytics", url: "/dashboard/checkout-analytics", icon: MousePointerClick },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Financeiro", url: "/dashboard/financeiro", icon: HandCoins },
  { title: "Cupons", url: "/dashboard/coupons", icon: Tag },
];

const settingsNav = [
  { title: "Gateways de Pagamento", url: "/dashboard/gateways", icon: CreditCard },
  { title: "Equipe", url: "/dashboard/team", icon: Users },
  { title: "Configurações", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className={`flex items-center px-2 py-4 ${collapsed ? "justify-center" : "gap-2"}`}>
            <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0">
              <img src={logo} alt="Bianchini Go" className="h-full w-full object-contain" />
            </div>
            {!collapsed && (
              <span className="text-lg font-heading font-bold text-sidebar-accent-foreground">
                Bianchini <span className="text-primary">Pay</span>
              </span>
            )}
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/dashboard"}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

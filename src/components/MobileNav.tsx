import { Home, Bot, Target, Settings, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const items = [
  { title: "Inicio", url: "/dashboard", icon: Home },
  { title: "Tutor IA", url: "/chatbots", icon: Bot },
  { title: "Retos", url: "/challenges", icon: Target },
  { title: "Ajustes", url: "/settings", icon: Settings },
];

export function MobileNav() {
  const location = useLocation();
  const { profile } = useAuth();
  const isAdmin = profile && profile.role_id <= 2;

  const allItems = isAdmin
    ? [...items.slice(0, 3), { title: "Admin", url: "/admin", icon: Shield }, items[3]]
    : items;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-card md:hidden">
      {allItems.map((item) => {
        const active = location.pathname.startsWith(item.url);
        return (
          <Link
            key={item.url}
            to={item.url}
            className={cn(
              "flex flex-col items-center gap-1 text-xs",
              active ? "text-secondary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

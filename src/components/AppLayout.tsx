import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { MobileNav } from "@/components/MobileNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </SidebarProvider>
  );
}

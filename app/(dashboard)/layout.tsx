import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Dashboardlayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <DashboardSidebar />
            <main className='relative w-full overflow-hidden'>
                {/* <DashboardNavbar /> */}
                {children}
            </main>
        </SidebarProvider>
    )
}

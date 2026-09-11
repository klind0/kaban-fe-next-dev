import { Hamburger } from "../icons/hamburger";
import { SidebarTrigger } from "../ui/sidebar";

interface DashboardNavbarProps {
  pageTitle: string;
  children?: React.ReactNode;
}

export default function DashboardNavbar({ pageTitle, children }: DashboardNavbarProps) {
  return (
    <nav className='fixed lg:static w-full flex items-center justify-between py-5 px-4 bg-white text-grey-alpha-500 border-b border-grey-alpha-50 z-30 md:px-8 md:h-22'>
      <div className="w-full flex items-center justify-between">
        <h4 className="text-lg font-semibold text-foreground">{pageTitle}</h4>
          {children}
          <SidebarTrigger className='md:hidden'><Hamburger /></SidebarTrigger>
      </div>
    </nav>
  )
}
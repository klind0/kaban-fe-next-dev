'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Building2 } from "../icons/buildings"
import { Logo } from "../icons/Logo"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "../ui/popover"
import Image from "next/image"
import { LogoutIcon } from "../icons/logout-icon"
import { Profile } from "../icons/profile"
import { useUserStore } from "@/app/stores/user-store"
import SampleAvatar from '@/app/assets/images/sample-avatar.png';
import { QUERY_KEY } from "@/enum/queryKeys"
import { toast } from "sonner"
import Cookies from "js-cookie"
import X from "../icons/x"
import { Menu } from "lucide-react" 
import { Button } from "../ui/button"

export const menuItems = [
    {
        title: "My listings",
        url: "/dashboard",
        icon: Building2,
        activeIcon: Building2,
    },
];

export function DashboardSidebar() {
    const pathName = usePathname()
    const { setOpenMobile, openMobile } = useSidebar()

    const router = useRouter()

    const { user, clearUser } = useUserStore()
    
    // Standardized to use fullName directly with a clean fallback
    const userData = user ? { 
        fullName: user.fullName || "User", 
        email: user.email || "",
        avatar: user.realtor_pic || user.avatar || user.realtorPic || (user.realtor as any)?.realtor_pic || SampleAvatar
    } : { 
        fullName: "Great User", 
        email: "hello@kaban.ng",
        avatar: SampleAvatar 
    };

    const isActive = (url: string) => pathName === url;

    const handleLogout = () => {
        router.push('/');
        clearUser();
        Cookies.remove(QUERY_KEY.ACCESS_TOKEN);
        Cookies.remove(QUERY_KEY.REFRESH_TOKEN);
        toast.success("Signed-out successfully!");
    };

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <SidebarGroupLabel className="text-base font-bold flex justify-between items-center">
                    <Link href={'/'}>
                        <Logo className="text-primary" />
                    </Link>
                    <SidebarTrigger className="md:hidden">
                        {openMobile ? <X className="size-5" /> : <Menu className="size-5" />}
                    </SidebarTrigger>
                </SidebarGroupLabel>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="p-4 border-y border-neutral-600">
                            <Button asChild>
                                <Link href="/dashboard/create-listing" onClick={() => setOpenMobile(false)}>Create Listing</Link>
                            </Button>
                        </SidebarMenu>
                    </SidebarGroupContent>
                    <SidebarGroupContent>
                        <SidebarGroupLabel className="text-sm font-semibold uppercase px-4 py-3">Menu</SidebarGroupLabel>
                        <SidebarMenu className="relative">
                            {
                                menuItems.map((item) => {
                                    return (
                                        <SidebarMenuItem key={item.title} className={`${isActive(item.url) ? 'bg-[#F3F9FE] border-l-[3px] border-primary text-primary' : ''} flex items-center justify-between gap-1 py-3`}>
                                            <Link href={item.url} onClick={() => setOpenMobile(false)} className={`flex gap-2 items-center w-full pl-6 font-semibold`}><item.icon /> {item.title}</Link>
                                        </SidebarMenuItem>
                                    )
                                })
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-6 border-t border-dark-blue">
                <div className="w-full flex justify-center">
                    <div className="container flex w-full items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="flex w-full items-center gap-2">
                                    <div className="size-10 shrink-0 overflow-hidden rounded-full">
                                        <Image 
                                            src={userData.avatar} 
                                            alt="User Avatar" 
                                            width={40} 
                                            height={40} 
                                            className="rounded-full w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col text-left">
                                        <span className="text-sm font-medium text-gray-700 truncate">{userData.fullName}</span>
                                        <span className="text-xs text-gray-500 truncate">{userData.email}</span>
                                    </div>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="p-4 mb-2" side="top" align="start">
                                <PopoverHeader>
                                    <PopoverTitle className="sr-only">User profile</PopoverTitle>
                                    <PopoverDescription className="sr-only">Manage your account settings and preferences.</PopoverDescription>
                                </PopoverHeader>
                                <div className="flex flex-col">
                                    <Link 
                                        href={'/dashboard/profile'} 
                                        className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md" 
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        <Profile />Profile
                                    </Link>
                                    <button 
                                        className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md" 
                                        onClick={() => { handleLogout(); setOpenMobile(false); }}
                                    >
                                        <LogoutIcon />Sign out
                                    </button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
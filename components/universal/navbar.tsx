"use client"
import Link from "next/link";
import { Button } from "../ui/button";
import { Logo } from "../icons/Logo";
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
} from "../ui/menubar";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "../ui/popover";
import { Building2 } from "../icons/buildings";
import { Profile } from "../icons/profile";
import { LogoutIcon } from "../icons/logout-icon";
import { ChevronRight as ChevronRightIcon } from "lucide-react";
import React from "react";
import { Hamburger } from "../icons/hamburger";
import X from "../icons/x";
import { House, House2 } from "../icons/house";
import Image from "next/image";
import { useUserStore } from "@/app/stores/user-store";
import { QUERY_KEY } from "@/enum/queryKeys";
import Cookies from "js-cookie";
import { toast } from "sonner";
import AuthModal from "../auth/auth-modal";

type SubMenuItem = {
    name: string;
    link: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

type MenuItem = {
    name: string;
    href: string;
    subMenu?: SubMenuItem[];
};

export default function Navbar() {
    // 🛠️ Consume both user and realtor slices
    const { user, realtor, isAuthenticated, clearUser } = useUserStore();
    const isUserLoggedIn = isAuthenticated && user !== null;

    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);
    const [isSignInModalOpen, setSignInModalOpen] = React.useState(false);

    const avatarUrl = realtor?.realtor_pic || (user as any)?.realtor_pic || user?.avatar || (user as any)?.realtorPic || null;
    const fullName = user?.fullName || (user as any)?.full_name || "";
    const email = user?.email || "";

    const nameInitials = (fullName.trim().match(/\b\w/g) || ["U"])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const userData = { fullName, email, avatar: avatarUrl };

    const menuItems: MenuItem[] = [
        {
            name: 'Properties', href: '#', subMenu: [
                { name: 'Residential', link: '/search?category=residential', icon: House },
                { name: 'Industrial', link: '/search?category=industrial', icon: Building2 },
                { name: 'Commercial', link: '/search?category=commercial', icon: House2 },
            ]
        },
        /*{
            name: 'Realtors', href: '#', subMenu: [
                { name: 'Agents', link: '/realtors/agents', icon: ProfileUser },
                { name: 'Agencies', link: '/realtors/agencies', icon: People },
            ]
        },*/
        /*{
            name: 'Company', href: '#', subMenu: [
                { name: 'About us', link: '/company/about-us', icon: Clipboard },
                { name: 'Contact us', link: '/company/contact-us', icon: Messages },
                { name: 'FAQs', link: '/company/faqs', icon: MessageQuestion },
            ]
        },*/
        /*{ name: 'Blog', href: '/blog' },*/
    ];

    const handleLogout = () => {
        clearUser();
        Cookies.remove(QUERY_KEY.ACCESS_TOKEN);
        Cookies.remove(QUERY_KEY.REFRESH_TOKEN);
        toast.success("Signed out successfully!");
    };

    const toggleSubmenu = (name: string) => {
        setOpenSubmenu((prev) => (prev === name ? null : name));
    };

    return (
        <nav className={`bg-white/60 mx-auto py-4 px-4 2xl:px-0 fixed top-0 left-0 right-0 z-50 ${!mobileOpen ? 'backdrop-blur-md' : ''}`}>
            {/* Desktop Navbar */}
            <div className="container mx-auto hidden md:flex justify-between">
                <Link href="/">
                    <Logo className="text-primary" />
                </Link>
                <Menubar className="flex items-center gap-8 border-none shadow-none bg-transparent">
                    {menuItems.map((item) => (
                        <MenubarMenu key={item.name}>
                            {item.subMenu ? (
                                <>
                                    <MenubarTrigger className={`bg-transparent px-0 text-base font-normal focus:bg-transparent data-[state=open]:text-primary data-[state=open]:font-medium data-[state=open]:bg-transparent transition-colors`}>
                                        {item.name}
                                    </MenubarTrigger>
                                    <MenubarContent className="rounded-3xl min-w-65 p-4 border flex flex-col">
                                        {item.subMenu.map((sub) => (
                                            <MenubarItem key={sub.name} asChild className="text-sm text-[#495E6C] font-medium p-4 hover:bg-neutral-100 cursor-pointer focus:bg-neutral-100">
                                                <Link href={sub.link} className="w-full h-full flex items-center gap-2 focus:outline-none">
                                                    {sub.icon && <sub.icon className="w-4 h-4 mr-2" />}
                                                    {sub.name}
                                                </Link>
                                            </MenubarItem>
                                        ))}
                                    </MenubarContent>
                                </>
                            ) : (
                                <MenubarTrigger asChild className={`bg-transparent px-0 text-base font-normal focus:bg-transparent data-[state=open]:text-primary data-[state=open]:font-medium transition-colors`}>
                                    <Link href={item.href}>{item.name}</Link>
                                </MenubarTrigger>
                            )}
                        </MenubarMenu>
                    ))}
                    {isUserLoggedIn ? (
                        <div className="flex items-center gap-8">
                            <Link href={'/dashboard/create-listing'}>
                                <Button>Create Listing</Button>
                            </Link>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="size-10 rounded-full flex items-center justify-center bg-primary text-white text-sm font-semibold overflow-hidden shrink-0">
                                        {userData.avatar ? (
                                            <Image src={userData.avatar} alt="User Avatar" width={40} height={40} className="w-full h-full object-cover" />
                                        ) : (
                                            nameInitials
                                        )}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="p-4">
                                    <PopoverHeader>
                                        <PopoverTitle className="sr-only">User profile</PopoverTitle>
                                        <PopoverDescription className="sr-only">Manage your account settings and preferences.</PopoverDescription>
                                    </PopoverHeader>
                                    <div className="space-y-3">
                                        <div className="p-4 flex gap-4 items-center">
                                            <div className="size-10 bg-primary flex justify-center items-center text-sm text-white text-center font-semibold rounded-full overflow-hidden shrink-0">
                                                {userData.avatar ? (
                                                    <Image src={userData.avatar} alt="User Avatar" width={40} height={40} className="w-full h-full object-cover" />
                                                ) : (
                                                    nameInitials
                                                )}
                                            </div>
                                            <div className="flex flex-col w-full min-w-0">
                                                <span className="font-medium text-gray-700 truncate">{userData.fullName}</span>
                                                <span className="text-sm text-gray-500 truncate">{userData.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <Link href={'/dashboard'} className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md">
                                                <Building2 />My listings
                                            </Link>
                                            <Link href={'/dashboard/profile'} className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md">
                                                <Profile />Profile
                                            </Link>
                                            <button className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md" onClick={handleLogout}>
                                                <LogoutIcon />Sign out
                                            </button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    ) : (
                        <Button
                            variant={'default'}
                            onClick={() => setSignInModalOpen(true)}
                        >
                            Sign In
                        </Button>
                    )}
                </Menubar>
            </div>

            {/* Mobile Navbar */}
            <div className="flex md:hidden justify-between items-center">
                <Link href="/">
                    <Logo className="text-primary" />
                </Link>
                <button
                    aria-label="Open menu"
                    className="rounded focus:outline-none"
                    onClick={() => setMobileOpen(true)}
                >
                    <Hamburger className={`size-6 text-primary`} />
                </button>
            </div>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 bg-white max-h-dvh w-full animate-in fade-in-0">
                    <div className="container mx-auto px-4 flex flex-col pb-8 animate-in fade-in-0">
                        <div className="flex items-center justify-between py-4">
                            <Link href="/">
                                <Logo className="text-primary" />
                            </Link>
                            <button
                                aria-label="Close menu"
                                className="rounded focus:outline-none [&_svg]:size-8"
                                onClick={() => setMobileOpen(false)}
                            >
                                <X />
                            </button>
                        </div>

                        <div className="flex flex-col space-y-1 divide-y divide-[#EAEBF0] border-b border-[#EAEBF0]">
                            {menuItems.map((item) => (
                                <div key={item.name}>
                                    {item.subMenu ? (
                                        <button
                                            className="w-full flex items-center justify-between p-4 text-[#495E6C]"
                                            onClick={() => toggleSubmenu(item.name)}
                                        >
                                            <span className="font-medium">{item.name}</span>
                                            <ChevronRightIcon
                                                className={`size-5 transition-transform duration-200 ${openSubmenu === item.name ? "rotate-90" : ""}`}
                                            />
                                        </button>
                                    ) : (
                                        <Link href={item.href} className="flex items-center justify-between p-4 text-[#495E6C]">
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    )}
                                    {item.subMenu && openSubmenu === item.name && (
                                        <div className="flex flex-col bg-neutral-50 border-t border-[#EAEBF0] divide-y divide-[#EAEBF0]">
                                            {item.subMenu.map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.link}
                                                    className="flex items-center gap-2 px-8 py-3 text-sm text-[#495E6C] font-semibold hover:bg-neutral-100"
                                                    onClick={() => setMobileOpen(false)}
                                                >
                                                    {sub.icon && <sub.icon className="size-4" />}
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {!isUserLoggedIn && (
                            <div className="mt-8">
                                <Button className="w-full" onClick={() => setSignInModalOpen(true)}>Sign In</Button>
                            </div>
                        )}

                    </div>
                    {isUserLoggedIn && (
                        <div className="w-full absolute flex justify-center bottom-0 left-0 p-4 border-t border-[#EAEBF0]">
                            <div className="container flex w-full items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="flex w-full items-center gap-2">
                                            <div className="size-10 rounded-full flex items-center justify-center bg-primary text-white text-sm font-semibold shrink-0 overflow-hidden">
                                                {userData.avatar ? (
                                                    <Image src={userData.avatar} alt="User Avatar" width={40} height={40} className="w-full h-full object-cover" />
                                                ) : (
                                                    nameInitials
                                                )}
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-medium text-gray-700">{userData.fullName}</span>
                                                <span className="text-sm text-gray-500">{userData.email}</span>
                                            </div>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-4 mb-2" side="top" align="start">
                                        <PopoverHeader>
                                            <PopoverTitle className="sr-only">User profile</PopoverTitle>
                                            <PopoverDescription className="sr-only">Manage your account settings and preferences.</PopoverDescription>
                                        </PopoverHeader>
                                        <div className="flex flex-col">
                                            <Link href={'/dashboard'} className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md" onClick={() => setMobileOpen(false)}>
                                                <Building2 />My listings
                                            </Link>
                                            <Link href={'/dashboard/profile'} className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md" onClick={() => setMobileOpen(false)}>
                                                <Profile />Profile
                                            </Link>
                                            <button className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                                                <LogoutIcon />Sign out
                                            </button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <AuthModal isOpen={isSignInModalOpen} onOpenChange={() => setSignInModalOpen(false)} />
        </nav>
    );
}
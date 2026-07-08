import React from 'react'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle } from '../ui/popover'
import Link from 'next/link'
import { Building2 } from '../icons/buildings'
import { LogoutIcon } from '../icons/logout-icon'
import { Profile } from '../icons/profile'

type ProfileMenuProps = {
    openProfileMenu: boolean,
    setOpenProfileMenu: (open: boolean) => void,
    nameInitials: string,
    userData: {
        firstName: string,
        lastName: string,
        email: string
    },
    handleLogout: () => void
}

export default function ProfileMenu({ openProfileMenu, setOpenProfileMenu, nameInitials, userData, handleLogout }: ProfileMenuProps) {
    return (

        <Popover open={openProfileMenu} onOpenChange={setOpenProfileMenu}>
            <PopoverContent className="p-4">
                <PopoverHeader>
                    <PopoverTitle className="sr-only">User profile</PopoverTitle>
                    <PopoverDescription className="sr-only">Manage your account settings and preferences.</PopoverDescription>
                </PopoverHeader>
                <div className="space-y-3">
                    <div className="p-4 flex gap-4">
                        <div>
                            <div className="size-10 bg-primary flex justify-center items-center text-sm text-white text-center font-semibold rounded-full">
                                {nameInitials}
                            </div>
                        </div>
                        <div className="flex flex-col w-full min-w-0">
                            <span className="font-medium text-gray-700 truncate">{`${userData.firstName} ${userData.lastName}`}</span>
                            <span className="text-sm text-gray-500 truncate">{userData.email}</span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <Link href={'/dashboard'} className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md"><Building2 />My listings</Link>
                        <Link href={'/dashboard/#'} className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md"><Profile />Profile</Link>
                        <button className="px-6 py-3 font-semibold flex items-center gap-3 text-[#495E6C] hover:bg-neutral-100 rounded-md" onClick={handleLogout}><LogoutIcon />Sign out</button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

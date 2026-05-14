'use client'
import React from 'react'

interface TabItem {
    name: string | React.ReactNode
    value: string
}

interface TabsProps {
    items: TabItem[]
    activeTab: string
    onTabChange: (value: string) => void
    className?: string
    updateUrl?: boolean
    urlParam?: string
}

export default function CustomTab({
    items,
    activeTab,
    onTabChange,
    className = '',
    updateUrl = false,
    urlParam = 'tab'
}: TabsProps) {
    React.useEffect(() => {
        if (!updateUrl) return

        const searchParams = new URLSearchParams(window.location.search)
        const tabFromUrl = searchParams.get(urlParam) || items[0]?.value

        if (tabFromUrl && tabFromUrl !== activeTab) {
            onTabChange(tabFromUrl)
        }
    }, [updateUrl, urlParam, items, activeTab, onTabChange])

    React.useEffect(() => {
        if (!updateUrl) return

        const handlePopState = () => {
            const searchParams = new URLSearchParams(window.location.search)
            const tabFromUrl = searchParams.get(urlParam) || items[0]?.value
            if (tabFromUrl) {
                onTabChange(tabFromUrl)
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [updateUrl, urlParam, items, onTabChange])

    const handleTabClick = (value: string) => {
        if (updateUrl) {
            const url = new URL(window.location.href)
            url.search = ''
            url.searchParams.set(urlParam, value)
            window.history.pushState({}, '', url.toString())
        }

        onTabChange(value)
    }

    return (
        <>
            <nav className={`flex w-full border-b border-neutral-700 ${className}`}>
                <ul className='flex gap-1 sm:gap-2 md:gap-3 items-center -mb-px w-full overflow-x-auto hide-scrollbar'>
                    {items.map((item) => (
                        <li
                            key={item.value}
                            onClick={() => handleTabClick(item.value)}
                            className='flex flex-col px-1 sm:px-2 pt-3 cursor-pointer transition-transform duration-200 ease-linear hover:scale-105 shrink-0 min-w-0'
                        >
                            <span
                                className={`text-base font-medium transition-colors duration-700 ease-linear whitespace-nowrap ${item.value === activeTab ? 'text-primary' : 'text-grey-alpha-300'
                                    }`}
                            >
                                {item.name}
                            </span>
                            <span
                                className={`w-full h-1 ${item.value === activeTab ? 'bg-primary' : 'bg-transparent'
                                    } transition-all duration-300 ease-linear`}
                            />
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    )
}
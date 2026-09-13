'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'
import { Button } from '../ui/button'
import X from '../icons/x'

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void
    }
}

const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
}

const setCookie = (name: string, value: string, days: number = 30) => {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = `expires=${date.toUTCString()}`
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`
}

const initializeConsent = () => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
        })
    }
}

const updateConsentGranted = () => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
            'ad_storage': 'granted',
            'ad_user_data': 'granted',
            'ad_personalization': 'granted',
            'analytics_storage': 'granted'
        })
    }
}

const updateConsentDenied = () => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied'
        })
    }
}

export default function CookiesPolicy() {
    const [isVisible, setIsVisible] = React.useState(false)
    const [isLoaded, setIsLoaded] = React.useState(false)

    React.useEffect(() => {
        initializeConsent()

        const cookieConsent = getCookie('kaban-cookie-consent')

        if (!cookieConsent) {
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 1000)

            return () => clearTimeout(timer)
        } else {
            if (cookieConsent === 'accepted') {
                updateConsentGranted()
            } else if (cookieConsent === 'rejected') {
                updateConsentDenied()
            }
        }

        setIsLoaded(true)
    }, [])

    const handleAccept = () => {
        setCookie('kaban-cookie-consent', 'accepted', 30)
        setCookie('kaban-cookie-consent-date', new Date().toISOString())
        updateConsentGranted()
        setIsVisible(false)
    }

    const handleReject = () => {
        setCookie('kaban-cookie-consent', 'rejected', 7)
        setCookie('kaban-cookie-consent-date', new Date().toISOString())
        updateConsentDenied()
        setIsVisible(false)
    }

    const handleClose = () => {
        setIsVisible(false)
    }

    if (!isVisible && isLoaded) return null

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className='bg-[#E9F5FF] fixed bottom-0 left-0 w-full py-4 gap-4 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                    <div className='container mx-auto px-4 flex flex-col 2xl:px-0 md:flex-row md:justify-between md:items-center gap-6'>
                        <span className='text-sm font-medium pr-8'>
                            Kaban.ng uses essential cookies to improve your website experience. By clicking &quot;Accept&quot;, you agree to our website&apos;s cookies use. Learn more in our <Link href="/privacy-policy" className='text-primary hover:underline' aria-label='Privacy Policy'>Privacy Policy</Link>.
                        </span>
                        <div className='flex items-center gap-2.5 shrink-0'>
                            <Button
                                variant={'secondary'}
                                className='bg-white hover:bg-white/80 w-fit px-5'
                                onClick={handleReject}
                                aria-label='Reject all cookies'
                            >
                                Reject all
                            </Button>
                            <Button
                                className='w-fit px-5'
                                onClick={handleAccept}
                                aria-label='Accept all cookies'
                            >
                                Accept all
                            </Button>
                        </div>
                        <button
                            onClick={handleClose}
                            className='absolute top-3 right-3 md:top-4 md:right-4 p-1 hover:bg-white/50 rounded-full transition-colors'
                            aria-label='Close cookie banner'
                        >
                            <X />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}


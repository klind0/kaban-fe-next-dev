"use client"
import React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface CarouselProps {
    /** The slide elements to render inside the carousel */
    children: React.ReactNode[]
    /** Extra classes for the outer wrapper div */
    className?: string
    /** Automatically advance slides at this interval, in milliseconds */
    autoAdvanceMs?: number
}

export default function Carousel({ children, className = '', autoAdvanceMs }: CarouselProps) {
    const trackRef = React.useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const total = children.length

    const isScrollingRef = React.useRef(false)

    const scrollTo = React.useCallback((index: number) => {
        const clamped = Math.max(0, Math.min(index, total - 1))
        isScrollingRef.current = true
        setCurrentIndex(clamped)
        const track = trackRef.current
        const card = track?.children[clamped] as HTMLElement | undefined
        if (track && card) {
            const trackRect = track.getBoundingClientRect()
            const cardRect = card.getBoundingClientRect()
            const left =
                track.scrollLeft +
                cardRect.left -
                trackRect.left -
                (track.clientWidth - cardRect.width) / 2
            track.scrollTo({ left, behavior: 'smooth' })
        }
        setTimeout(() => { isScrollingRef.current = false }, 600)
    }, [total])

    React.useEffect(() => {
        if (!autoAdvanceMs || autoAdvanceMs <= 0 || total < 2) return

        const interval = window.setInterval(() => {
            scrollTo((currentIndex + 1) % total)
        }, autoAdvanceMs)

        return () => window.clearInterval(interval)
    }, [autoAdvanceMs, currentIndex, scrollTo, total])

    const handleScroll = React.useCallback(() => {
        if (isScrollingRef.current) return
        const track = trackRef.current
        if (!track) return
        const trackRect = track.getBoundingClientRect()
        const trackCenter = trackRect.left + trackRect.width / 2
        let closestIndex = 0
        let closestDistance = Infinity
        Array.from(track.children).forEach((child, i) => {
            const rect = child.getBoundingClientRect()
            const childCenter = rect.left + rect.width / 2
            const distance = Math.abs(childCenter - trackCenter)
            if (distance < closestDistance) {
                closestDistance = distance
                closestIndex = i
            }
        })
        setCurrentIndex(closestIndex)
    }, [])

    return (
        <div className={`relative ${className}`}>
            {/* Track */}
            <div
                ref={trackRef}
                onScroll={handleScroll}
                className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {children.map((child, i) => (
                    <div key={i} className="shrink-0 snap-center w-full md:w-134.5">
                        {child}
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
                {/* Dot indicators */}
                <div className="flex items-center gap-1">
                    {children.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`h-2 rounded-full transition-all duration-500 ease-linear border border-gray-50 p-0.5 ${i === currentIndex ? 'bg-gray-800 w-4' : 'bg-gray-300 w-2'
                                }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>

                {/* Arrow buttons */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => scrollTo(currentIndex - 1)}
                        disabled={currentIndex === 0}
                        className="size-8 rounded-full bg-white border border-gray-25 flex items-center justify-center disabled:opacity-30 hover:bg-gray-100 transition"
                        aria-label="Previous"
                    >
                        <ArrowLeft color="#437EF7" size={16} />
                    </button>
                    <button
                        onClick={() => scrollTo(currentIndex + 1)}
                        disabled={currentIndex === total - 1}
                        className="size-8 rounded-full bg-white border border-gray-25 flex items-center justify-center disabled:opacity-30 hover:bg-gray-100 transition"
                        aria-label="Next"
                    >
                        <ArrowRight color="#437EF7" size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
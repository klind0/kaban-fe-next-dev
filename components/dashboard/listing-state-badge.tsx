import { ListingState } from "@/types/listingTypes";

const STATE_CONFIG: Record<ListingState, { label: string; className: string }> =
{
    PUBLISHED: {
        label: "Published",
        className: "bg-[var(--color-green-600)]/10 text-[var(--color-green-600)]",
    },
    DRAFT: {
        label: "Draft",
        className: "bg-gray-50/10 text-gray-50",
    },
    PENDING_APPROVAL: {
        label: "Pending",
        className: "bg-[var(--color-amber-50)] text-[var(--color-amber-600)]",
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-red-100 text-red-500",
    },
    EXPIRED: {
        label: "Expired",
        className: "bg-red-100 text-red-600",
    },
};

interface ListingStateBadgeProps {
    state: ListingState;
}

export default function ListingStateBadge({ state }: ListingStateBadgeProps) {
    const { label, className } = STATE_CONFIG[state] ?? STATE_CONFIG.DRAFT;

    return (
        <div
            className={`w-fit h-fit text-[10px] sm:text-xs font-semibold rounded-[5px] p-1.5 md:p-2 ${className}`}
        >
            ● {label}
        </div>
    );
}

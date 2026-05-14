import { ListingState } from "@/types/listingTypes";

const STATE_CONFIG: Record<ListingState, { label: string; className: string }> =
{
    PUBLISHED: {
        label: "Published",
        className: "bg-[#41AE49]/10 text-[#41AE49]",
    },
    DRAFT: {
        label: "Draft",
        className: "bg-gray-50/10 text-gray-50",
    },
    PENDING_APPROVAL: {
        label: "Pending",
        className: "bg-[#FFF8EB] text-[#EEA23E]",
    },
    REJECTED: {
        label: "Rejected",
        className: "bg-red-100 text-red-500",
    },
    EXPIRED: {
        label: "Expired",
        className: "bg-orange-100 text-orange-500",
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

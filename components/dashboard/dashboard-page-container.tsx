interface DashboardNavbarProps {
    children?: React.ReactNode;
    className?: string;

}

export default function DashboardPageContainer({ children, className }: DashboardNavbarProps) {
    return (
        <section className={`pb-8 px-4 mt-18 md:px-8 lg:mt-0 max-h-[calc(100vh-88px)] overflow-y-auto ${className ? className : ''}`}>
            {children}
        </section>
    )
}

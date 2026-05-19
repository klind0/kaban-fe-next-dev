interface FormCardProps {
    title: React.ReactNode;
    children?: React.ReactNode;
}

export default function FormCard({ title, children }: FormCardProps) {
    return (
        <div className='p-4 md:p-8 space-y-6 rounded-[10px] border border-neutral-600'>
            <h3 className="text-black text-2xl font-semibold">{title}</h3>
            {children}
        </div>
    )
}

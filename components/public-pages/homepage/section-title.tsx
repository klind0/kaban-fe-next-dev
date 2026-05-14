interface SectionTitleProps {
    title: string;
    subtitle: string;
}

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
    return (
        <div className='flex flex-col items-center'>
            <h3 className='text-2xl md:text-[36px] text-center text-primary font-bold'>{title}</h3>
            <div className="max-w-95 flex justify-center">
                <span className='text-center md:text-xl'>{subtitle}</span>
            </div>
        </div>
    )
}

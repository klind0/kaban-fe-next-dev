import SectionTitle from "./section-title";
import CommercialBg from "@/app/assets/images/commercial.webp"
import ResidentialBg from "@/app/assets/images/residential.webp"
import IndustrialBg from "@/app/assets/images/industrial.webp"

interface PropertyTypeCardProps {
  title: string;
  items: string[];
}

export default function PropertyTypesSection() {
  return (
    <section className='bg-neutral-25'>
      <div className='container mx-auto px-4 2xl:px-0 py-8 md:py-16'>
        <SectionTitle title="Property Types" subtitle="Explore property listings Nationwide under these categories" />
        <div className="mt-16 space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <PropertyTypeCard
              title="Commercial"
              items={["Land", "Office", "Mall", "Gas Station", "School"]}
            />
            <PropertyTypeCard
              title="Industrial"
              items={["Factory", "Oil Rig", "Power Plant", "Warehouse"]}
            />
          </div>
          <PropertyTypeCard
            title="Residential"
            items={["Self Contain", "Apartment", "Detached House", "Terraced House", "Semi-Detached House"]}
          />
        </div>
      </div>
    </section >
  )
}

function PropertyTypeCard({ title, items }: PropertyTypeCardProps) {
  return (
    <div className="w-full h-65 lg:h-125 rounded-3xl bg-neutral-600 overflow-hidden" style={{ backgroundImage: `url(${title === "Commercial" ? CommercialBg.src : title === "Industrial" ? IndustrialBg.src : ResidentialBg.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-[#00000027] w-full h-full p-4 flex justify-center items-end md:justify-start">
        <div className="bg-[#00000066] border border-[#FFFFFF33] p-4 rounded-xl" style={{ backdropFilter: 'blur(25px)' }}>
          <h4 className="uppercase text-white text-lg font-bold">{title}</h4>
          <ul className="flex flex-wrap text-white space-x-1 text-xs font-medium">
            {items.map((item, index) => (
              <li key={index} className="whitespace-nowrap list-disc list-inside first:list-none">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

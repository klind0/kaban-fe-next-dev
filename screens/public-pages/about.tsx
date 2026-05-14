"use client"
import smilingCoupleImg from '@/app/assets/images/smiling-couple.jpeg'
import aboutUsImg from '@/app/assets/images/about-us-img.jpeg'
import { Grommet } from '@/components/icons/grommet'
import { Transparency } from '@/components/icons/transparency'
import { UserLight } from '@/components/icons/user-light'
import Image from 'next/image'
import Headline from '@/components/public-pages/aboutpage/Headline'

export default function AboutUsSection() {
  return (
      <section className={`flex flex-col items-center py-10 px-5 mt-10 gap-1 pb-14`}>
        <div className={'text-center max-w-160 mb-5 flex flex-col items-center'}>
          <h3 className='text-4xl font-bold mb-2 text-black w-full max-w-120'>Every Property Tells a Unique Story.</h3>
          <p className=''>We are committed to streamlining your property search, offering a diverse range of property options, and ensuring a stress-free experience to enhance your satisfaction.</p>
        </div>
        <div className={`flex flex-col md:flex-row py-10 gap-10 md:gap-20 justify-self-center md:max-w-240 items-center`}>
          <h3 className='font-bold text-3xl text-black md:hidden'>Our Vision</h3>
          <div className='rounded-b-full rounded-t-full overflow-hidden md:h-120 md:max-w-[24rem]'>
            <Image src={aboutUsImg} alt='foo' className={'w-full h-full object-[58%_center] object-cover'} />
          </div>
          <div className={`flex flex-col items-center text-center gap-1 md:max-w-108`}>
            <h3 className='font-bold text-3xl text-black max-md:hidden'>Our Vision</h3>
            <p>To make real estate accessible and stress-free yet authenticated and validated, ensuring that finding a comfortable property is no longer a luxury but a reality for everyone.</p>
          </div>
        </div>

        <div className={`flex flex-col md:flex-row py-10 gap-10 md:gap-20 justify-self-center md:max-w-240 items-center`}>
          <div className={`flex flex-col items-center text-center gap-1 md:max-w-108`}>
            <h3 className='font-bold text-3xl text-black'>Our Mission</h3>
            <p className='max-md:hidden'>To streamline the process of discovering, acquiring, and marketing real estate properties, ensuring a hassle-free journey towards your real estate goals.</p>
          </div>
          <div className='rounded-b-full rounded-t-full overflow-hidden min-w-[18rem] max-h-60 md:max-h-none md:h-120 md:max-w-[24rem]'>
            <Image src={smilingCoupleImg} alt='foo' className={'w-full h-full object-[58%_center] object-cover'} />
          </div>
            <p className='md:hidden'>To streamline the process of discovering, acquiring, and marketing real estate properties, ensuring a hassle-free journey towards your real estate goals.</p>
        </div>

        <div className={`flex flex-col items-center mt-5 mb-10 max-w-280`}>
          <div className={`flex flex-col items-center mb-14 max-w-200`}>
            <h3 className='text-center text-black font-bold text-3xl'>Our Values</h3>
            <p className='text-center mb-5'>At our core, we hold three values dear: User-Centricity, Innovation, and Transparency. These values are not just words; they are the compass that directs our actions and decisions. They define how we collaborate, engage with our community, and set our aspiration</p>
          </div>
          <div className={`flex flex-col md:flex-row gap-3`}>
            <div className="flex flex-col items-center gap-1">
              <UserLight className='text-black' width='3rem' height='3rem' />
              <h4 className='font-bold text-black'>User-Centricity</h4>
              <p className='text-center'>We place you at the centre of our strategy, operations, and culture, recognizing that by meeting and exceeding you expectations, we can achieve sustainable success and growth.</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Grommet className='text-black' height='3rem' />
              <h4 className='font-bold text-black'>Innovation</h4>
              <p className='text-center'>We are commitment to fostering creativity, embracing change, and continuously seeking fresh, inventive solutions to meet your evolving  needs and stay at the forefront of industry advancements.</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Transparency className='text-black' width='3rem' height='3rem' />
              <h4 className='font-bold text-black'>User-Centricity</h4>
              <p className='text-center'>We place you at the centre of our strategy, operations, and culture, recognizing that by meeting and exceeding you expectations, we can achieve sustainable success and growth.</p>
            </div>
          </div>
        </div>
        <div className={`mt-2 ${''}`}>
          <h3 className='text-center font-bold my-10 text-3xl text-black'>Headlines from our blog</h3>
          <div className='grid gap-y-4'>
						<hr />
						{[1,2,3].map(item => (
						  <div key={item} className='flex flex-col gap-4'>
							  <Headline  />
						    <hr />
						  </div>
					  ))}
					</div>
        </div>
      </section>
  )
}

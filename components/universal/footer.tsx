import Link from "next/link";
import { Facebook } from "../icons/facebook";
import { Instagram } from "../icons/instagram";
import { Linkedin } from "../icons/linkedin";
import { Logo } from "../icons/Logo";
import { TwitterX } from "../icons/twitterX";

export default function Footer() {

    const socials = [
        { name: "Facebook", href: "https://www.facebook.com/kabanrealestate", icon: Facebook },
        { name: "Twitter", href: "https://twitter.com/kabanrealestate", icon: TwitterX },
        { name: "Instagram", href: "https://www.instagram.com/kabanrealestate/", icon: Instagram },
        { name: "LinkedIn", href: "https://www.linkedin.com/company/kabanrealestate/", icon: Linkedin },
    ]

    const footerLinks = [
        {
            title: "Company",
            links: [
                { name: "About Us", href: "/about-us" },
                { name: "Contact", href: "/contact-us" },
                { name: "FAQs", href: "/faqs" },
                { name: "Blogs", href: "/blogs" },
            ]
        },
        {
            title: "Property",
            links: [
                { name: "Residential", href: "/residential" },
                { name: "Commercial", href: "/commercial" },
                { name: "Industrial", href: "/industrial" },
            ]
        },
        {
            title: "Realtors",
            links: [
                { name: "Agencies", href: "/agencies" },
                { name: "Agents", href: "/agents" },
            ]
        },
        {
            title: "Contact",
            links: [
                { name: "+234916 393 9777", href: "tel:+2349163939777" },
                { name: "Uyo, Akwa Ibom State", href: "https://goo.gl/maps/xyz" },
                { name: "info@kaban.ng", href: "mailto:info@kaban.ng" },
            ]
        },
    ]

    return (
        <footer className="bg-primary text-white">
            <div className="container mx-auto px-4 2xl:px-0 py-8 md:py-16">
                <div className="flex gap-16 flex-col lg:flex-row">
                    <div className="w-full max-w-78.75 space-y-8">
                        <div className="flex flex-col gap-4">
                            <Logo />
                            <div className="w-full">
                                <p>As we strive to make real estate accessible and stress-free, Kaban welcomes our valued customers seeking rental or investment opportunities. </p>
                            </div>
                        </div>
                        <div className="flex space-x-6">
                            {socials.map((social, index) => (
                                <Link key={index} href={social.href} className="flex items-center justify-center p-2 bg-white text-primary rounded-full size-10">
                                    <social.icon />
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                        {footerLinks.map((item, index) => (
                            <div key={index} className="mt-4 sm:pt-0">
                                <h4 className="font-semibold text-lg">{item.title}</h4>
                                <ul className="flex flex-col gap-2 mt-2">
                                    {item.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <Link href={link.href} className="text-sm font-medium hover:underline">{link.name}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-16">
                    <hr />
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <small>&copy; {new Date().getFullYear()} Kaban.ng. All rights reserved.</small>
                        <div className="flex gap-4">
                            <Link href="/terms-of-service" className="text-sm hover:underline">Terms of Service</Link>
                            <Link href="/privacy-policy" className="text-sm hover:underline">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

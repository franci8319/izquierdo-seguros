import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import AboutUs from "@/components/sections/AboutUs";
import InsuranceProducts from "@/components/sections/InsuranceProducts";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Contact from "@/components/sections/Contact";
import BannerModal from "@/components/BannerModal";
import { getSiteContent } from "@/lib/content";

export default function Home() {
  const content = getSiteContent();

  return (
    <>
      <BannerModal banner={content.banner} />
      <Header contact={content.contact} />
      <main>
        <Hero hero={content.hero} heroImage={content.images.hero} contact={content.contact} />
        <AboutUs aboutUs={content.aboutUs} aboutImage={content.images.about} />
        <InsuranceProducts seguros={content.seguros} />
        <WhyChooseUs whyChooseUs={content.whyChooseUs} />
        <Contact contact={content.contact} />
      </main>
      <Footer contact={content.contact} legal={content.legal} />
    </>
  );
}

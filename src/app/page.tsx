import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import AboutUs from "@/components/sections/AboutUs";
import InsuranceProducts from "@/components/sections/InsuranceProducts";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AboutUs />
        <InsuranceProducts />
        <WhyChooseUs />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

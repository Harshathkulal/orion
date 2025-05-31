import CookieConsent from "@/components/cookie-card";
import Features from "@/components/feature";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <Features/>
      <CookieConsent/>
    </div>
  );
}

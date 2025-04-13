import Hero from "@/components/chat";
import CookieConsent from "@/components/cookie-card";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen max-h-screen">
      <Navbar />
      <Hero />
      <CookieConsent/>
    </div>
  );
}

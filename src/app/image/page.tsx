import CookieConsent from "@/components/cookie-card";
import ImagePage from "@/components/image";
import Navbar from "@/components/navbar";

export default function ImageRoute() {
  return (
    <div className="flex flex-col min-h-screen max-h-screen">
      <Navbar />
      <ImagePage />
      <CookieConsent/>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-mocha-950 rounded-full blur-3xl transform scale-125 animate-gradient" />

      <div className="container mx-auto text-center relative z-10 max-w-7xl">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-mocha-900/50 border border-orange-500/20 rounded-full mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-orange-500 mr-2" />
          <span className="text-sm text-mocha-100">Powered by Gemini 1.5</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up [animation-delay:200ms]">
          <span className="text-white">Chat. Image.</span>
          <br />
          <span className="text-white">Pdf Summarize. </span>
          <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
            All Built In
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-mocha-200 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:400ms]">
          Generate code, chat, create images from text, and get contextual
          summaries of any PDF — all in one workspace.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up [animation-delay:600ms]">
          <Link href="/chat">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-6 text-lg group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Chat
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
          <Link href="/rag">
            <Button
              variant="outline"
              size="lg"
              className="border-mocha-600 text-mocha-200 hover:bg-mocha-800 hover:text-white px-8 py-6 text-lg transition-colors"
            >
              PDF Summarize
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;

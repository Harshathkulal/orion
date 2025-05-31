import { Image, FileText, MessageSquare, Zap, Shield, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Features = () => {
  const mainFeatures = [
    {
      icon: Image,
      title: "Image Chat",
      description: "Upload and chat about images with advanced AI vision. Analyze, describe, and get insights from any visual content.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: FileText,
      title: "PDF Summarization",
      description: "Extract key insights from documents instantly. Our AI reads and summarizes PDFs, making information digestible.",
      gradient: "from-orange-500 to-yellow-500",
    },
    {
      icon: MessageSquare,
      title: "RAG Technology",
      description: "Retrieval-Augmented Generation for accurate, context-aware responses based on your uploaded documents.",
      gradient: "from-orange-500 to-pink-500",
    },
  ];

  const additionalFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get responses in milliseconds with our optimized AI infrastructure.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and never stored longer than necessary.",
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Chat in over 50 languages with native understanding.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful Features for
            <span className="gradient-text"> Smart Conversations</span>
          </h2>
          <p className="text-xl text-mocha-200 max-w-2xl mx-auto">
            Experience the future of AI-powered communication with our cutting-edge features
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="bg-mocha-900/50 border-mocha-700 hover:border-orange-500/50 transition-all duration-300 group hover:transform hover:scale-105"
            >
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mx-auto mb-4 flex items-center justify-center group-hover:animate-float`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white mb-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-mocha-200 text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8">
          {additionalFeatures.map((feature, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-xl bg-mocha-900/30 border border-mocha-800 hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 mx-auto mb-4 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-mocha-300 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
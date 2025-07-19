import { FileText, MessageSquare, Shield } from "lucide-react";

const Features = () => {
  const mainFeatures = [
    {
      icon: FileText,
      title: "PDF Summarization",
      description:
        "Retrieval-Augmented Generation (RAG) for accurate, context-aware responses based on your uploaded documents.",
      gradient: "from-orange-500 to-yellow-500",
    },
    {
      icon: MessageSquare,
      title: "Chat and Image generation",
      description:
        "Ask questions. get answers, code, in text format and Generate Images from text prompt and download them",
      gradient: "from-orange-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your data is encrypted and never stored longer than necessary.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Some Features for
            <span className="gradient-text"> Smart Conversations</span>
          </h2>
          <p className="text-xl text-mocha-200 max-w-2xl mx-auto">
            Under the hood, we use the Google Gemini AI models to make sure you
            get the best possible experience.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-mocha-900/30 border border-mocha-800 hover:border-orange-500/30 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-500/20 mx-auto mb-4 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-mocha-300 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

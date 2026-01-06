import { Upload, Zap, Quote, Headphones } from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Upload your sources",
    description: "Upload PDFs, websites, YouTube videos, audio files, and more. Interact will summarize them and make interesting connections between topics.",
  },
  {
    icon: Zap,
    title: "Instant insights",
    description: "With all of your sources in place, Interact becomes a personalized AI expert in the information that matters most to you.",
  },
  {
    icon: Quote,
    title: "See the source, not just the answer",
    description: "Gain confidence in every response because Interact provides clear citations for its work, showing you the exact quotes from your sources.",
  },
  {
    icon: Headphones,
    title: "Listen and learn on the go",
    description: "Our Audio Overview feature can turn your sources into engaging 'Deep Dive' discussions with one click.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 opacity-0 animate-fade-in">
          Your AI-Powered Research Partner
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16 opacity-0 animate-fade-in animation-delay-100">
          Transform how you research, learn, and create with intelligent assistance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 bg-card rounded-2xl border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

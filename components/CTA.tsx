import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-8 opacity-0 animate-scale-in">
            <Sparkles className="w-8 h-8 text-accent-foreground" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 opacity-0 animate-fade-in animation-delay-100">
            Ready to understand{" "}
            <span className="text-gradient">anything</span>?
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in animation-delay-200">
            Start transforming the way you research, learn, and create. 
            Your AI-powered research partner is waiting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in animation-delay-300">
            <Button size="lg" className="text-base px-8 py-6 gap-2">
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 py-6">
              Learn more
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

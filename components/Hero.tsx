import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6  animate-fade-in">
          Understand{" "}
          <span className="text-gradient">Anything</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10  animate-fade-in animation-delay-200">
          Your research and thinking partner, grounded in the information you trust, 
          built with the latest AI models.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center  animate-fade-in animation-delay-300">
          <Button size="lg" className="text-base px-8 py-6 gap-2">
            Try Interact
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8 py-6">
            Get the app
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

const testimonials = [
  {
    quote: "NotebookLM Blew Our Mind",
    source: "HardFork",
  },
  {
    quote: "This could be the next killer app in generative AI",
    source: "CNBC",
  },
  {
    quote: "NotebookLM is a glimpse into AI's future in the workplace",
    source: "Barron's",
  },
  {
    quote: "It's one of the most compelling and completely flabbergasting demonstrations of AI's potential yet.",
    source: "WSJ",
  },
  {
    quote: "NotebookLM is a beautiful way to walk through information space",
    source: "The Verge",
  },
  {
    quote: "This is touching on a whole new territory of highly compelling LLM product formats.",
    source: "Andrej Karpathy",
  },
];

const TestimonialCard = ({ quote, source }: { quote: string; source: string }) => (
  <div className="flex-shrink-0 w-80 md:w-96 p-6 mx-4 bg-card rounded-2xl border border-border hover:border-accent/50 transition-colors duration-300">
    <blockquote className="text-foreground font-medium mb-4 line-clamp-3">
      "{quote}"
    </blockquote>
    <cite className="text-muted-foreground text-sm not-italic">— {source}</cite>
  </div>
);

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-secondary/50 overflow-hidden">
      <div className="container mx-auto px-6 mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 opacity-0 animate-fade-in">
          What people are saying
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto opacity-0 animate-fade-in animation-delay-100">
          Industry leaders and publications share their experience with NotebookLM.
        </p>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* First row - left to right */}
        <div className="flex animate-marquee mb-6">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <TestimonialCard key={`row1-${index}`} {...testimonial} />
          ))}
        </div>

        {/* Second row - right to left */}
        <div className="flex animate-marquee-reverse">
          {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map((testimonial, index) => (
            <TestimonialCard key={`row2-${index}`} {...testimonial} />
          ))}
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-secondary/50 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-secondary/50 to-transparent pointer-events-none" />
      </div>
    </section>
  );
};

export default Testimonials;

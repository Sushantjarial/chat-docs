import { GraduationCap, LayoutList, Lightbulb } from "lucide-react";

const useCases = [
  {
    icon: GraduationCap,
    title: "Power study",
    description: "Upload lecture recordings, textbook chapters, and research papers. Ask Interact to explain complex concepts in simple terms.",
    tagline: "Learn faster and deeper.",
  },
  {
    icon: LayoutList,
    title: "Organize your thinking",
    description: "Upload your source material and let Interact create a polished presentation outline, complete with key talking points.",
    tagline: "Present with confidence.",
  },
  {
    icon: Lightbulb,
    title: "Spark new ideas",
    description: "Upload brainstorming notes and market research. Ask Interact to identify trends and generate new product ideas.",
    tagline: "Unlock your creative potential.",
  },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4 opacity-0 animate-fade-in">
          How people are using Interact
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-16 opacity-0 animate-fade-in animation-delay-100">
          From students to professionals, discover how NotebookLM transforms workflows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.title}
              className="group text-center p-8 rounded-2xl hover:bg-secondary/50 transition-all duration-300 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-6 group-hover:gradient-bg group-hover:scale-110 transition-all duration-300">
                <useCase.icon className="w-8 h-8 text-foreground group-hover:text-accent-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{useCase.title}</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">{useCase.description}</p>
              <p className="text-accent font-medium">{useCase.tagline}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;

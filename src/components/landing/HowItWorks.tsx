
import { Key, LayoutGrid, Settings, MessageSquare } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Key,
      title: "Add API Keys",
      description: "Securely add and encrypt your API keys for OpenAI and DeepSeek."
    },
    {
      icon: LayoutGrid,
      title: "Choose Models",
      description: "Select from OpenAI's flagship models or use split view to compare models."
    },
    {
      icon: Settings,
      title: "Configure Settings",
      description: "Customize settings for memory usage, temperature, and reasoning depth."
    },
    {
      icon: MessageSquare,
      title: "Start Chatting",
      description: "Begin enhanced conversations with powerful reasoning capabilities."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-muted/25">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How it works
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 rounded-full bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-full mr-2">
                        Step {index + 1}
                      </span>
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

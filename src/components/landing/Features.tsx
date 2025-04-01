
import { Key, Brain, BarChart2, Database, FileDown } from 'lucide-react';
import FeatureCard from './FeatureCard';

const Features = () => {
  const features = [
    {
      icon: Key,
      title: "Your Keys, Your Data",
      description: "Use your own API keys with full control of your data. No data is stored on any server."
    },
    {
      icon: Brain,
      title: "Enhanced Reasoning",
      description: "Leverage DeepSeek's reasoning capabilities to enhance responses from OpenAI models."
    },
    {
      icon: BarChart2,
      title: "Model Comparison",
      description: "Compare responses from different models side-by-side to see how they perform."
    },
    {
      icon: Database,
      title: "Smart Memory Control",
      description: "Control how much conversation history to include to optimize costs and maintain context."
    },
    {
      icon: FileDown,
      title: "Study Reasoning Process",
      description: "Download and analyze the reasoning process to understand how the AI reaches conclusions."
    }
  ];

  return (
    <section id="features" className="py-16 bg-muted/50">
      <div className="container px-4 mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Powerful Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.length % 3 === 2 ? (
            // For when we have 5 features (or any count where remainder is 2 when divided by 3)
            <>
              {/* First 3 features */}
              {features.slice(0, 3).map((feature, index) => (
                <div key={index}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </div>
              ))}
              
              {/* Last 2 features - centered */}
              <div className="lg:col-span-3 flex justify-center gap-6">
                {features.slice(3).map((feature, index) => (
                  <div key={index + 3} className="max-w-md">
                    <FeatureCard
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            // Regular layout for other counts
            features.map((feature, index) => (
              <div 
                key={index} 
                className={`${
                  features.length % 3 === 1 && index === features.length - 1 
                    ? "md:col-span-2 lg:col-span-3 max-w-md mx-auto" 
                    : ""
                }`}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Features;

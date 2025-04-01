
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="h-screen flex items-center justify-center pt-14">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Integrate Deepseek Reasoning
            </span>
            <br />
            with OpenAI Flagship Chat Models
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            A completely free, privacy-focused AI chat platform that combines the reasoning 
            capabilities of multiple foundation models.
          </p>
          
          <Button asChild size="lg" className="px-8 py-6 text-lg">
            <Link to="/chat">
              Start Chatting Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

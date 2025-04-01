
import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const scrollToHero = (e: React.MouseEvent) => {
    e.preventDefault();
    const heroSection = document.querySelector('section'); // First section is the hero
    heroSection?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <footer className="py-10 border-t">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <a 
              href="#" 
              onClick={scrollToHero} 
              className="text-lg font-semibold cursor-pointer"
            >
              ConnectLLM
            </a>
          </div>
          
          <div className="flex flex-wrap justify-center space-x-6 mb-4 md:mb-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © {currentYear} ConnectLLM. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

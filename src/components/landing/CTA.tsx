
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/config");
  };

  return (
    <section className="py-16 bg-primary/5">
      <div className="container text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to experience the next generation of AI chat?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Get started with ConnectLLM today and see the difference in your AI interactions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleGetStarted}>
            Get Started Now
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/chat")}>
            Try Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;

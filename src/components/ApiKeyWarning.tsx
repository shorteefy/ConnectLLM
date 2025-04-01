
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ApiKeyWarningProps {
  message: string;
}

const ApiKeyWarning: React.FC<ApiKeyWarningProps> = ({ message }) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="flex items-center gap-2">API Key Required</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">{message}</p>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/config">Go to Configuration</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Get OpenAI Key</a>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ApiKeyWarning;

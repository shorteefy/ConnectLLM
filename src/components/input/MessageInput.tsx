
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  input: string;
  setInput: (input: string) => void;
  isWaiting: boolean;
  handleSend: () => void;
  hasSelectedFiles: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  isWaiting,
  handleSend,
  hasSelectedFiles
}) => {
  return (
    <Textarea
      value={input}
      onChange={(e) => !isWaiting && setInput(e.target.value)}
      placeholder={
        isWaiting 
          ? "Waiting for response..." 
          : "Type a message..."
      }
      className="flex-1 min-h-[40px] sm:min-h-[50px] text-sm sm:text-base max-h-[150px] sm:max-h-[200px] resize-y"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey && !isWaiting) {
          e.preventDefault();
          if (input.trim() || hasSelectedFiles) {
            handleSend();
          }
        }
      }}
      disabled={isWaiting}
    />
  );
};

export default MessageInput;

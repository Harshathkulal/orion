import React from 'react';

interface WelcomeMessageProps {
  isRag?: boolean;
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ isRag }) => (
  <div className="h-full flex items-center justify-center text-center p-4">
    <div>
      <h1 className="text-2xl font-semibold mb-2">{isRag ? 'RAG Chat' : 'Welcome!'}</h1>
      <p className="text-primary/60">
        {isRag ? 'Ask questions about your documents!' : 'How can I help you today?'}
      </p>
    </div>
  </div>
); 
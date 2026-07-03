import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface Props {
  text: string;
}

export const CopyButton: React.FC<Props> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
 <button onClick={handleCopy} className="p-2 rounded-8 hover:bg-white/5 text-text-dim hover:text-text-main transition-colors" aria-label="Copy to clipboard">
 {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
    </button>
  );
};

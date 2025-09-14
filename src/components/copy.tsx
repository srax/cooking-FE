import React, { useState } from 'react';
import { IoMdCheckmark } from "react-icons/io";
import { BiSolidCopy } from "react-icons/bi";

interface CopyButtonProps {
    content: string; 
    size?: 'sm' | 'md' | 'lg'; 
    className?: string; 
    buttonText?: string; 
  }
  
  const CopyButton: React.FC<CopyButtonProps> = ({
    content,
    size = 'md',
    className = '',
    buttonText = 'Copy',
  }) => {
    const [copied, setCopied] = useState(false);
  
    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };
  

  
    return (
      <button onClick={handleCopy} className={className}>
        {copied ? (
          <>
            <IoMdCheckmark className={className} />
          </>
        ) : (
          <>
            <BiSolidCopy className={className} />
          </>
        )}
      </button>
    );
  };
  
  export default CopyButton;
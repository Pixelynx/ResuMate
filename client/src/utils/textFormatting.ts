import { ClipboardEvent } from 'react';

/**
 * Formats text to preserve bullet points and list formatting
 * Handles various bullet point characters and list markers
 */
export const formatBulletPoints = (text: string): string => {
  // Replace common bullet point characters with a standardized bullet
  const standardizedText = text.replace(/[•●■◆◇○●]/g, '•');
  
  // Handle hyphen or dash lists
  const withHyphens = standardizedText.replace(/^\s*[-–—]\s+/gm, '• ');
  
  // Handle numbered lists (1., 1), etc.)
  const withNumbers = withHyphens.replace(/^\s*\d+[.)]\s+/gm, '• ');
  
  return withNumbers;
};

/**
 * Handles paste events to preserve bullet points and formatting
 */
export const handlePasteWithBullets = (e: ClipboardEvent<HTMLTextAreaElement>): string => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData('text');
  return formatBulletPoints(pastedText);
};

/**
 * Handles keydown events to support bullet point creation and navigation
 * Returns true if the event was handled, false otherwise
 */
export const handleBulletPointKeyDown = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  value: string
): { handled: boolean; newValue?: string } => {
  const textarea = e.currentTarget;
  const { selectionStart, selectionEnd } = textarea;
  
  // Get the current line
  const lines = value.split('\n');
  let currentLineIndex = 0;
  let currentPosition = 0;
  
  for (let i = 0; i < lines.length; i++) {
    currentPosition += lines[i].length + 1; // +1 for newline
    if (currentPosition > selectionStart) {
      currentLineIndex = i;
      break;
    }
  }
  
  const currentLine = lines[currentLineIndex];
  
  // Handle Enter key for creating new bullet points
  if (e.key === 'Enter') {
    // If current line starts with a bullet point, add a new one
    if (currentLine.trimStart().startsWith('•')) {
      e.preventDefault();
      
      // If line is empty except for bullet, remove the bullet
      if (currentLine.trim() === '•') {
        lines[currentLineIndex] = '';
      } else {
        // Add new bullet point
        const indent = currentLine.match(/^\s*/)?.[0] || '';
        lines.splice(currentLineIndex + 1, 0, `${indent}• `);
      }
      
      return {
        handled: true,
        newValue: lines.join('\n')
      };
    }
  }
  
  // Handle Tab key for indentation
  if (e.key === 'Tab') {
    e.preventDefault();
    
    if (e.shiftKey) {
      // Decrease indentation
      if (currentLine.startsWith('    ')) {
        lines[currentLineIndex] = currentLine.slice(4);
      }
    } else {
      // Increase indentation
      lines[currentLineIndex] = '    ' + currentLine;
    }
    
    return {
      handled: true,
      newValue: lines.join('\n')
    };
  }
  
  // Handle hyphen conversion to bullet point
  if (e.key === ' ' && currentLine.trim() === '-') {
    e.preventDefault();
    lines[currentLineIndex] = currentLine.replace('-', '•');
    return {
      handled: true,
      newValue: lines.join('\n')
    };
  }
  
  return { handled: false };
};

/**
 * Processes text content for display, preserving bullet points and formatting
 */
export const processTextForDisplay = (text: string): string => {
  if (!text) return '';
  
  // Ensure consistent bullet point character
  const withBullets = text.replace(/[•●■◆◇○●]/g, '•');
  
  // Add proper spacing after bullet points
  return withBullets.replace(/•(?!\s)/g, '• ');
}; 
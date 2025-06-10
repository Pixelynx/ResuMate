import React, { useRef } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

type BulletPointTextFieldProps = Omit<TextFieldProps, 'onChange' | 'multiline' | 'inputRef'> & {
  onChange: (value: string) => void;
};

const BulletPointTextField = React.forwardRef<HTMLDivElement, BulletPointTextFieldProps>(({
  value,
  onChange,
  ...props
}, ref) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const setCursorPosition = (position: number) => {
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.setSelectionRange(position, position);
        textAreaRef.current.focus();
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const { value: currentValue, selectionStart, selectionEnd } = target;

    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const lines = currentValue.split('\n');
      const currentLineIndex = currentValue.substring(0, selectionStart).split('\n').length - 1;
      const currentLine = lines[currentLineIndex];
      
      // Check if current line is a bullet point
      const bulletMatch = currentLine.match(/^(\s*)• (.*)$/);
      
      if (bulletMatch) {
        const [, indent, content] = bulletMatch;
        
        // If bullet has content, create new bullet
        if (content.trim()) {
          const beforeCursor = currentValue.substring(0, selectionStart);
          const afterCursor = currentValue.substring(selectionEnd);
          const newValue = beforeCursor + '\n' + indent + '• ' + afterCursor;
          onChange(newValue);
          setCursorPosition(selectionStart + indent.length + 3);
        } else {
          // Empty bullet - remove it and create normal line
          const beforeLine = lines.slice(0, currentLineIndex).join('\n');
          const afterLine = lines.slice(currentLineIndex + 1).join('\n');
          const newValue = beforeLine + (beforeLine ? '\n' : '') + (afterLine ? '\n' + afterLine : '');
          onChange(newValue);
          setCursorPosition(beforeLine.length + (beforeLine ? 1 : 0));
        }
      } else {
        // Normal enter behavior
        const beforeCursor = currentValue.substring(0, selectionStart);
        const afterCursor = currentValue.substring(selectionEnd);
        const newValue = beforeCursor + '\n' + afterCursor;
        onChange(newValue);
        setCursorPosition(selectionStart + 1);
      }
      return;
    }

    // Handle Space key for bullet creation
    if (e.key === ' ') {
      const beforeCursor = currentValue.substring(0, selectionStart);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Check if we're at the start of a line with just a hyphen
      if (currentLine === '-' || currentLine.match(/^\s*-$/)) {
        e.preventDefault();
        const beforeCurrentLine = lines.slice(0, -1).join('\n');
        const afterCursor = currentValue.substring(selectionEnd);
        const indent = currentLine.match(/^(\s*)-$/)?.[1] || '';
        const newValue = (beforeCurrentLine ? beforeCurrentLine + '\n' : '') + indent + '• ' + afterCursor;
        onChange(newValue);
        setCursorPosition((beforeCurrentLine ? beforeCurrentLine.length + 1 : 0) + indent.length + 2);
        return;
      }
    }

    // Handle Backspace for bullet removal
    if (e.key === 'Backspace') {
      const beforeCursor = currentValue.substring(0, selectionStart);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Check if we're at the start of a bullet point
      if (currentLine.match(/^\s*• $/) && selectionStart === selectionEnd) {
        e.preventDefault();
        const beforeCurrentLine = lines.slice(0, -1).join('\n');
        const afterCursor = currentValue.substring(selectionStart);
        const newValue = (beforeCurrentLine ? beforeCurrentLine + '\n' : '') + afterCursor;
        onChange(newValue);
        setCursorPosition(beforeCurrentLine ? beforeCurrentLine.length + 1 : 0);
        return;
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const target = e.target as HTMLTextAreaElement;
    const { value: currentValue, selectionStart, selectionEnd } = target;
    
    // Process pasted text to convert hyphens to bullets
    const processedText = pastedText
      .split('\n')
      .map(line => {
        // Convert lines that start with "- " (hyphen + space) to bullet points
        if (line.match(/^(\s*)-\s+(.*)$/)) {
          return line.replace(/^(\s*)-\s+(.*)$/, '$1• $2');
        }
        return line;
      })
      .join('\n');
    
    const beforeCursor = currentValue.substring(0, selectionStart);
    const afterCursor = currentValue.substring(selectionEnd);
    const newValue = beforeCursor + processedText + afterCursor;
    
    onChange(newValue);
    setCursorPosition(selectionStart + processedText.length);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <TextField
      {...props}
      ref={ref}
      multiline
      value={value}
      onChange={handleChange}
      onPaste={handlePaste as any}
      onKeyDown={handleKeyDown as any}
      inputRef={textAreaRef}
      sx={{
        ...props.sx,
        '& .MuiInputBase-input': {
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }
      }}
    />
  );
});

BulletPointTextField.displayName = 'BulletPointTextField';

export default BulletPointTextField;
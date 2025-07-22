import React, { createContext, useContext, useState, useCallback } from 'react';
import InfoPopup from '../components/common/InfoPopup';

interface PopupContextType {
  showPopup: (props: PopupProps) => void;
  hidePopup: () => void;
}

interface PopupProps {
  title: string;
  content: React.ReactNode;
  storageKey?: string;
  showDontShowAgain?: boolean;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

export const PopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupProps, setPopupProps] = useState<PopupProps | null>(null);

  const showPopup = useCallback((props: PopupProps) => {
    // Check if this popup should be shown based on localStorage
    if (props.storageKey && localStorage.getItem(props.storageKey) === 'true') {
      return;
    }
    setPopupProps(props);
    setIsOpen(true);
  }, []);

  const hidePopup = useCallback(() => {
    setIsOpen(false);
    setPopupProps(null);
  }, []);

  return (
    <PopupContext.Provider value={{ showPopup, hidePopup }}>
      {children}
      {popupProps && (
        <InfoPopup
          open={isOpen}
          onClose={hidePopup}
          title={popupProps.title}
          content={popupProps.content}
          storageKey={popupProps.storageKey}
          showDontShowAgain={popupProps.showDontShowAgain}
        />
      )}
    </PopupContext.Provider>
  );
};

export default PopupContext; 
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePopup } from '../contexts/PopupContext';
import DashboardWelcomePopup from '../components/common/popups/DashboardWelcomePopup';
import CoverLetterNoticePopup from '../components/common/popups/CoverLetterNoticePopup';

// Storage keys for popups
const STORAGE_KEYS = {
  DASHBOARD_WELCOME: 'resumate_dashboard_welcome_seen',
  COVER_LETTER_NOTICE: 'resumate_cover_letter_notice_seen',
} as const;

export const useInfoPopups = () => {
  const location = useLocation();
  const { showPopup } = usePopup();

  useEffect(() => {
    // Show dashboard welcome popup
    if (location.pathname === '/dashboard') {
      showPopup({
        title: 'Welcome to ResuMate',
        content: React.createElement(DashboardWelcomePopup),
        storageKey: STORAGE_KEYS.DASHBOARD_WELCOME,
        showDontShowAgain: true,
      });
    }

    // Show cover letter notice popup
    if (location.pathname.startsWith('/cover-letter/new') || 
        location.pathname.startsWith('/cover-letter/from-resume')) {
      showPopup({
        title: 'Cover Letter Generator Notice',
        content: React.createElement(CoverLetterNoticePopup),
        storageKey: STORAGE_KEYS.COVER_LETTER_NOTICE,
        showDontShowAgain: true,
      });
    }
  }, [location.pathname, showPopup]);
};

export default useInfoPopups; 
import { useState, useEffect, useCallback, useMemo } from 'react';
import { CompatibilityAssessment } from '../types/mismatchTypes';
import { ContentGenerator } from '../services/contentGeneration';

interface MismatchContent {
  explanation: string;
  alternativeRoles: {
    title: string;
    reason: string;
    matchScore: number;
  }[];
}

interface ContentCache {
  [key: string]: MismatchContent;
}

interface UseMismatchContentReturn {
  content: MismatchContent | null;
  isLoading: boolean;
  error: string | null;
  regenerateContent: () => void;
}

/**
 * Hook for managing mismatch content generation with caching
 */
export const useMismatchContent = (
  assessment: CompatibilityAssessment | null,
  cacheTimeout = 5 * 60 * 1000 // 5 minutes default
): UseMismatchContentReturn => {
  const [content, setContent] = useState<MismatchContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache] = useState<ContentCache>({});

  // Generate cache key from assessment data
  const cacheKey = useMemo(() => {
    if (!assessment) return '';
    return JSON.stringify({
      id: assessment.metadata.assessmentTimestamp,
      score: assessment.compatibilityScore,
      skills: assessment.metadata.skillsMatch,
      missing: assessment.metadata.missingCriticalSkills,
    });
  }, [assessment]);

  /**
   * Check if cached content is still valid
   */
  const isValidCache = useCallback((key: string): boolean => {
    const cached = cache[key];
    if (!cached) return false;

    const timestamp = parseInt(key.split('-')[0], 10);
    return Date.now() - timestamp < cacheTimeout;
  }, [cache, cacheTimeout]);

  /**
   * Generate content for the current assessment
   */
  const generateContent = useCallback(async () => {
    if (!assessment) {
      setContent(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check cache first
      if (cacheKey && isValidCache(cacheKey)) {
        setContent(cache[cacheKey]);
        return;
      }

      // Simulate async operation for natural UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const explanation = ContentGenerator.generateMismatchExplanation(assessment);
      const alternativeRoles = ContentGenerator.generateAlternativeRoles(assessment);

      const newContent: MismatchContent = {
        explanation,
        alternativeRoles,
      };

      // Update cache
      if (cacheKey) {
        cache[cacheKey] = newContent;
      }

      setContent(newContent);
    } catch (err) {
      console.error('Error generating mismatch content:', err);
      setError('Failed to generate content. Please try again.');
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [assessment, cacheKey, isValidCache, cache]);

  /**
   * Force content regeneration
   */
  const regenerateContent = useCallback(() => {
    // Clear cache for current assessment
    if (cacheKey) {
      delete cache[cacheKey];
    }
    generateContent();
  }, [cacheKey, cache, generateContent]);

  // Generate content when assessment changes
  useEffect(() => {
    generateContent();
  }, [generateContent]);

  // Cleanup old cache entries periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      Object.keys(cache).forEach(key => {
        const timestamp = parseInt(key.split('-')[0], 10);
        if (now - timestamp >= cacheTimeout) {
          delete cache[key];
        }
      });
    };

    const interval = setInterval(cleanup, cacheTimeout);
    return () => clearInterval(interval);
  }, [cache, cacheTimeout]);

  return {
    content,
    isLoading,
    error,
    regenerateContent,
  };
}; 
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
  generatedAt: number; // Timestamp when content was generated
}

interface ContentCache {
  [key: string]: MismatchContent;
}

interface UseMismatchContentReturn {
  content: MismatchContent | null;
  isLoading: boolean;
  isGenerating: boolean; // Separate state for generation vs loading from cache
  error: string | null;
  regenerateContent: () => void;
  retryGeneration: () => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Hook for managing mismatch content generation with caching
 */
export const useMismatchContent = (
  assessment: CompatibilityAssessment | null,
  cacheTimeout = 5 * 60 * 1000 // 5 minutes default
): UseMismatchContentReturn => {
  const [content, setContent] = useState<MismatchContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [cache] = useState<ContentCache>({});

  // Generate cache key from assessment data
  const cacheKey = useMemo(() => {
    if (!assessment) return '';
    const keyData = {
      id: assessment.metadata.assessmentTimestamp,
      score: assessment.compatibilityScore,
      skills: [...assessment.metadata.skillsMatch].sort(),
      missing: [...assessment.metadata.missingCriticalSkills].sort(),
      experience: assessment.metadata.experienceMismatch,
      role: assessment.metadata.roleTypeMismatch,
    };
    return btoa(JSON.stringify(keyData));
  }, [assessment]);

  /**
   * Check if cached content is still valid
   */
  const isValidCache = useCallback((key: string): boolean => {
    const cached = cache[key];
    if (!cached) return false;
    return Date.now() - cached.generatedAt < cacheTimeout;
  }, [cache, cacheTimeout]);

  /**
   * Generate content with retry logic
   */
  const generateContentWithRetry = useCallback(async (retryAttempt = 0): Promise<MismatchContent> => {
    try {
      const explanation = ContentGenerator.generateMismatchExplanation(assessment!);
      const alternativeRoles = ContentGenerator.generateAlternativeRoles(assessment!);

      return {
        explanation,
        alternativeRoles,
        generatedAt: Date.now(),
      };
    } catch (err) {
      if (retryAttempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return generateContentWithRetry(retryAttempt + 1);
      }
      throw err;
    }
  }, [assessment]);

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

      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 300));

      const newContent = await generateContentWithRetry();

      // Update cache
      if (cacheKey) {
        cache[cacheKey] = newContent;
      }

      setContent(newContent);
      setRetryCount(0);
    } catch (err) {
      console.error('Error generating mismatch content:', err);
      setError('Failed to generate content. Please try again.');
      setContent(null);
      // Invalidate cache on error
      if (cacheKey) {
        delete cache[cacheKey];
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  }, [assessment, cacheKey, isValidCache, cache, generateContentWithRetry]);

  /**
   * Force content regeneration
   */
  const regenerateContent = useCallback(() => {
    if (cacheKey) {
      delete cache[cacheKey];
    }
    setRetryCount(0);
    generateContent();
  }, [cacheKey, cache, generateContent]);

  /**
   * Retry failed generation
   */
  const retryGeneration = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setRetryCount(prev => prev + 1);
      generateContent();
    }
  }, [retryCount, generateContent]);

  // Generate content when assessment changes
  useEffect(() => {
    generateContent();
  }, [generateContent]);

  // Cleanup old cache entries periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      Object.keys(cache).forEach(key => {
        const cached = cache[key];
        if (now - cached.generatedAt >= cacheTimeout) {
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
    isGenerating,
    error,
    regenerateContent,
    retryGeneration,
  };
}; 
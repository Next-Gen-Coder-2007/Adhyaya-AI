import { useState, useEffect, useRef } from 'react';

/**
 * Client-Side Intelligent Course Generation Progress Simulator
 * Computes realistic, smooth progress without repetitive database/API polling.
 */
export function useCourseProgress(courseStatus, createdAt) {
  const [progress, setProgress] = useState(() => (courseStatus === 'completed' ? 100 : 8));
  const [step, setStep] = useState('Initializing AI curriculum synthesis...');
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (courseStatus === 'completed') {
      setProgress(100);
      setStep('Course curriculum ready!');
      return;
    }

    if (courseStatus === 'failed') {
      setProgress(0);
      setStep('Generation failed');
      return;
    }

    // Determine starting timestamp from course createdAt if available
    if (createdAt) {
      const createdTime = new Date(createdAt).getTime();
      if (!isNaN(createdTime)) {
        startTimeRef.current = createdTime;
      }
    } else {
      startTimeRef.current = Date.now();
    }

    const interval = setInterval(() => {
      const elapsed = Math.max(0, (Date.now() - startTimeRef.current) / 1000);

      let currentPct = 8;
      let currentStep = 'Initializing AI curriculum synthesis...';

      if (elapsed < 4) {
        currentPct = Math.min(22, Math.round(8 + (elapsed / 4) * 14));
        currentStep = 'Extracting YouTube captions & timeline...';
      } else if (elapsed < 14) {
        const sub = (elapsed - 4) / 10;
        currentPct = Math.min(42, Math.round(22 + sub * 20));
        currentStep = 'Mapping 10-hour timeline outline & milestones...';
      } else if (elapsed < 45) {
        const sub = (elapsed - 14) / 31;
        currentPct = Math.min(78, Math.round(42 + sub * 36));
        currentStep = 'Synthesizing video lessons, quizzes & labs...';
      } else if (elapsed < 75) {
        const sub = (elapsed - 45) / 30;
        currentPct = Math.min(91, Math.round(78 + sub * 13));
        currentStep = 'Indexing semantic vectors for AI Tutor...';
      } else {
        // Asymptotic gentle advance towards 96%
        const extra = elapsed - 75;
        currentPct = Math.min(96, Math.round(91 + (1 - Math.exp(-extra / 40)) * 5));
        currentStep = 'Finalizing curriculum structure...';
      }

      setProgress(currentPct);
      setStep(currentStep);
    }, 500);

    return () => clearInterval(interval);
  }, [courseStatus, createdAt]);

  return { progress, step };
}

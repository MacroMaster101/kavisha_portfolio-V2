import { useContext } from 'react';
import { NarrationContext, NarrationProgressContext } from './narrationContextValue';

export function useNarration() {
  const context = useContext(NarrationContext);
  if (context === undefined) {
    throw new Error('useNarration must be used within a NarrationProvider');
  }
  return context;
}

export function useNarrationProgress() {
  return useContext(NarrationProgressContext);
}

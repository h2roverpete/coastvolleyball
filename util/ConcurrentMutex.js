import { useRef, useCallback } from 'react';

export function useConcurrentMutex() {
  // Stores the active promise in a mutable ref
  const activePromiseRef = useRef(null);

  const execute = useCallback(async (asyncFn) => {
    // 1. If an execution is already in progress, return the existing promise
    if (activePromiseRef.current) {
      return activePromiseRef.current;
    }

    // 2. Initiate the call and store the promise
    const promise = asyncFn().finally(() => {
      // Clear the lock when finished so subsequent clicks can run again
      activePromiseRef.current = null;
    });

    activePromiseRef.current = promise;
    return promise;
  }, []);

  return execute;
}

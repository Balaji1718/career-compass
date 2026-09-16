import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Async state machine used by every data-loading screen:
 * idle -> loading -> success | error, with retry and abort support.
 */
export function useAsync(fn, deps = [], { immediate = true } = {}) {
  const [status, setStatus] = useState(immediate ? 'loading' : 'idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);
  const mountedRef = useRef(true);
  const callbackRef = useRef(fn);
  callbackRef.current = fn;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, []);

  const run = useCallback(async () => {
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setStatus('loading');
    setError(null);
    try {
      const result = await callbackRef.current(controller.signal);
      if (!mountedRef.current || controller.signal.aborted) return;
      setData(result);
      setStatus('success');
    } catch (err) {
      if (!mountedRef.current || (err && err.name === 'AbortError')) return;
      setError(err);
      setStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { status, data, error, retry: run, setData };
}

/** Tracks a one-off action (submit, delete) with its own pending/error state. */
export function useAction() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const execute = useCallback(async (fn) => {
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await fn();
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setPending(false);
    }
  }, []);

  return { pending, error, success, execute, setError, setSuccess };
}

/** Reports browser connectivity so screens can warn before failing. */
export function useOnline() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine !== false
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

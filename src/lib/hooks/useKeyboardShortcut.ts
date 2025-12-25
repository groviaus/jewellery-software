import { useEffect, useCallback } from 'react'

export function useKeyboardShortcut(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options?: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
    preventDefault?: boolean
  }
) {
  const memoizedCallback = useCallback(callback, [callback])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the key matches
      if (event.key !== key && event.key.toLowerCase() !== key.toLowerCase()) {
        return
      }

      // Check modifier keys
      const ctrlMatch = options?.ctrl === undefined ? true : (options.ctrl ? event.ctrlKey : !event.ctrlKey)
      const shiftMatch = options?.shift === undefined ? true : (options.shift ? event.shiftKey : !event.shiftKey)
      const altMatch = options?.alt === undefined ? true : (options.alt ? event.altKey : !event.altKey)
      const metaMatch = options?.meta === undefined ? true : (options.meta ? event.metaKey : !event.metaKey)

      // For Ctrl/Cmd combinations, accept either Ctrl (Windows/Linux) or Meta (Mac)
      const ctrlOrMeta = options?.ctrl || options?.meta
      const ctrlMetaMatch = ctrlOrMeta
        ? event.ctrlKey || event.metaKey
        : !event.ctrlKey && !event.metaKey

      if (ctrlMatch && shiftMatch && altMatch && (ctrlOrMeta ? ctrlMetaMatch : metaMatch)) {
        if (options?.preventDefault !== false) {
          event.preventDefault()
        }
        memoizedCallback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, memoizedCallback, options])
}


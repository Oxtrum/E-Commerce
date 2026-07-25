import { useEffect, useRef, useState } from "react"

/**
 * Revela un elemento cuando entra en el viewport, una sola vez.
 *
 * Si el navegador no soporta IntersectionObserver, el elemento arranca
 * visible: el contenido nunca depende de que el observer dispare.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  )

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

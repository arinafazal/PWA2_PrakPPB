import { useState, useEffect, useRef } from 'react'
import { Loader } from 'lucide-react'

/**
 * LazyImage — Image component with IntersectionObserver lazy loading.
 * Defers loading the image source until the card is scrolled into view (Challenge 2).
 */
export default function LazyImage({ src, alt, width = '240', height = '180', className = '' }) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (!('IntersectionObserver' in window)) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '20px',
        threshold: 0.05,
      },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={`card-img-wrap ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: '#f0f3f5',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Placeholder spinner shown until scrolled into view and fully loaded */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: 'var(--steel)',
            fontSize: '0.8rem',
            background: 'linear-gradient(90deg, #f0f3f5 0%, #e6eaed 50%, #f0f3f5 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        >
          <Loader size={16} className="spin" />
          <span>Loading…</span>
        </div>
      )}

      {/* Actual image only created once visible on scroll */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className="card-img"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '12px',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.35s ease',
            margin: 0,
            borderBottom: 'none',
          }}
        />
      )}
    </div>
  )
}

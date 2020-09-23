// core
import { useMemo, useState, useEffect, useRef } from 'react'
// internal
import { transform, buildLayout } from './utils'


export const useElements = ({ data, config: { layout }, width, height }) => {
  const { nodes, links } = useMemo(() => transform({ ...data, width, height }), [data, width, height])
  const elements = useMemo(
    () => buildLayout({ layout: layout })({ nodes, links, width, height }),
    [layout, nodes, links, width, height],
  )

  return elements
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window
  return {
    width,
    height,
  }
}

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowDimensions
}

// based on https://github.com/plouc/nivo/blob/7d52c07/packages/core/src/hooks/useMeasure.js
export const useResizeObserver = () => {
  const ref = useRef(null)
  const [bounds, setBounds] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const observer = useMemo(() => new ResizeObserver(([entry]) => setBounds(entry.contentRect)))

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return [ref, bounds]
}

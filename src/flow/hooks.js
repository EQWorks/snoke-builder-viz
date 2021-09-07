import { useMemo, useState, useEffect } from 'react'

import { transform, buildLayout } from './utils'


export const useElements = ({ data, config: { layout }, width, height, stepConfig, nodeSize }) => {
  
  const { nodes, links } = useMemo(() => transform({ ...data, width, height, stepConfig }), [data, width, height, stepConfig])
  const elements = useMemo(
    () => buildLayout({ layout: layout })({ nodes, links, width, height, nodeSize }),
    [layout, nodes, links, width, height, nodeSize],
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

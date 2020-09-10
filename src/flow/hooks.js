import { useMemo } from 'react'

import { transform, buildLayout } from './utils'


export const useElements = ({ data, config: { layout }, width, height }) => {
  const { nodes, links } = useMemo(() => transform({ ...data, width, height }), [data, width, height])
  const elements = useMemo(
    () => buildLayout({ layout: layout })({ nodes, links, width, height }),
    [layout, nodes, links, width, height],
  )

  return elements
}

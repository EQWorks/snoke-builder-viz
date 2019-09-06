import React, { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Graph } from 'react-d3-graph'

import { transform } from './utils'


const Visual = ({ config, job }) => {
  const graphEl = useRef(null)
  const [wh, setWH] = useState({ width: 1024, height: 400 })

  useEffect(() => {
    if (graphEl.current) {
      const { clientWidth: width, clientHeight: height } = graphEl.current
      setWH({ width, height })
    }
  }, [graphEl])

  const data = transform(job, wh)
  const baseConfig = {
    directed: true,
    nodeHighlightBehavior: true,
    automaticRearrangeAfterDropNode: true,
    ...wh, // width and height
    node: {
      labelProperty: ({ name, type }) => `${name}${type ? `: ${type}` : ''}`,
      size: 225,
      color: '#333',
      symbolType: 'square',
      highlightStrokeColor: 'teal',
    },
    link: {
      highlightColor: 'teal',
      type: 'CURVE_SMOOTH',
    },
  }

  if (!data || !Object.keys(data).length) {
    return (<div>NULL</div>)
  }

  return (
    <div ref={graphEl} style={{ width: '100%', height: '400px' }}>
      <Graph id='pbj-time' config={{ ...baseConfig, ...config }} data={data} />
    </div>
  )
}
Visual.propTypes = { config: PropTypes.object, job: PropTypes.object }
Visual.defaultProps = { config: {}, job: null }

export default Visual

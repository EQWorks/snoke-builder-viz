import React from 'react'
import PropTypes from 'prop-types'

import { Graph } from 'react-d3-graph'
import useResizeAware from 'react-resize-aware'

import { transform, getLabel } from './utils'


const Visual = ({ config, job }) => {
  const [resizeListner, { width, height }] = useResizeAware()

  const data = transform(job, { width, height })
  const baseConfig = {
    directed: true,
    nodeHighlightBehavior: true,
    automaticRearrangeAfterDropNode: true,
    width,
    height,
    node: {
      labelProperty: getLabel('-', ['name', 'type', 'period']),
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
    <div style={{ width: '100%', height: '100vh' }}>
      {resizeListner}
      <Graph id='pbj-time' config={{ ...baseConfig, ...config }} data={data} />
    </div>
  )
}
Visual.propTypes = { config: PropTypes.object, job: PropTypes.object }
Visual.defaultProps = { config: {}, job: null }

export default Visual

import React from 'react'
import PropTypes from 'prop-types'

import ReactFlow, { Controls } from 'react-flow-renderer'
import useResizeAware from 'react-resize-aware'

import DAGNode from './dag-node'
import { useElements } from './hooks'


export const nodeTypes = { DAGNode }

const Flow = ({ data, config }) => {
  const [resizeListner, { width, height }] = useResizeAware()
  const elements = useElements({ data, config, width, height })

  return (
    <div style={{ width: 'inherit', height: 'inherit' }}>
      {resizeListner}
      <ReactFlow {...{ nodeTypes, ...config }} elements={elements}>
        <Controls />
      </ReactFlow>
    </div>
  )
}

Flow.propTypes = {
  data: PropTypes.object,
  config: PropTypes.object,
}
Flow.defaultProps = {
  data: {},
  config: {},
}

export default Flow

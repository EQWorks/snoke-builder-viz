import React from 'react'
import PropTypes from 'prop-types'

import ReactFlow, { Controls } from 'react-flow-renderer'

import DAGNode from './dag-node'
import { useElements } from './hooks'


export const nodeTypes = { DAGNode }
const onLoad = (flow) => flow.fitView()

const Layout = ({ data, config, width, height }) => {
  const elements = useElements({ data, config, width, height })

  return (
    <div style={{ width, height }}>
      <ReactFlow {...{ onLoad, nodeTypes, ...config }} elements={elements}>
        <Controls />
      </ReactFlow>
    </div>
  )
}

Layout.propTypes = {
  data: PropTypes.object,
  config: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
}
Layout.defaultProps = {
  data: {},
  config: {},
  width: 1000,
  height: 800,
}

export default Layout

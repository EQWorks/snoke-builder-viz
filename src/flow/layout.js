import React from 'react'
import PropTypes from 'prop-types'

import ReactFlow, { Controls } from 'react-flow-renderer'

import DAGNode from './dag-node'
import { useElements } from './hooks'
import Panel from './panel'

export const nodeTypes = { DAGNode }
const onLoad = (flow) => {
  flow.fitView()
}
//console.log(flow.project);
const Layout = ({ data, config, width, height }) => {
  const panelWidth = width * 0.3
  const elements = useElements({ data, config, width, height })
  
  return (
    <div style={{ display: 'flex' }}>
      <Panel width={panelWidth} height={height} />
      <div style={{ width, height }}>
        <ReactFlow {...{ onLoad, nodeTypes, ...config }} elements={elements}>
          <Controls />
        </ReactFlow>
      </div>
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

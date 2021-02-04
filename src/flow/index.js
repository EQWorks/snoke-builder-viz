import React from 'react'
import PropTypes from 'prop-types'
import { ReactFlowProvider } from 'react-flow-renderer'
import DAGNode from './dag-node'
import Layout from './layout'
import { useWindowDimensions } from './hooks'

export const nodeTypes = { DAGNode }


const Flow = ({ data, config, dimension = useWindowDimensions() }) => { 

  const { width, height } = dimension 
  
  return (
    <ReactFlowProvider>
      <Layout data={data} config={config} width={width} height={height} />
    </ReactFlowProvider>
  )
}

Flow.propTypes = {
  data: PropTypes.object,
  config: PropTypes.object,
  dimension: PropTypes.object.isRequired,
}
Flow.defaultProps = {
  data: {},
  config: {},
}

export default Flow

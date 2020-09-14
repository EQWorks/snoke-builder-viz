import React from 'react'
import PropTypes from 'prop-types'
import { ReactFlowProvider } from 'react-flow-renderer'
import DAGNode from './dag-node'
import Layout from './layout'
import { ThemeProvider } from '@material-ui/core/styles'
import Theme from '@eqworks/react-labs/dist/theme'
import { useWindowDimensions } from './hooks'

export const nodeTypes = { DAGNode }

const Flow = ({ data, config }) => {
  const { width, height } = useWindowDimensions()
  return (
    <ThemeProvider theme={Theme}>
      <ReactFlowProvider>
        <Layout data={data} config={config} width={width} height={height} />
      </ReactFlowProvider>
    </ThemeProvider>
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

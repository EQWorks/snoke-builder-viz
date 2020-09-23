// core
import React from 'react'
import PropTypes from 'prop-types'
// 3rd party
import { ReactFlowProvider } from 'react-flow-renderer'
import { makeStyles } from '@material-ui/core/styles'
// internal
import DAGNode from './dag-node'
import Layout from './layout'
import { useResizeObserver } from './hooks'


export const nodeTypes = { DAGNode }
const useStyles = makeStyles({ container: { width: 'inherit', height: 'inherit' } })

const Flow = ({ data, config }) => {
  const classes = useStyles()
  const [ref, { width, height }] = useResizeObserver()
  return (
    <div className={classes.container} ref={ref}>
      <ReactFlowProvider>
        <Layout data={data} config={config} width={width} height={height} />
      </ReactFlowProvider>
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

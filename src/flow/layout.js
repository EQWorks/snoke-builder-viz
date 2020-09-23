// core
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
// 3rd party
import ReactFlow, { Controls } from 'react-flow-renderer'
import { makeStyles } from '@material-ui/core/styles'
// internal
import DAGNode from './dag-node'
import { useElements } from './hooks'
import Panel from './panel'


const useStyles = makeStyles(() => ({
  root: { display: 'flex' },
  graph: (dimensions) => dimensions,
}))

export const nodeTypes = { DAGNode }

const Layout = ({ data, config, width, height }) => {
  const panelWidth = width * 0.3
  const elements = useElements({ data, config, width, height })
  const classes = useStyles({ width, height })
  const [flow, setFlow] = useState(null)

  const onLoad = (flow) => {
    setFlow(flow)
    setTimeout(() => flow.fitView(), 0)
  }

  useEffect(() => {
    if (flow) {
      flow.fitView()
    }
  }, [flow, width, height])

  return (
    <div className={classes.root}>
      <Panel width={panelWidth} height={height} />
      <div className={classes.graph}>
        <ReactFlow {...{ onLoad, nodeTypes, ...config }} elements={elements} style={{ height }}>
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

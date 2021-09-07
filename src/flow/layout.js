import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

import ReactFlow, { Controls, useStoreState } from 'react-flow-renderer'

import DAGNode from './dag-node'
import { useElements } from './hooks'
import Panel from './panel'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: { display: 'flex' },
  graph: (dimensions) => dimensions,
}))

export const nodeTypes = { DAGNode }
const onLoad = (flow) => flow.fitView()

const Layout = ({ data, config, width, height, stepConfig }) => {
  const panelWidth = width * 0.3
  const oldSize = useRef([])
  const [nodeSize, setNodeSize] = useState([])

  const elements = useElements({ data, config, width, height, stepConfig, nodeSize })
  const classes = useStyles({ width, height })
  const nodes = useStoreState(state => state.nodes)

  useEffect(() => {
    const newSize = nodes.map(({ __rf: { width, height } }) => ({ width, height })).filter(({ width, height }) => width && height)
    if (nodes.length > 0 && (oldSize.current.reduce((a, b) => a && nodeSize.includes(b), true) || nodeSize.length === 0)) {
      oldSize.current = newSize
      setNodeSize(newSize)
    }
  }, [nodes])

  return (
    <div className={classes.root}>
      <Panel width={panelWidth} height={height} />
      <div className={classes.graph}>
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
  stepConfig: PropTypes.object,
}
Layout.defaultProps = {
  data: {},
  config: {},
  width: 1000,
  height: 800,
  stepConfig: {},
}

export default Layout

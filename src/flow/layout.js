import React from 'react'
import PropTypes from 'prop-types'

import ReactFlow, { Controls } from 'react-flow-renderer'

import DAGNode from './dag-node'
import { useElements } from './hooks'
import Panel from './panel'

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
  },
  graph: ({ width, height }) => ({
    width: width,
    height: height,
  }),
}))

export const nodeTypes = { DAGNode }
const onLoad = (flow) => {
  flow.fitView()
}

const Layout = ({ data, config, width, height }) => {
  const panelWidth = width * 0.3
  const elements = useElements({ data, config, width, height })
  const classes = useStyles({ width, height })

  return (
    <div className={classes.root}>
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

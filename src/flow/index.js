import React, { createElement } from 'react'
import PropTypes from 'prop-types'

import { ReactFlowProvider } from 'react-flow-renderer'
import AutoSizer from 'react-virtualized-auto-sizer'
import { styled, setup } from 'goober'

import DAGNode from './dag-node'
import Layout from './layout'
import Panel from './panel'


setup(createElement)

export const nodeTypes = { DAGNode }

export const Container = styled('div')`
  width: inherit;
  height: inherit;
  display: flex;
  font-family: "OpenSans", Helvetica, sans-serif;
`

export const FlowContainer = styled('div')`
  flex: 8;
  height: inherit;
  margin: auto;
  padding-left: 1rem;
`

const Flow = ({ data, config }) => (
  <Container>
    <ReactFlowProvider>
      <Panel />
      <FlowContainer>
        <AutoSizer>
          {({ width, height }) => (
            <Layout data={data} config={config} width={width} height={height} />
          )}
        </AutoSizer>
      </FlowContainer>
    </ReactFlowProvider>
  </Container>
)

Flow.propTypes = {
  data: PropTypes.object,
  config: PropTypes.object,
}
Flow.defaultProps = {
  data: {},
  config: {},
}

export default Flow

import React, { createElement } from 'react'
import PropTypes from 'prop-types'

import { styled, setup } from 'goober'
import { Handle } from 'react-flow-renderer'

import { humanTime } from './utils'


setup(createElement)

const getStateStyle = (state) => ({
  failed: '1px solid #d3401b;',
  success: '1px solid #77d31b;',
  running: '1px solid #d3d31b;',
  skipped: '1px dashed #474544;',
}[state] || '1px dashed #ccc;')

export const NodeContent = styled('div')`
  width: 200;
  height: 100;
  overflow: auto;
  padding: 0.5em;
  font-size: 1rem;
  border: ${({ state }) => getStateStyle(state)};
`

const DAGNode = ({ data: { display, level, dag = {} } }) => (
  <>
    {level !== 0 && (<Handle type='target' position='left' />)}
    <NodeContent state={dag.state}>
      <div>{display}</div>
      {dag.state && (<div>State: {dag.state}</div>)}
      {dag.duration && (<div>Run time: {humanTime(dag.duration)}</div>)}
    </NodeContent>
    {level !== 3 && (<Handle type='source' position='right' />)}
  </>
)

DAGNode.propTypes = { data: PropTypes.object.isRequired }

export default DAGNode

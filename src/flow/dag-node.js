import React from 'react'
import PropTypes from 'prop-types'

import styled, { css } from 'styled-components'
import { Handle } from 'react-flow-renderer'


const humanTime = (seconds) => {
  let cd = seconds
  const time = {}
  time.day = Math.floor(cd / 86400)
  cd -= time.day * 86400
  time.hour = Math.floor(cd / 3600)
  cd -= time.hour * 3600
  time.minute = Math.ceil(cd / 60)
  const parts = []
  if (time.day) {
    parts.push(`${time.day} day${time.day > 1 ? 's' : ''}`)
  }
  if (time.hour) {
    parts.push(`${time.hour} hour${time.hour > 1 ? 's' : ''}`)
  }
  if (time.minute) {
    parts.push(`${time.minute} minute${time.minute > 1 ? 's' : ''}`)
  }
  return parts.join(' ')
}

const getStateStyle = (state) => ({
  failed: css`
    border: 1px solid #d3401b;
  `,
  success: css`
    border: 1px solid #77d31b;
  `,
  running: css`
    border: 1px solid #d3d31b;
  `,
  skipped: css`
    border: 1px dashed #474544;
  `,
}[state] || css`
  border: 1px dashed #ccc;
`)

export const NodeContent = styled.div`
  width: 200;
  height: 100;
  overflow: auto;
  padding: 0.5em;
  font-size: 1rem;

  ${({ state }) => getStateStyle(state)};
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

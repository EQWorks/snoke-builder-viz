import React from 'react'
import PropTypes from 'prop-types'

import styled, { css } from 'styled-components'


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

const stateCSS = {
  failed: css`
    border: 3px solid #d3401b;
  `,
  success: css`
    border: 3px solid #77d31b;
  `,
  running: css`
    border: 3px solid #d3d31b;
  `,
  skipped: css`
    border: 3px solid #474544;
  `,
}

const Wrapper = styled.div`
  padding: 0.5em;

  ${({ state }) => stateCSS[state]}
`

const NodeInner = ({ node }) => {
  if (!node) {
    return null
  }

  const { properties } = node
  const { dag = {} } = properties

  return (
    <Wrapper state={dag.state}>
      <strong>{node.type}</strong>
      {dag.state && (<div>State: {dag.state}</div>)}
      {dag.duration && (<div>Run time: {humanTime(dag.duration)}</div>)}
    </Wrapper>
  )
}

NodeInner.propTypes = { node: PropTypes.object }
NodeInner.PropTypes = { node: null }

export default NodeInner

import React, { createElement, useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

import { styled, setup } from 'goober'
import { Handle } from 'react-flow-renderer'


setup(createElement)

export const NodeContent = styled('div')`
  max-width: 275px;
  overflow: auto;
  padding: 1rem;
  font-size: 1rem;
  border-radius: 10px;
  border: solid 1px ${({ selected }) => selected ? '#0075ff' : '#bdbdbd'};
`

export const Dot = styled('span')`
  height: 0.5rem;
  width: 0.5rem;
  margin-right: 0.5rem;
  background-color: ${({ state }) => ({
    failed: '#ea0000;',
    success: '#00d308;',
    running: '#009aff;',
    skipped: '#eeeeee;',
  }[state] || '#eeeeee')};
  border-radius: 50%;
  display: inline-block;
`

const DAGNode = ({ data: { name, sub, level, period, dag = {} } }) => {
  const ref = useRef(null)
  const [selected, setSelected] = useState(false)

  // based on https://stackoverflow.com/a/42234988/158111
  useEffect(() => {
    function handleClickAway(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setSelected(false)
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickAway)

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickAway)
    }
  }, [ref])

  return (
    <div ref={ref}>
      {level !== 0 && (<Handle type='target' position='left' />)}
      <NodeContent selected={selected} onClick={() => { setSelected((s) => !s) }} >
        <Dot state={dag.state} />
        {name}{period ? ` (${period})` : ''}
        {`: ${sub}`}
      </NodeContent>
      {level !== 3 && (<Handle type='source' position='right' />)}
    </div>
  )
}

DAGNode.propTypes = { data: PropTypes.object.isRequired }

export default DAGNode

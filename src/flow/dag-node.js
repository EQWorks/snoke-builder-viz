import React, { createElement } from 'react'
import PropTypes from 'prop-types'

import { styled, setup } from 'goober'
import { Handle, useStoreState } from 'react-flow-renderer'

import { Dot } from './common'


setup(createElement)

export const NodeContent = styled('div')`
  max-width: 275px;
  overflow: auto;
  padding: 1rem;
  font-size: 0.9rem;
  border-radius: 10px;
  border: solid 1px ${({ selected }) => selected ? '#0075ff' : '#bdbdbd'};
  transition: background .2s;
  &:hover {
    background-color: #e2f3ff;
    border: solid 1px #8bceff;
  }
`

const DAGNode = ({ id, data: { name, sub, level, period, dag = {} } }) => {
  const [{ id: selected } = {}] = useStoreState((store) => store.selectedElements || [])

  return (
    <>
      {level !== 0 && (<Handle type='target' position='left' />)}
      <NodeContent selected={selected === id}>
        <Dot state={dag.state} />
        {' '}
        {name}
        {period ? ` (${period})` : ''}
        {sub ? `: ${sub}` : ''}
      </NodeContent>
      {level !== 3 && (<Handle type='source' position='right' />)}
    </>
  )
}

DAGNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
}

export default DAGNode

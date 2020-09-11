import React, { createElement, useEffect } from 'react'

import { useStoreState, useStoreActions } from 'react-flow-renderer'
import { styled, setup } from 'goober'

import { Dot } from './common'
import { humanTime, calcPrice } from './utils'


setup(createElement)

export const Container = styled('div')`
  flex: 2;
  height: inherit;
  overflow: auto;
  margin: auto;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.25);
  padding: 1rem;
`

export const Title = styled('h3')`
  font-size: 1rem;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: 0.15px;
`

export const Sub = styled('h4')`
  font-size: 0.9rem;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.43;
  letter-spacing: 0.25px;
`

export const Value = styled('div')`
  font-weight: normal;
  color: #616161;
  text-transform: capitalize;
`

const Panel = () => {
  const nodes = useStoreState((store) => store.nodes)
  const edges = useStoreState((store) => store.edges)
  const [{ id: selected } = {}] = useStoreState((store) => store.selectedElements || [])
  const setElements = useStoreActions((store) => store.setElements)
  const { data = {} } = nodes.find(({ id }) => id === selected) || {}
  const { name, sub, period, price = {}, dag = {} } = data

  useEffect(() => {
    if (selected) {
      // find all edges that contains selected in id
      const match = edges.filter((edge) => edge.id.includes(selected))
      const unmatch = edges.filter((edge) => !edge.id.includes(selected))

      setElements([
        ...nodes,
        ...unmatch.map((edge) => ({ ...edge, style: {} })),
        ...match.map((edge) => ({ ...edge, style: { stroke: '#0075ff' } })),
      ])
    } else {
      setElements([...nodes, ...edges.map((edge) => ({ ...edge, style: {} }))])
    }
  }, [selected])

  if (!Object.keys(data).length) {
    return null
  }

  return (
    <Container>
      <Title>
        {name}
        {period ? ` (${period})` : ''}
        {sub ? `: ${sub}` : ''}
      </Title>
      {dag.state && (
        <Sub>
          Status
          <Value>
            {dag.state}
            {' '}
            <Dot state={dag.state} />
          </Value>
        </Sub>
      )}
      {dag.duration && (
        <Sub>
          Run time
          <Value>{humanTime(dag.duration)}</Value>
        </Sub>
      )}
      {Object.keys(price).length > 0 && (
        <Sub>
          Price
          <Value>${calcPrice(price)}</Value>
        </Sub>
      )}
    </Container>
  )
}

export default Panel

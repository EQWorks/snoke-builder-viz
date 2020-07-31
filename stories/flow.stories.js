import React from 'react'

import { Flow, Dagre } from '../src'
import sample from './sample.json'

import DagreGraph from 'dagre-d3-react'


export default {
  component: Flow,
  title: 'Flow',
}

export const normal = () => (
  <div style={{ height: 300 }}>
    <Flow data={{ ...sample, height: 300 }} config={{ smartRouting: false }} />
  </div>
)

export const dagreA = () => (
  <Dagre data={sample} />
)

export const dagre = () => (
  <DagreGraph
    nodes={[
      { label: 'a', id: '1.a' },
      { label: 'b', id: '2.b' },
    ]}
    links={[
      { source: '1.a', target: '2.b' }
    ]}
    config={{
      rankdir: 'LR',
      align: 'UL',
      ranker: 'tight-tree'
    }}
    width='500'
    height='200'
    // animate={1000}
    // shape='circle'
    fitBoundaries
    // zoomable
    // onNodeClick={e => console.log(e)}
    // onRelationshipClick={e => console.log(e)}
  />
)

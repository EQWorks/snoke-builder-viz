import React from 'react'

import { Flow } from '../src'
import sample1 from './sample-data/sample.json'
import sample2 from './sample-data/sample2.json'
import sample3 from './sample-data/sample3.json'
import sample4 from './sample-data/sample4.json'

export default {
  component: Flow,
  title: 'Flow',
}

export const Sample1 = () => (
  <div style={{ height: '100vh' }}>
    <Flow data={sample1} />
  </div>
)

export const Sample2 = () => (
  <div style={{ height: '100vh' }}>
    <Flow data={sample2} />
  </div>
)

export const Sample3 = () => (
  <div style={{ height: '100vh' }}>
    <Flow data={sample3} />
  </div>
)

export const Sample4 = () => (
  <div style={{ height: '100vh' }}>
    <Flow data={sample4} />
  </div>
)

export const Sample1Dagre = () => (
  <div style={{ height: '100vh' }}>
    <Flow data={sample1} config={{ layout: 'dagre' }} />
  </div>
)

export const Sample2Dagre = () => (
  <div style={{ height: '100vh' }}>
    <Flow data={sample2} config={{ layout: 'dagre' }} />
  </div>
)

export const Sample3Dagre = () => (
  <div style={{ height: '100vh' }}>
    <Flow data={sample3} config={{ layout: 'dagre' }} />
  </div>
)

export const Sample4Dagre = () => (
  <div style={{ height: '100vh' }}>
    <Flow data={sample4} config={{ layout: 'dagre' }} />
  </div>
)

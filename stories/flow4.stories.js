import React from 'react';

import { Flow4 } from '../src'
import sample1 from './sampleData/sample.json'
import sample2 from './sampleData/sample2.json'
import sample3 from './sampleData/sample3.json'
import sample4 from './sampleData/sample4.json'

export default {
  component: Flow4,
  title: 'Custom Algorithm',
}

export const Sample1 = () => (
  <div style={{ height: '100vh' }}>
    <Flow4 data={sample1} />
  </div>
)

export const Sample2 = () => (
  <div style={{ height: '100vh' }}>
    <Flow4 data={sample2} />
  </div>
)

export const Sample3 = () => (
  <div style={{ height: '100vh' }}>
    <Flow4 data={sample3} />
  </div>
)

export const Sample4 = () => (
  <div style={{ height: '100vh' }}>
    <Flow4 data={sample4} />
  </div>
)
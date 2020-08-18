import React from 'react';

import { Flow4 } from '../src'
import sample from './sample.json'


export default {
  component: Flow4,
  title: 'Flow 4',
}

export const OptimalDistribution = () => (
  <div style={{ height: '100vh' }}>
    <Flow4 data={sample} />
  </div>
)

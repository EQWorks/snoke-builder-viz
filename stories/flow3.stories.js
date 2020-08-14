import React from 'react';

import { Flow3 } from '../src'
import sample from './sample.json'


export default {
  component: Flow3,
  title: 'Flow 3',
}

export const OptimalSpacing = () => (
  <div style={{ height: '100vh' }}>
    <Flow3 data={sample} />
  </div>
)
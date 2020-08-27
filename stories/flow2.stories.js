import React from 'react';

import { Flow2 } from '../src'
import sample from './sample.json'


export default {
  component: Flow2,
  title: 'Flow 2',
}

export const lol = () => (
  <div style={{ height: '100vh' }}>
    <Flow2 data={sample} />
  </div>
)

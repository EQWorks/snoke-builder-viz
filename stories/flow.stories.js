import React from 'react'

import { Flow } from '../src'
import sample from './sample.json'


export default {
  component: Flow,
  title: 'Flow',
}

export const normal = () => (
  <div style={{ height: 300 }}>
    <Flow data={{ ...sample, height: 300 }} config={{ smartRouting: false }} />
  </div>
)

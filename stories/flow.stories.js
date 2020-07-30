import React from 'react'

import { Flow } from '../src'
import sample from './sample.json'


export default {
  component: Flow,
  title: 'Flow',
}

export const normal = () => (
  <Flow data={sample} config={{ smartRouting: false }} />
)

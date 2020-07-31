import React from 'react'

import { Dagre } from '../src'
import sample from './sample.json'


export default {
  component: Dagre,
  title: 'Dagre',
}

export const normal = () => (
  <Dagre data={sample} />
)

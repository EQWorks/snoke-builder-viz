import React from 'react'

import { FlowChartWithState } from '@mrblenny/react-flow-chart'

import { Flow } from '../src'
import sample from './sample.json'
import dag from './dag'


export default {
  component: Flow,
  title: 'Flow',
}

export const normal = () => (
  <Flow data={sample} />
)

export const flowExample = () => (
  <FlowChartWithState initialValue={dag} />
)

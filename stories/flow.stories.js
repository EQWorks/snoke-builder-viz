import React from 'react'

import { Modal, Card } from 'semantic-ui-react'

import { Flow } from '../src'
import sample1 from './sample-data/sample.json'
import sample2 from './sample-data/sample2.json'
import sample3 from './sample-data/sample3.json'
import sample4 from './sample-data/sample4.json'
import sample5 from './sample-data/sample5.json'
import sample6 from './sample-data/sample6.json'
import stepConfig from './step-config'

export default {
  component: Flow,
  title: 'Flow',
}
export const Sample1 = () => <Flow data={sample1} stepConfig={stepConfig} />

export const Sample2 = () => <Flow data={sample2} stepConfig={stepConfig} />

export const Sample3 = () => <Flow data={sample3} stepConfig={stepConfig} />

export const Sample4 = () => <Flow data={sample4} stepConfig={stepConfig} />

export const Sample5 = () => <Flow data={sample5} stepConfig={stepConfig} />

export const Sample6 = () => <Flow data={sample6} stepConfig={stepConfig} />

export const Sample1Dagre = () => (
  <Flow data={sample1} config={{ layout: 'dagre' }} stepConfig={stepConfig} />
)

export const Sample2Dagre = () => (
  <Flow data={sample2} config={{ layout: 'dagre' }} stepConfig={stepConfig} />
)

export const Sample3Dagre = () => (
  <Flow data={sample3} config={{ layout: 'dagre' }} stepConfig={stepConfig} />
)

export const Sample4Dagre = () => (
  <Flow data={sample4} config={{ layout: 'dagre' }} stepConfig={stepConfig} />
)

export const InSUIModal = () => (
  <Modal open>
    <Modal.Content>
      <Card fluid>
        <Card.Content id='content' style={{ padding: '0em', height: 500 }}>
          <Flow data={sample1} dimension={{ height: 500 }}/>
        </Card.Content>
      </Card>
    </Modal.Content>
  </Modal>
)

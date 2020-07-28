import React from 'react'

import { Visual } from '../src'
import sample from './sample'


export default {
  component: Visual,
  title: 'Visual',
}

export const normal = () => (
  <Visual
    job={sample.job_parameters}
    dag_tasks={sample.dag_tasks}
  />
)

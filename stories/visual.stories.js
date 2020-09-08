import React from 'react'

import { Visual } from '../src'
import sample1 from './sample-data/sample.json'
import sample2 from './sample-data/sample2.json'
import sample3 from './sample-data/sample3.json'
import sample4 from './sample-data/sample4.json'


export default {
  component: Visual,
  title: 'Visual',
}

export const Sample1 = () => (
  <Visual
    job={sample1.job_parameters}
    dag_tasks={sample1.dag_tasks}
  />
)

export const Sample2 = () => (
  <Visual
    job={sample2.job_parameters}
    dag_tasks={sample2.dag_tasks}
  />
)

export const Sample3 = () => (
  <Visual
    job={sample3.job_parameters}
    dag_tasks={sample3.dag_tasks}
  />
)

export const Sample4 = () => (
  <Visual
    job={sample4.job_parameters}
    dag_tasks={sample4.dag_tasks}
  />
)

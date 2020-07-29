import React from 'react'
import PropTypes from 'prop-types'

import { FlowChartWithState } from '@mrblenny/react-flow-chart'

import Port from './port'


const stepNames = Object.freeze({
  audience_build_wi: 'Audience Build: Walk-in',
  audience_build_beacon: 'Audience Build: Beacon',
  audience_enrich_aoi: 'Enrichment: AOI',
  audience_enrich_xd: 'Enrichment: Cross Device',
  audience_intersect_vwi: 'Intersection: Verified Walk-in',
  audience_intersect_xwi: 'Intersection: Cross Chain Walk-in',
  segment: 'Segment',
  cohort_repeat_visits: 'Cohort Analysis: Visits',
  cohort_converted_visitors: 'Cohort Analysis: Converted Visitors',
  propensity: 'Propensity',
  report_wi: 'Report: Walk-in',
  report_vwi: 'Report: Verified Walk-in',
  report_xwi: 'Report: Cross Chain Walk-in',
})

const transform = ({ job_parameters, dag_tasks, width = 1024, height = 400 }) => {
  const data = {
    offset: {
      x: 0,
      y: 0,
    },
    scale: 1,
    selected: {},
    hovered: {},
  }
  const { steps = [] } = job_parameters || {}

  const nodes = []
  const links = []
  // stateful helper functions
  function buildLink(target, src) {
    const { id: source } = nodes.find(n => n.properties.parameters.audience_id === src) || {}
    if (source == null) {
      return
    }
    if (source === target) {
      return
    }
    if (links.find(l => l.source === source && l.target === target)) {
      return
    }
    links.push({
      id: `${source}-${target}`,
      from: {
        nodeId: source,
        portId: 'portOut',
      },
      to: {
        nodeId: target,
        portId: 'portIn',
      },
    })
  }
  function buildLinks(target, sources) {
    sources.forEach((src) => {
      buildLink(target, src)
    })
  }
  function buildReportLink(target, src) {
    const { id: source } = nodes.find(n => n.properties.name.startsWith('report_') && n.properties.parameters.report === src) || {}
    if (source == null) {
      return
    }
    if (source === target) {
      return
    }
    if (links.find(l => l.source === source && l.target === target)) {
      return
    }
    links.push({
      id: `${source}-${target}`,
      from: {
        nodeId: source,
        portId: 'portIn',
      },
      to: {
        id: target,
        portId: 'portOut',
      },
    })
  }

  steps.forEach((step, i) => {
    const id = `${step.i || i}.${step.name}`
    const p = step.parameters
    nodes.push({
      id,
      type: `${stepNames[step.name]}${p.period ? ` - ${p.period}` : ''}`,
      position: {
        x: width / (steps.length || 1)  * i,
        y: height / (steps.length || 1) * i,
      },
      properties: {
        ...step,
        dag: dag_tasks.find(d => d.task_id === id),
      },
      ports: {
        portOut: {
          id: 'portOut',
          type: 'output',
        },
        portIn: {
          id: 'portIn',
          type: 'input',
        },
      },
    })
    // build links
    const {
      ori_audience,
      pri_audience,
      sec_audience,
      audience_id,
      walkin_audid,
      beacon_audid,
      conversion_audid,
      visit_audience,
      beacon_audience,
      report,
    } = step.parameters
    if (step.name.startsWith('audience_enrich_')) {
      buildLink(id, ori_audience)
    }
    if (step.name.startsWith('audience_intersect_')) {
      buildLinks(id, [pri_audience, sec_audience])
    }
    if (['segment', 'propensity'].includes(step.name)) {
      buildLink(id, audience_id)
    }
    if (step.name.startsWith('report_')) {
      buildLinks(id, [walkin_audid, beacon_audid, conversion_audid])
    }
    if (step.name === 'cohort_repeat_visits') {
      buildLink(id, visit_audience)
    }
    if (step.name === 'cohort_converted_visitors') {
      buildLinks(id, [visit_audience, beacon_audience])
    }
    if (['propensity', 'cohort_repeat_visits', 'cohort_converted_visitors'].includes(step.name)) {
      buildReportLink(id, report)
    }
  })

  data.nodes = nodes.reduce((acc, curr) => {
    acc[curr.id] = curr
    return acc
  }, {})
  data.links = links.reduce((acc, curr) => {
    acc[curr.id] = curr
    return acc
  }, {})

  return data
}

const Flow = ({ data, config }) => {
  const initialValue = transform({ ...data })

  return (
    <FlowChartWithState
      config={config}
      initialValue={initialValue}
      Components={{ Port }}
    />
  )
}

Flow.propTypes = {
  data: PropTypes.object,
  config: PropTypes.object,
}
Flow.defaultProps = {
  data: {},
  config: {},
}

export default Flow

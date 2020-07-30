import React from 'react'
import PropTypes from 'prop-types'

import { FlowChartWithState } from '@mrblenny/react-flow-chart'

import Container from './container'
import Port from './port'
import NodeInner from './node-inner'


export const stepProps = Object.freeze({
  audience_build_wi: {
    name: 'Audience Build: Walk-in',
    level: 0,
  },
  audience_build_beacon: {
    name: 'Audience Build: Beacon',
    level: 0,
  },
  audience_enrich_aoi: {
    name: 'Enrichment: AOI',
    level: 1,
  },
  audience_enrich_xd: {
    name: 'Enrichment: Cross Device',
    level: 1,
  },
  audience_intersect_vwi: {
    name: 'Intersection: Verified Walk-in',
    level: 2,
  },
  audience_intersect_xwi: {
    name: 'Intersection: Cross Chain Walk-in',
    level: 2,
  },
  segment: {
    name: 'Segment',
    level: 3,
  },
  cohort_repeat_visits: {
    name: 'Cohort Analysis: Visits',
    level: 3,
  },
  cohort_converted_visitors: {
    name: 'Cohort Analysis: Converted Visitors',
    level: 3,
  },
  propensity: {
    name: 'Propensity',
    level: 3,
  },
  report_wi: {
    name: 'Report: Walk-in',
    level: 3,
  },
  report_vwi: {
    name: 'Report: Verified Walk-in',
    level: 3,
  },
  report_xwi: {
    name: 'Report: Cross Chain Walk-in',
    level: 3,
  },
})

export const transform = ({ job_parameters, dag_tasks = [], width = 800, height = 600 }) => {
  const data = {
    offset: { x: 0, y: 0 },
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
    const props = stepProps[step.name]
    const id = `${step.i || (i + 1)}.${step.name}`
    const p = step.parameters
    nodes.push({
      id,
      type: `${props.name}${p.period ? ` - ${p.period}` : ''}`,
      properties: {
        ...step,
        dag: dag_tasks.find(d => d.task_id === id),
        level: props.level,
      },
      ports: {
        portOut: {
          id: 'portOut',
          type: 'right',
          properties: {
            linkColor: '#CCCCCC',
          },
        },
        portIn: {
          id: 'portIn',
          type: 'left',
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

  const levels = nodes.reduce((acc, { id, properties: { level } }) => {
    acc[level] = [...(acc[level] || []), id]
    return acc
  }, {})
  data.nodes = nodes.map((node) => {
    const { id, properties: { level } } = node
    const x = (width / 4) * level * 1.5
    let y = (height / levels[level].length) * (levels[level].indexOf(id)) * 1.2
    if (level > 0 && level < 3) {
      const sources = links.filter((link) => link.to.nodeId === id).map((link) => link.from.nodeId)
      const prevLvl = stepProps[sources[0].split('.')[1]].level
      if (sources.length === 1) {
        y = (height / levels[prevLvl].length) * levels[prevLvl].indexOf(sources[0]) * 1.2
      } else {
        y = (height / levels[prevLvl].length) / sources.length
      }
    }
    return { ...node, position: { x, y } }
  }).reduce((acc, curr) => {
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
    <Container>
      <FlowChartWithState
        config={{
          zoom: {
            zoomIn: { disabled: true },
            zoomOut: { disabled: true },
            wheel: { disabled: true },
            pan: { disabled: true },
          },
          showArrowHead: true,
          gridSize: 1,
          ...config,
        }}
        initialValue={initialValue}
        Components={{ Port, NodeInner }}
      />
    </Container>
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

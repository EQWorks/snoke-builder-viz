import React from 'react'
import PropTypes from 'prop-types'

import DagreGraph from 'dagre-d3-react'
import useResizeAware from 'react-resize-aware'


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

const humanTime = (seconds) => {
  let cd = seconds
  const time = {}
  time.day = Math.floor(cd / 86400)
  cd -= time.day * 86400
  time.hour = Math.floor(cd / 3600)
  cd -= time.hour * 3600
  time.minute = Math.ceil(cd / 60)
  const parts = []
  if (time.day) {
    parts.push(`${time.day} day${time.day > 1 ? 's' : ''}`)
  }
  if (time.hour) {
    parts.push(`${time.hour} hour${time.hour > 1 ? 's' : ''}`)
  }
  if (time.minute) {
    parts.push(`${time.minute} minute${time.minute > 1 ? 's' : ''}`)
  }
  return parts.join(' ')
}

const transform = ({ job_parameters, dag_tasks }) => {
  const { steps = [] } = job_parameters || {}
  const nodes = []
  const links = []

  // stateful helper functions
  function buildLink(target, src) {
    const { id: source } = nodes.find(n => n.parameters.audience_id === src) || {}
    if (source == null) {
      return
    }
    if (source === target) {
      return
    }
    if (links.find(l => l.source === source && l.target === target)) {
      return
    }
    links.push({ source, target, config: { style: 'stroke: black;' } })
  }
  function buildLinks(target, sources) {
    sources.forEach((src) => {
      buildLink(target, src)
    })
  }
  function buildReportLink(target, src) {
    const { id: source } = nodes.find(n => n.name.startsWith('report_') && n.parameters.report === src) || {}
    if (source == null) {
      return
    }
    if (source === target) {
      return
    }
    if (links.find(l => l.source === source && l.target === target)) {
      return
    }
    links.push({ source, target, config: { style: 'stroke: black;' } })
  }

  steps.forEach((step, i) => {
    const props = stepProps[step.name]
    const id = `${step.i || (i + 1)}.${step.name}`
    const { parameters } = step
    const dag = dag_tasks.find(d => d.task_id === id) || {}
    const labelParts = [props.name]
    if (parameters.period) {
      labelParts.push(parameters.period)
    }
    if (dag.duration) {
      labelParts.push(humanTime(dag.duration))
    }
    nodes.push({
      ...step,
      id,
      label: labelParts.join('\n'),
      config: { style: 'fill: #afa' },
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

  return { nodes, links }
}

const Dagre = ({ data, ...graphProps }) => {
  const [resizeListner, { width, height }] = useResizeAware()
  const { nodes, links } = transform(data)

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {resizeListner}
      <DagreGraph
        nodes={nodes}
        links={links}
        {...{
          width,
          height,
          fitBoundaries: true,
          config: {
            rankdir: 'LR',
            align: 'UL',
            ranker: 'tight-tree'
          },
          ...graphProps,
        }}
      />
    </div>
  )
}

Dagre.propTypes = { data: PropTypes.object.isRequired }

export default Dagre

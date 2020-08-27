import React from 'react'
import PropTypes from 'prop-types'

import ReactFlow, { Controls } from 'react-flow-renderer'
import dagre from 'dagre'
import useResizeAware from 'react-resize-aware'

import DAGNode from './dag-node'


const nodeTypes = { DAGNode }

const onLoad = (flow) => flow.fitView()

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

export const transform = ({ job_parameters, dag_tasks = [] }) => {
  const { steps = [] } = job_parameters || {}

  const nodes = []
  const links = []
  // stateful helper functions
  function buildLink(target, src) {
    const { id: source } = nodes.find(n => n.data.parameters.audience_id === src) || {}
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
      source,
      target,
      animated: true,
    })
  }
  function buildLinks(target, sources) {
    sources.forEach((src) => {
      buildLink(target, src)
    })
  }
  function buildReportLink(target, src) {
    const { id: source } = nodes.find(n => n.data.name.startsWith('report_') && n.data.parameters.report === src) || {}
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
      source,
      target,
      animated: true,
    })
  }

  steps.forEach((step, i) => {
    const props = stepProps[step.name]
    const id = `${step.i || (i + 1)}.${step.name}`
    const p = step.parameters
    nodes.push({
      id,
      type: 'DAGNode',
      data: {
        ...step,
        display: `${props.name}${p.period ? ` - ${p.period}` : ''}`,
        dag: dag_tasks.find(d => d.task_id === id),
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

  // dagre layout
  const g = new dagre.graphlib.Graph()
  g.setGraph({
    marginx: 0,
    marginy: 0,
    rankdir: 'LR',
    align: 'UL',
    nodesep: 25,
    edgesep: 10,
    ranksep: 10,
    acyclicer: 'greedy',
    ranker: 'longest-path',
  })
  g.setDefaultEdgeLabel(() => ({}))
  for (let node of nodes) {
    // TODO: pre-determine node dimensions
    g.setNode(node.id, { width: 225, height: 100 })
  }
  for (let link of links) {
    g.setEdge(link.source, link.target)
  }
  dagre.layout(g)

  for (let node of nodes) {
    node.position = {
      x: g.node(node.id).x - 225 / 2,
      y: g.node(node.id).y - 100 / 2,
    }
  }

  return [...nodes, ...links]
}

const Flow = ({ data, config }) => {
  const [resizeListner, { width, height }] = useResizeAware()
  const elements = transform({ ...data, width, height })

  return (
    <div style={{ width: 'inherit', height: 'inherit' }}>
      {resizeListner}
      <ReactFlow
        {...{
          // elementsSelectable: false,
          // nodesConnectable: false,
          // nodesDraggable: false,
          // zoomOnScroll: false,
          // zoomOnDoubleClick: false,
          // paneMoveable: false,
          onLoad,
          nodeTypes,
          ...config,
        }}
        elements={elements}
      >
        <Controls />
      </ReactFlow>
    </div>
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

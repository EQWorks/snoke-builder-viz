import React from 'react'
import PropTypes from 'prop-types'

import { Graph } from 'react-d3-graph'
import useResizeAware from 'react-resize-aware'
import uuid from 'uuid/v4'
// import DAGRE from 'dagre'


// transforms pipeline job steps into graph nodes and links
export const transform = ({ steps = [] }, { width, height }) => {
  const nodes = []
  const links = []
  // stateful helpers
  function buildLink(target, src) {
    const { id: source } = nodes.find(n => n.audience_id === src) || {}
    if (source == null) {
      return
    }
    if (source === target) {
      return
    }
    if (links.find(l => l.source === source && l.target === target)) {
      return
    }
    links.push({ source, target })
  }
  function buildLinks(target, sources) {
    sources.forEach((src) => {
      buildLink(target, src)
    })
  }
  function buildReportLink(target, src) {
    const { id: source } = nodes.find(n => n.name.startsWith('report_') && n.report === src) || {}
    if (source == null) {
      return
    }
    if (source === target) {
      return
    }
    if (links.find(l => l.source === source && l.target === target)) {
      return
    }
    links.push({ source, target })
  }

  steps.forEach(({ name, parameters }) => {
    const id = uuid()
    nodes.push({
      id,
      name,
      ...parameters,
      x: Math.floor(Math.random() * (width || 400)),
      y: Math.floor(Math.random() * (height || 200)),
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
    } = parameters
    if (name.startsWith('audience_enrich_')) {
      buildLink(id, ori_audience)
    }
    if (name.startsWith('audience_intersect_')) {
      buildLinks(id, [pri_audience, sec_audience])
    }
    if (['segment', 'propensity'].includes(name)) {
      buildLink(id, audience_id)
    }
    if (name.startsWith('report_')) {
      buildLinks(id, [walkin_audid, beacon_audid, conversion_audid])
    }
    if (name === 'cohort_repeat_visits') {
      buildLink(id, visit_audience)
    }
    if (name === 'cohort_converted_visitors') {
      buildLinks(id, [visit_audience, beacon_audience])
    }
    if (['propensity', 'cohort_repeat_visits', 'cohort_converted_visitors'].includes(name)) {
      buildReportLink(id, report)
    }
  })

  // // revise position of nodes using dagre
  // const g = new DAGRE.graphlib.Graph()
  // g.setGraph({ marginx: 20, marginy: 20 })
  // g.setDefaultEdgeLabel(() => ({}))
  // nodes.forEach((node) => {
  //   g.setNode(node.id, { width: 200, height: 100 })
  // })
  // Array.from(links).forEach((link) => {
  //   g.setEdge(link.source, link.target)
  // })
  // DAGRE.layout(g)
  // nodes.forEach((node) => {
  //   node.x = g.node(node.id).x - 200 / 2
  //   node.y = g.node(node.id).y - 100 / 2
  // })

  return { nodes, links: Array.from(links) }
}

/**
 *
 * @param {string} s - separator between properties
 * @param {Array} p - Array of strings or node properties for label formatting
 */
export const getLabel = (s, p) => n => (p.map(v => n[v]).filter(v => v).join(s))

const Visual = ({ config, job }) => {
  const [resizeListner, { width, height }] = useResizeAware()

  const data = transform(job, { width, height })
  const baseConfig = {
    directed: true,
    nodeHighlightBehavior: true,
    automaticRearrangeAfterDropNode: true,
    width,
    height,
    node: {
      labelProperty: getLabel('-', ['i', 'name', 'type', 'period']),
      size: 225,
      color: '#333',
      symbolType: 'square',
      highlightStrokeColor: 'teal',
    },
    link: {
      highlightColor: 'teal',
      type: 'CURVE_SMOOTH',
    },
  }

  if (!data || !Object.keys(data).length) {
    return (<div>NULL</div>)
  }

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {resizeListner}
      <Graph id='pbj-time' config={{ ...baseConfig, ...config }} data={data} />
    </div>
  )
}
Visual.propTypes = { config: PropTypes.object, job: PropTypes.object }
Visual.defaultProps = { config: {}, job: null }

export default Visual

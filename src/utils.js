import uuid from 'uuid/v4'


// transforms pipeline job steps into graph nodes and links
export const transform = ({ steps = [] }, { width, height }) => {
  const nodes = []
  const links = []

  // stateful helpers
  function buildLink(target, src) {
    const { id: source } = nodes.find(n => n.audience_id === src) || {}
    if (source === null) {
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
    } = parameters
    if (name === 'enrich_audience') {
      buildLink(id, ori_audience)
    }
    if (name === 'intersect_audience') {
      buildLinks(id, [pri_audience, sec_audience])
    }
    if (['deliver_segment', 'propensity'].includes(name)) {
      buildLink(id, audience_id)
    }
    if (name === 'build_report') {
      buildLinks(id, [walkin_audid, beacon_audid, conversion_audid])
    }
    if (name === 'cohort_repeat_visits') {
      buildLink(id, visit_audience)
    }
    if (name === 'cohort_converted_visitors') {
      buildLinks(id, [visit_audience, beacon_audience])
    }
  })

  return { nodes, links: Array.from(links) }
}

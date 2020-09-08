import { graphlib, layout } from 'dagre'


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

  function buildLink(target, src) {
    const { id: source } = nodes.find((n) => n.data.parameters.audience_id === src) || {}
    if (source == null) {
      return
    }
    if (source === target) {
      return
    }
    if (links.find((l) => l.source === source && l.target === target)) {
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
    const { id: source } = nodes.find((n) => n.data.name.startsWith('report_') && n.data.parameters.report === src) || {}
    if (source == null) {
      return
    }
    if (source === target) {
      return
    }
    if (links.find((l) => l.source === source && l.target === target)) {
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
        dag: dag_tasks.find((d) => d.task_id === id),
        level: props.level,
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

  return { nodes, links }
}

const findSourceTarget = (links) => (acc, { id }) => {
  const sourceList = []
  const targetList = []
  links.forEach((link) => {
    if (link.source === id) {
      const index = parseInt(link.target.charAt(0))
      targetList.push(index - 1) // because the numbering starts from 1
    }
    if (link.target === id) {
      const index = parseInt(link.source.charAt(0))
      sourceList.push(index - 1)
    }
  })
  acc.push({ id, sourceList, targetList })
  return acc
}

const dagre = ({ nodes, links, width, height }) => {
  // dagre layout
  const g = new graphlib.Graph()
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
    width,
    height,
  })
  g.setDefaultEdgeLabel(() => ({}))
  for (let node of nodes) {
    // TODO: pre-determine node dimensions
    g.setNode(node.id, { width: 200, height: 100 })
  }
  for (let link of links) {
    g.setEdge(link.source, link.target)
  }
  layout(g)

  for (let node of nodes) {
    const n = g.node(node.id)
    node.position = {
      x: n.x - n.width / 2,
      y: n.y - n.height / 2,
    }
  }
  return [...nodes, ...links]
}

const custom = ({ nodes, links, width, height }) => {
  // number of levels for nodes
  const nodesArray = new Array(4).fill(null).map(() => [])
  const basePosition = []
  // generate 2D array
  // create source-target list per each node. order + length are same as nodes
  const sourceTargetList = nodes.reduce(findSourceTarget(links), [])

  nodes.forEach(({ data: { level }, id }) => {
    basePosition.push({ x: level, y: nodesArray[level].length })
    nodesArray[level].push(id)
  })

  const maxCount = { x: 0, y: 0 }

  maxCount.x = nodesArray.length - 1

  maxCount.y = nodesArray.reduce((acc, val) => {
    const length = val.length - 1
    return acc < length ? length : acc
  }, 0)

  const baseWidth = width / (maxCount.x + 1)
  const baseHeight = height / (maxCount.y + 1)
  const nodePositions = [...basePosition]

  return [
    ...nodes.map((element, index) => {
      const currentX = basePosition[index].x
      const currentY = basePosition[index].y
      const { sourceList } = sourceTargetList[index]

      if (sourceList.length > 0) {
        const num = sourceList.reduce((acc, src) => acc + basePosition[src].y, 0)
        const adjustedY = num / sourceList.length
        const isTaken = nodePositions.some((p) => (p.x === currentX && p.y === adjustedY))
        if(isTaken) {
          nodePositions.push({ x: currentX, y: currentY })

        } else {
          nodePositions.push({ x: currentX, y: adjustedY })
          basePosition[index].y = adjustedY
        }
      } else {
        nodePositions.push({ x: currentX, y: currentY })
      }

      return {
        ...element,
        position: {
          x: nodePositions[index].x * baseWidth,
          y: nodePositions[index].y * baseHeight,
        },
        sourceList: sourceTargetList[index].source,
        targetList: sourceTargetList[index].target,
      }
    }),
    ...links,
  ]
}

export const buildLayout = ({ layout }) => ({ dagre, custom }[layout] || custom)

export const humanTime = (seconds) => {
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

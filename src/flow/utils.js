import { graphlib, layout } from 'dagre'

export const transform = ({ job_parameters, dag_tasks = [], stepConfig }) => {
  const { steps = [] } = job_parameters || {}
  const nodes = []
  const links = []

  function buildLink({ 
    target, 
    src,
    srcType,
    findSrcNode = ({ data, src }) => data.parameters.audience_id === src,
  }) {
    nodes.filter(({ data }) => findSrcNode({ data, src, srcType })).forEach(({ id: source }) => {
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
    })
  }

  steps.forEach((step, i) => {
    const stepName = (step.name).startsWith('bell_')
      ? (step.name).substring(5)
      : step.name

    const parsedName = stepName
      .split('_')
      .join(' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
    const props = stepConfig.props ? stepConfig.props[stepName] : { name: parsedName, level: i }
    const id = `${step.i || (i + 1)}.${stepName}`
    const p = step.parameters
    const dag = dag_tasks
      ? dag_tasks.find((d) => d.task_id === id)
      : []
    nodes.push({
      id,
      type: 'DAGNode',
      data: {
        ...step,
        dag,
        period: p.period,
        ...props,
      },
    })
    if (!stepConfig.relations) {
      return
    }
    const relation = stepConfig.relations.find(({ match }) => {
      return (
        (typeof match === 'function' && match(stepName))
        || (typeof match === 'string' && stepName === match)
        || (Array.isArray(match) && match.includes(stepName))
      )
    })
    if (relation) {
      const { src, findSrcNode } = relation
      if (Array.isArray(src)) {
        src.forEach(s => buildLink({ target: id, src: step.parameters[s], srcType: s, findSrcNode }))
      } else {
        buildLink({ target: id, src: step.parameters[src], srcType: src, findSrcNode })
      }
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
    g.setNode(node.id, { width: 303, height: 53 })
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

const custom = ({ nodes, links, nodeSize }) => {
  // number of levels for nodes
  const nodesArray = []
  const basePosition = []
  const colWidth = []
  const colHeight = []
  // generate 2D array
  // create source-target list per each node. order + length are same as nodes
  const sourceTargetList = nodes.reduce(findSourceTarget(links), [])
  nodes.forEach(({ data }, i) => {
    let { level } = data
    if (!level) {
      level = i
    }
    const cur = { x: level, y: nodesArray[level] || 0 }
    basePosition[i] = cur
    nodesArray[cur.x] = nodesArray[cur.x] === undefined ? 1 : nodesArray[cur.x] + 1
    colWidth[cur.x] = Math.max(colWidth[cur.x] || 0, nodeSize[i]?.width || 0)
    colHeight[cur.y] = Math.max(colHeight[cur.y] || 0, nodeSize[i]?.height || 0)
  })

  const nodePositions = [...basePosition]
  const margin = { x: 50, y: 15 }

  return [
    ...nodes.map((element, index) => {
      const currentX = basePosition[index].x
      const currentY = basePosition[index].y
      nodePositions.push({ x: currentX, y: currentY })
      // const { sourceList } = sourceTargetList[index]
      // if (sourceList.length > 0) {
      //   const num = sourceList.reduce((acc, src) => acc + basePosition[src].y, 0)
      //   const adjustedY = num / sourceList.length
      //   const isTaken = nodePositions.some((p) => (p.x === currentX && p.y === adjustedY))
      //   if(isTaken) {
      //     nodePositions.push({ x: currentX, y: currentY })

      //   } else {
      //     nodePositions.push({ x: currentX, y: adjustedY })
      //     basePosition[index].y = adjustedY
      //   }
      // } else {
      //   nodePositions.push({ x: currentX, y: currentY })
      // }
      const cur = nodePositions[index]

      return {
        ...element,
        position: {
          x: colWidth.slice(0, cur.x).reduce((acc, cur) => acc+cur, 0) + margin.x * cur.x,
          y: colHeight.slice(0, cur.y).reduce((acc, cur) => acc+cur, 0) + margin.y * cur.y,
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

export const calcPrice = ({ base = 0, mult = 1, add = 0 }) => ((base * mult) + add).toLocaleString()

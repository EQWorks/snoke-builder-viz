import { graphlib, layout } from 'dagre'

export const transform = ({ job_parameters, dag_tasks = [], stepConfig }) => {
  const { steps = [] } = job_parameters || {}
  const nodes = []
  const links = []

  function buildLink({ 
    target, 
    src, 
    findSrcNode = (nodeData, src) => nodeData.parameters.audience_id === src,
  }) {
    const { id: source } = nodes.find(({ data }) => findSrcNode(data, src)) || {}
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
        src.forEach(s => buildLink({ target: id, src: step.parameters[s], findSrcNode }))
      } else {
        buildLink({ target: id, src: step.parameters[src], findSrcNode })
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

const custom = ({ nodes, links, width, height }) => {
  // number of levels for nodes
  const length =  Math.max(nodes.length, 4)
  const nodesArray = new Array(length).fill(null).map(() => [])
  const basePosition = []
  // generate 2D array
  // create source-target list per each node. order + length are same as nodes
  const sourceTargetList = nodes.reduce(findSourceTarget(links), [])
  nodes.forEach(({ data: { level }, id }, i) => {
    if (!level) {
      level = i
    }
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

export const calcPrice = ({ base = 0, mult = 1, add = 0 }) => ((base * mult) + add).toLocaleString()

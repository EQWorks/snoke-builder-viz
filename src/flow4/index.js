import React, { useState } from "react";
import PropTypes from "prop-types";
import ReactFlow, { Controls } from "react-flow-renderer";
//import dagre from "dagre";
import useResizeAware from "react-resize-aware";

import DAGNode from "./dag-node";
import { useEffect } from "react";

const nodeTypes = { DAGNode };

//const onLoad = (flow) => flow.fitView()

export const stepProps = Object.freeze({
  audience_build_wi: {
    name: "Audience Build: Walk-in",
    level: 0,
  },
  audience_build_beacon: {
    name: "Audience Build: Beacon",
    level: 0,
  },
  audience_enrich_aoi: {
    name: "Enrichment: AOI",
    level: 1,
  },
  audience_enrich_xd: {
    name: "Enrichment: Cross Device",
    level: 1,
  },
  audience_intersect_vwi: {
    name: "Intersection: Verified Walk-in",
    level: 2,
  },
  audience_intersect_xwi: {
    name: "Intersection: Cross Chain Walk-in",
    level: 2,
  },
  segment: {
    name: "Segment",
    level: 3,
  },
  cohort_repeat_visits: {
    name: "Cohort Analysis: Visits",
    level: 3,
  },
  cohort_converted_visitors: {
    name: "Cohort Analysis: Converted Visitors",
    level: 3,
  },
  propensity: {
    name: "Propensity",
    level: 3,
  },
  report_wi: {
    name: "Report: Walk-in",
    level: 3,
  },
  report_vwi: {
    name: "Report: Verified Walk-in",
    level: 3,
  },
  report_xwi: {
    name: "Report: Cross Chain Walk-in",
    level: 3,
  },
});

const findSourceTarget = (links) => (acc, node) => {
  const { id } = node;
  let currentSource = [];
  let currentTarget = [];
  links.forEach((link) => {
    if (link.source === id) {
      const index = parseInt(link.target.charAt(0));
      currentTarget.push(index - 1);
      //index - 1 because the numbering starts from 1
    }
    if (link.target === id) {
      const index = parseInt(link.source.charAt(0));
      currentSource.push(index - 1);
    }
  });
  acc.push({ id: id, sourceList: currentSource, targetList: currentTarget });
  return acc;
};

export const transform = ({
  job_parameters,
  dag_tasks = [],
  width,
  height,
}) => {
  //console.log(job_parameters, dag_tasks)
  const { steps = [] } = job_parameters || {};
  const nodes = [];
  const links = [];

  // stateful helper functions
  function buildLink(target, src) {
    const { id: source } =
      nodes.find((n) => n.data.parameters.audience_id === src) || {};
    if (source == null) {
      return;
    }
    if (source === target) {
      return;
    }
    if (links.find((l) => l.source === source && l.target === target)) {
      return;
    }
    links.push({
      id: `${source}-${target}`,
      type: "link",
      source,
      target,
      animated: true,
    });
  }
  function buildLinks(target, sources) {
    sources.forEach((src) => {
      buildLink(target, src);
    });
  }
  function buildReportLink(target, src) {
    const { id: source } =
      nodes.find(
        (n) =>
          n.data.name.startsWith("report_") && n.data.parameters.report === src
      ) || {};
    if (source == null) {
      return;
    }
    if (source === target) {
      return;
    }
    if (links.find((l) => l.source === source && l.target === target)) {
      return;
    }
    links.push({
      id: `${source}-${target}`,
      source,
      target,
      animated: true,
    });
  }

  steps.forEach((step, i) => {
    const props = stepProps[step.name];
    const id = `${step.i || i+1}.${step.name}`;
    const p = step.parameters;
    nodes.push({
      id,
      type: "DAGNode",
      data: {
        ...step,
        display: `${props.name}${p.period ? ` - ${p.period}` : ""}`,
        dag: dag_tasks.find((d) => d.task_id === id),
      },
      level: props.level,
    });
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
    } = step.parameters;
    if (step.name.startsWith("audience_enrich_")) {
      buildLink(id, ori_audience);
    }
    if (step.name.startsWith("audience_intersect_")) {
      buildLinks(id, [pri_audience, sec_audience]);
    }
    if (["segment", "propensity"].includes(step.name)) {
      buildLink(id, audience_id);
    }
    if (step.name.startsWith("report_")) {
      buildLinks(id, [walkin_audid, beacon_audid, conversion_audid]);
    }
    if (step.name === "cohort_repeat_visits") {
      buildLink(id, visit_audience);
    }
    if (step.name === "cohort_converted_visitors") {
      buildLinks(id, [visit_audience, beacon_audience]);
    }
    if (
      [
        "propensity",
        "cohort_repeat_visits",
        "cohort_converted_visitors",
      ].includes(step.name)
    ) {
      buildReportLink(id, report);
    }
  });

  //number of levels for nodes
  const nodesArray = new Array(4).fill(null).map(() => []);
  const basePosition = [];
  //generate 2D array
  const sourceTargetList = nodes.reduce(findSourceTarget(links), []);
  //create source-target list per each node. order + length are same as nodes

  nodes.forEach(({ level, id }) => {
    basePosition.push({ x: level, y: nodesArray[level].length });
    nodesArray[level].push(id);
  });

  const maxCount = { x: 0, y: 0 };

  maxCount.x = nodesArray.length - 1;

  maxCount.y = nodesArray.reduce((acc, val) => {
    const length = val.length - 1;
    return acc < length ? length : acc;
  }, 0);

  const baseWidth = width / (maxCount.x + 1);
  const baseHeight = height / (maxCount.y + 1);
  let nodePositions = [...basePosition];
  const newNodes = nodes.map((element, index) => {
    const currentX = basePosition[index].x;
    const currentY = basePosition[index].y;
    const { sourceList } = sourceTargetList[index];
    if(sourceList.length > 0) {
      let num = 0;

      sourceList.forEach((src) => (num += basePosition[src].y));

      const adjustedY = num / sourceList.length;

      const isTaken = nodePositions.some(
        (element) =>
          (element.x === currentX && element.y === adjustedY)
      );
      if(isTaken) {
        nodePositions.push({ x: currentX, y: currentY })

      }
      else {
        nodePositions.push({ x: currentX, y: adjustedY })
        basePosition[index].y = adjustedY;
      }
    }
    else {
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
    };
  });

  return [...newNodes, ...links];
};

const Flow = ({ data, config }) => {
  const [resizeListner, size] = useResizeAware();
  //returns inner width and height
  const { width, height } = size;
  const [elements, setElements] = useState();
  // assign [data(JSON), id, position(x,y)]

  useEffect(() => {
    if (size.width !== null && size.height !== null) {
      setElements(transform({ ...data, width, height }));
    }
  }, [size]);
  return (
    <div style={{ width: "inherit", height: "inherit" }}>
      {resizeListner}
      <ReactFlow
        {...{
          // elementsSelectable: false,
          // nodesConnectable: false,
          // nodesDraggable: false,
          // zoomOnScroll: false,
          // zoomOnDoubleClick: false,
          // paneMoveable: false,
          //onLoad,
          nodeTypes,
          ...config,
        }}
        elements={elements}
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};

Flow.propTypes = {
  data: PropTypes.object,
  config: PropTypes.object,
};
Flow.defaultProps = {
  data: {},
  config: {},
};

export default Flow;

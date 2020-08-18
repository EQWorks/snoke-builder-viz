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


const adjustPos = (acc, val, i) => {
  //debugger;
  let { baselines, links } = acc;
  let divisor = 0;
  let dividend = 0;
  
  links.forEach(link => {
    if(link.target === val.id) {
      const num = parseInt(link.source.charAt(0));
      dividend += baselines[num-1].y;
      divisor++;
    }
  });

  if (divisor > 0) {
    baselines[i].y = dividend/divisor;
  }

  return {baselines, links};

}


const mapNodes = (acc, val, i, arr) => {
  //debugger;
  let { maxCount, currentPos, baselines } = acc;
  baselines.push({ x: currentPos.x, y: currentPos.y });
  if (i < arr.length - 1) {
    const currentLevel = val.level;
    const nextLevel = arr[i + 1].level;
    if (currentLevel === nextLevel) {
      currentPos.y++;
    } else {
      currentPos.y = 0;
      currentPos.x++;
    }
    if (maxCount.y < currentPos.y) {
      maxCount.y = currentPos.y;
    }
    if (maxCount.x < currentPos.x) {
      maxCount.x = currentPos.x;
    }
  }
  return { maxCount, currentPos, baselines };
};

// const getBasePos = (width, data) => {
//   const basePosData = data
//     .filter((d) => d.type === "DAGNode")
//     .sort()
//     .reduce(mapNodes, {
//       maxCount: {
//         x: 0,
//         y: 0,
//       },
//       currentPos: {
//         x: 0,
//         y: 0,
//       },
//       baselines: [],
//     });

//   //const calculatePos = data.filter((d) => d.type === 'DAGNode').reduce(flattenNodes,)
//   return basePosData;
// };

const getBasePos = (data) => {
  return data.sort().reduce(mapNodes, {
    maxCount: {
      x: 0,
      y: 0,
    },
    currentPos: {
      x: 0,
      y: 0,
    },
    baselines: [],
  });
};

export const transform = ({ job_parameters, dag_tasks = [], width, height }) => {
  //console.log(job_parameters, dag_tasks)
  console.log(width, height);
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
    //debugger;
    const props = stepProps[step.name];
    const id = `${step.i || i + 1}.${step.name}`;
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

  const { maxCount, baselines } = getBasePos(nodes);
  const adjusted = nodes.sort().reduce(adjustPos,{baselines, links})
  const baselines2 = adjusted.baselines;
  const baseWidth = width / (maxCount.x + 1);
  const baseHeight = height / (maxCount.y + 1);
  const newNodes = nodes.map((element, index) => {
    return baselines[index] !== undefined
      ? {
          ...element,
          position: {
            x: baselines2[index].x * baseWidth,
            y: baselines2[index].y * baseHeight,
          },
        }
      : { ...element };
  });


  return [...newNodes, ...links];
};

const Flow = ({ data, config }) => {
  const [resizeListner, size] = useResizeAware();
  //returns inner width and height
  const { width, height } = size;
  const [elements, setElements] = useState();
  // assign [data(JSON), id, position(x,y)]

  // useEffect(() => {
  //   if (size.width !== null && size.height !== null) {
  //     const { maxCount, baselines } = getBasePos(size.width, elements);
  //     const baseWidth = size.width / (maxCount.x + 1);
  //     const baseHeight = size.height / (maxCount.y + 1);
  //     const newElements = elements.map((element, index) => {
  //       return baselines[index] !== undefined
  //         ? {
  //             ...element,
  //             position: {
  //               x: baselines[index].x * baseWidth,
  //               y: baselines[index].y * baseHeight,
  //             },
  //           }
  //         : { ...element };
  //     });
  //     console.log(newElements);
  //     setElements(newElements);
  //   }
  // }, [size]);

  useEffect(()=>{
    if(size.width !== null && size.height !== null) {
      setElements(transform({ ...data, width, height }));
    }
  },[size])
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

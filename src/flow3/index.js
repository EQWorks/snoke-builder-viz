import React, { useState, useEffect } from "react";
import ReactFlow from "react-flow-renderer";
import useResizeAware from "react-resize-aware";

const data = [
  { id: "1", data: { label: "Node 1" }, position: { x: 0, y: 0 }, level: 1 },
  { id: "2", data: { label: "Node 2" }, position: { x: 0, y: 0 }, level: 2 },
  { id: "3", data: { label: "Node 3" }, position: { x: 0, y: 0 }, level: 2 },
  { id: "4", data: { label: "Node 4" }, position: { x: 0, y: 0 }, level: 3 },
  { id: "5", data: { label: "Node 5" }, position: { x: 0, y: 0 }, level: 3 },
  { id: "6", data: { label: "Node 6" }, position: { x: 0, y: 0 }, level: 3 },
  { id: "7", data: { label: "Node 7" }, position: { x: 0, y: 0 }, level: 4 },
  { id: "8", data: { label: "Node 8" }, position: { x: 0, y: 0 }, level: 4 },
  { id: "9", data: { label: "Node 9" }, position: { x: 0, y: 0 }, level: 5 },
  { id: "10", data: { label: "Node 10" }, position: { x: 0, y: 0 }, level: 5 },
];

const countLevel = (acc, val, i, arr) => {
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

const getBasePos = (width, data) => {
  return data.sort().reduce(countLevel, {
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

const Flow = () => {
  const [resizeListener, size] = useResizeAware();
  const [elements, setElements] = useState(data);

  //const baselineY = getBasePos(innerHeight, elements)

  useEffect(() => {
   // debugger;
    if (size.width !== null && size.height !== null) {
      const { maxCount, baselines } = getBasePos(size.width, elements);
      const baseWidth = size.width / (maxCount.x + 1);
      const baseHeight = size.height / (maxCount.y + 1);
      const newElements = elements.map((element, index) => ({
        ...element,
        position: {
          x: baselines[index].x * baseWidth,
          y: baselines[index].y * baseHeight,
        },
      }));
      //const newElements = elements.map((element, index) => console.log(baselines[index], element, index));
      setElements(newElements);
    }
  }, [size]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      {resizeListener}
      <ReactFlow elements={elements} />
    </div>
  );
};

export default Flow;

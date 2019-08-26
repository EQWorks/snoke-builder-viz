import React, { useReducer, useRef, useState } from 'react'

import { Graph } from 'react-d3-graph'
import {
  Container,
  Grid,
  ButtonGroup,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import uuid from 'uuid/v4'


const useStyles = makeStyles(theme => ({
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  formItem: {
    width: '100%',
    margin: theme.spacing(1),
  },
}))

const reducer = (data, { type, value }) =>{
  if (type === 'init') {
    return value
  }
  if (['nodes', 'links'].includes(type)) {
    return { ...data, [type]: value }
  }

  const { nodes, links } = data
  switch (type) {
    case 'remove_node': {
      const newNodes = nodes.map(n => ({ ...n }))
      const idx = newNodes.findIndex(n => n.id === value.id)
      newNodes.splice(idx, 1)
      return { ...data, nodes: newNodes }
    }
    case 'add_node': {
      return { ...data, nodes: [...nodes, value] }
    }
    case 'add_link': {
      return { ...data, links: [...links, value] }
    }
    case 'edit_node': {
      const newNodes = nodes.map(n => ({ ...n }))
      const idx = newNodes.findIndex(n => n.id === value.id)
      newNodes.splice(idx, 1, { ...newNodes[idx], ...value })
      return { ...data, nodes: newNodes }
    }
    default: {
      throw new Error(`Invalid action type ${type}`)
    }
  }
}
const activeInit = () => ({
  name: '',
  type: '',
})
const activeReducer = (active, {type, value}) => {
  if (type === 'init') {
    return value
  }
  if (type === 'reset') {
    return activeInit()
  }
  return { ...active, [type]: value }
}

export const Network = () => {
  const classes = useStyles()
  const config = {
    // automaticRearrangeAfterDropNode: true,
    collapsible: false,
    directed: true,
    focusAnimationDuration: 0.75,
    width: '100%',
    highlightDegree: 1,
    highlightOpacity: 1,
    linkHighlightBehavior: true,
    focusZoom: 1,
    maxZoom: 1,
    minZoom: 1,
    panAndZoom: false,
    nodeHighlightBehavior: true,
    staticGraph: false,
    d3: {
      alphaTarget: 0.05,
      gravity: -100,
      linkLength: 100,
      linkStrength: 1
    },
    node: {
      color: '#d3d3d3',
      fontColor: "black",
      "fontSize": 12,
      "fontWeight": "normal",
      "highlightColor": 'black',
      "highlightFontSize": 12,
      "highlightFontWeight": "normal",
      "highlightStrokeColor": "SAME",
      "highlightStrokeWidth": "SAME",
      labelProperty: ({ type, name }) => `${type}: ${name}`,
      "mouseCursor": "pointer",
      "opacity": 1,
      "renderLabel": true,
      "size": 200,
      "strokeColor": "none",
      "strokeWidth": 1.5,
      "svg": "",
      "symbolType": "circle"
    },
    "link": {
      "color": "#d3d3d3",
      "fontColor": "black",
      "fontSize": 8,
      "fontWeight": "normal",
      "highlightColor": "#d3d3d3",
      "highlightFontSize": 8,
      "highlightFontWeight": "normal",
      "labelProperty": "label",
      "mouseCursor": "pointer",
      "opacity": 1,
      "renderLabel": false,
      "semanticStrokeWidth": false,
      "strokeWidth": 1.5
    }
  }

  const graphEl = useRef(null)
  const newNode = node => ({
    ...node,
    id: uuid(),
    x: Math.floor(Math.random() * ((graphEl.current || {}).width || 400)),
    y: Math.floor(Math.random() * ((graphEl.current || {}).height || 200)),
  })

  const [data, dispatch] = useReducer(reducer, {
    nodes: [],
    links: [],
  })
  const [active, dispatchActive] = useReducer(activeReducer, null, activeInit)
  const [editMode, setEditMode] = useState(false)

  const onClickNode = (id) => {
    dispatchActive({ type: 'init', value: data.nodes.find(n => String(n.id) === String(id)) })
    setEditMode(true)
  }

  const onActiveChange = type => ({ target: { value } }) => {
    dispatchActive({ type, value })
  }

  const onCancel = () => {
    dispatchActive({ type: 'reset' })
    setEditMode(false)
  }
  const onSave = () => {
    // TODO: need to simultaneity update edges with same from/to
    const value = { ...active }
    if (active.id) {
      dispatch({ type: 'edit_node', value })
    } else {
      dispatch({ type: 'add_node', value: newNode(value) })
    }
    onCancel()
  }
  const onRemove = () => {
    dispatch({ type: 'remove_node', value: active })
    onCancel()
  }

  return (
    <Container maxWidth='lg'>
      <Grid container spacing={3}>
        <Grid item xs={5}>
          {editMode ? (
            <div className={classes.formContainer}>
              <FormControl className={classes.formItem} disabled={Boolean(active.id)}>
                <InputLabel htmlFor='step-type'>Type</InputLabel>
                <Select
                  value={active.type}
                  onChange={onActiveChange('type')}
                >
                  <MenuItem value='build_audience'>Build Audience</MenuItem>
                  <MenuItem value='enrich_audience'>Enrich Audience</MenuItem>
                  <MenuItem value='intersect_audience'>Intersect Audience</MenuItem>
                  <MenuItem value='deliver_segment'>Deliver Segment</MenuItem>
                  <MenuItem value='build_report'>Build Report</MenuItem>
                </Select>
              </FormControl>
              <TextField
                className={classes.formItem}
                id='step-name'
                label='Name'
                value={active.name}
                onChange={onActiveChange('name')}
              />
              <ButtonGroup fullWidth variant='contained' className={classes.formItem}>
                <Button
                  color='primary'
                  onClick={onSave}
                  disabled={!Object.keys(active).every(k => active[k])}
                >
                  Save
                </Button>
                <Button onClick={onCancel}>
                  Cancel
                </Button>
              </ButtonGroup>
              {active.id && (
                <Button color='secondary' onClick={onRemove} className={classes.formItem}>
                  Remove
                </Button>
              )}
            </div>
          ) : (
            <div>
              <Button
                variant='contained'
                onClick={() => {
                  setEditMode(true)
                }}
              >
                Add a Step
              </Button>
              <p>or click on a step to edit</p>
            </div>
          )}
        </Grid>
        <Grid item xs={7} ref={graphEl}>
          {(data.nodes || []).length > 0 ? (
            <Graph
              id='pbj-time'
              data={data}
              config={config}
              onClickNode={onClickNode}
            />
          ) : (
            <div>No Step</div>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

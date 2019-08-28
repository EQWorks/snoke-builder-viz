import React, { Fragment, useReducer, useRef, useState, useEffect } from 'react'

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
  Checkbox,
  ListItemText,
  Chip,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import uuid from 'uuid/v4'


const useStyles = makeStyles(theme => ({
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formItem: {
    width: '100%',
    margin: theme.spacing(1),
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
}))

const TYPES = [
  'build_audience',
  'enrich_audience',
  'intersect_audience',
  'deliver_segment',
  'build_report',
]

const reducer = (data, { type, value }) =>{
  if (type === 'init') {
    return value
  }
  if (['nodes', 'links'].includes(type)) {
    return { ...data, [type]: value }
  }

  const { nodes, links } = data
  const newNodes = nodes.map(n => ({ ...n }))
  switch (type) {
    case 'add_node': {
      return { ...data, nodes: [...nodes, value] }
    }
    case 'add_link': {
      return { ...data, links: [...links, value] }
    }
    case 'edit_node': {
      const idx = newNodes.findIndex(n => n.id === value.id)
      newNodes.splice(idx, 1, { ...newNodes[idx], ...value })
      return { ...data, nodes: newNodes }
    }
    case 'remove_node': {
      const idx = newNodes.findIndex(n => n.id === value.id)
      newNodes.splice(idx, 1)
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
  aud_type: '',
  poi_list: '',
  beacons: [],
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
  // these options to be provided through component props
  const beaconOpts = [
    { value: 1, text: 'some beacon' },
    { value: 2, text: 'some other beacon' },
  ]
  const poiOpts = [
    { value: 1, text: 'some POI list' },
    { value: 2, text: 'some other list' },
  ]

  const classes = useStyles()
  const config = {
    automaticRearrangeAfterDropNode: true,
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
      fontColor: '333333',
      fontSize: 14,
      fontWeight: 'normal',
      highlightColor: '333333',
      highlightFontSize: 14,
      highlightFontWeight: '900',
      highlightStrokeColor: 'SAME',
      highlightStrokeWidth: 'SAME',
      mouseCursor: "pointer",
      opacity: 1,
      renderLabel: true,
      labelProperty: ({ type, name }) => `${type}: ${name}`,
      size: 350,
      strokeColor: 'none',
      strokeWidth: 1.5,
      svg: '',
      symbolType: 'square'
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
    // TODO: more reasonable algo for new node placement
    x: Math.floor(Math.random() * ((graphEl.current || {}).width || 400)),
    y: Math.floor(Math.random() * ((graphEl.current || {}).height || 200)),
  })

  const [data, dispatch] = useReducer(reducer, {
    nodes: [],
    links: [],
  })
  const [active, dispatchActive] = useReducer(activeReducer, null, activeInit)
  const [editMode, setEditMode] = useState(false)

  const [canSave, setCanSave] = useState(false)
  useEffect(() => {
    let canSave = active.type && active.name
    if (active.type === 'build_audience') {
      canSave = canSave && active.aud_type
      if (active.aud_type === 'beacon') {
        canSave = canSave && (active.beacons.length > 0)
      } else if (active.aud_type === 'poi') {
        canSave = canSave && active.poi_list
      }
    }
    setCanSave(canSave)
  }, [active])

  const onClickNode = (id) => {
    const value = data.nodes.find(n => String(n.id) === String(id))
    dispatchActive({ type: 'init', value })
    setEditMode(true)
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

  const onActiveChange = ({ target: { name: type, value } }) => {
    dispatchActive({ type, value })
  }

  const audienceSubForm = () => (
    <Fragment>
      <FormControl className={classes.formItem}>
        <InputLabel htmlFor='aud-type'>Audience Type</InputLabel>
        <Select
          value={active.aud_type}
          onChange={onActiveChange}
          inputProps={{ name: 'aud_type', id: 'aud-type' }}
        >
          <MenuItem value='beacon'>Beacon</MenuItem>
          <MenuItem value='poi'>POIs</MenuItem>
        </Select>
      </FormControl>
      {active.aud_type === 'beacon' && (
        <FormControl className={classes.formItem}>
          <InputLabel htmlFor='aud-beacons'>Beacons</InputLabel>
          <Select
            multiple
            value={active.beacons}
            onChange={onActiveChange}
            inputProps={{ name: 'beacons', id: 'aud-beacons' }}
            renderValue={selected => (
              <div className={classes.chips}>
                {selected.map(value => (
                  <Chip
                    key={value}
                    label={beaconOpts.find(b => b.value === value).text}
                    className={classes.chip}
                  />
                ))}
              </div>
            )}
          >
            {beaconOpts.map(({ value, text }) => (
              <MenuItem key={value} value={value}>
                <Checkbox checked={active.beacons.indexOf(value) > -1} />
                <ListItemText primary={text} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {active.aud_type === 'poi' && (
        <FormControl className={classes.formItem}>
          <InputLabel htmlFor='aud-poi'>Audience POIs</InputLabel>
          <Select
            value={active.poi_list}
            onChange={onActiveChange}
            inputProps={{ name: 'poi_list', id: 'aud-poi' }}
          >
            {poiOpts.map(({ value, text }) => (
              <MenuItem key={value} value={value}>{text}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Fragment>
  )

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
                  onChange={onActiveChange}
                  inputProps={{ name: 'type', id: 'step-type' }}
                >
                  {TYPES.map(t => (
                    <MenuItem key={t} value={t}>
                      {t.split('_').map(v => `${v[0].toUpperCase()}${v.substring(1)}`).join(' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                className={classes.formItem}
                name='name'
                id='step-name'
                label='Name'
                value={active.name}
                onChange={onActiveChange}
              />
              {active.type === 'build_audience' && audienceSubForm()}
              <ButtonGroup fullWidth variant='contained' className={classes.formItem}>
                <Button
                  color='primary'
                  onClick={onSave}
                  disabled={!canSave}
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
            <div className={classes.formContainer}>
              <Button
                className={classes.formItem}
                variant='contained'
                onClick={() => {
                  setEditMode(true)
                }}
              >
                Add a Step
              </Button>
              {data.nodes.length > 0 && (
                <p>or click on a step to edit</p>
              )}
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

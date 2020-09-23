import React, { useEffect } from 'react'
import { useStoreState, useStoreActions } from 'react-flow-renderer'
import PropTypes from 'prop-types'
import { Dot } from './common'
import { humanTime, calcPrice } from './utils'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@eqworks/react-labs/dist/typography'

const useStyles = makeStyles((theme) => ({
  container: ({ width, height, isSelected }) => ({
    height: height,
    width: isSelected ? width : 0,
    padding: isSelected ? theme.spacing(3) : theme.spacing(0),
    boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.25)',
    flexDirection: 'column',
    transition: 'width .6s',
    flexWrap: 'nowrap',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
  }),
  item: {
    width: '100%',
    display: 'block',
  },
  status: {
    display: 'inline-block',
    marginRight: theme.spacing(1),
  },
}))

const Panel = ({ width, height }) => {

  const theme = useTheme()
  const nodes = useStoreState((store) => store.nodes)
  const edges = useStoreState((store) => store.edges)
  const [{ id: selected } = {}] = useStoreState(
    (store) => store.selectedElements || [],
  )
  const setElements = useStoreActions((store) => store.setElements)
  const { data = {} } = nodes.find(({ id }) => id === selected) || {}
  const { name, sub, period, price = {}, dag = {} } = data
  const isSelected = selected !== undefined ? true : false
  const classes = useStyles({ width, height, isSelected })

  useEffect(() => {
    if (selected) {
      // find all edges that contains selected in id
      const match = edges.filter((edge) => edge.id.includes(selected))
      const unmatch = edges.filter((edge) => !edge.id.includes(selected))
      setElements([
        ...nodes,
        ...unmatch.map((edge) => ({ ...edge, style: {} })),
        ...match.map((edge) => ({
          ...edge,
          style: { stroke: theme.palette.primary[700] },
        })),
      ])
    } else {
      setElements([...nodes, ...edges.map((edge) => ({ ...edge, style: {} }))])
    }
  }, [selected])

  return (
    <Grid container className={classes.container}>
      <Grid item className={classes.item}>
        <Typography variant="h5" marginBottom={3}>
          {name}
          {period ? ` (${period})` : ''}
          {sub ? `: ${sub}` : ''}
        </Typography>
      </Grid>
      {dag.state && (
        <Grid item className={classes.item}>
          <Typography variant="subtitle1">Status</Typography>
          <Typography marginBottom={3} variant="body1" className={classes.status}>
            {dag.state}
          </Typography>
          <Dot state={dag.state}></Dot>
        </Grid>
      )}
      {dag.duration && (
        <Grid item className={classes.item}>
          <Typography variant="subtitle1">Run time</Typography>
          <Typography marginBottom={3} variant="body1">
            {humanTime(dag.duration)}
          </Typography>
        </Grid>
      )}
      {Object.keys(price).length > 0 && (
        <Grid item className={classes.item}>
          <Typography variant="subtitle1">Price</Typography>
          <Typography marginBottom={3} variant="body1">
            {`$${calcPrice(price)}`}
          </Typography>
        </Grid>
      )}
    </Grid>
  )
}
Panel.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
}

export default Panel

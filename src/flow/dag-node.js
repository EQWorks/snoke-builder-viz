import React from 'react'
import PropTypes from 'prop-types'
import { Handle, useStoreState } from 'react-flow-renderer'
import { Dot } from './common'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@eqworks/react-labs/dist/typography'
import clsx from 'clsx'

const useStyles = makeStyles((theme) => ({
  nodeDefault: {
    zIndex: 1,
    maxWidth: 275,
    overflow: 'auto',
    padding: theme.spacing(2),
    borderRadius: 10,
    transition: 'all .4s',
    border: `solid 1px ${theme.palette.secondary[400]}`,
    backgroundColor: 'rgba(255,255,255,0.7)',
    '&:hover': {
      border: `solid 1px ${theme.palette.primary[200]}`,
    },
  },
  nodeActive: {
    border: `solid 1px ${theme.palette.primary[700]}`,
  },
  text: {
    display: 'inline-block',
    marginLeft: theme.spacing(1),
  },
  handle: {
    visibility: 'hidden',
  },
}))


const DAGNode = ({ id, data: { name, sub, level, period, dag = {} } }) => {
  const [{ id: selected } = {}] = useStoreState((store) => store.selectedElements || [])
  const classes = useStyles()
  
  return (
    <>
      {level !== 0 && (<Handle className={classes.handle} type='target' position='left' />)}
      <div className={clsx(classes.nodeDefault, { [classes.nodeActive]: selected === id })} selected={selected === id}>
        <Dot state={dag.state}></Dot>
        <Typography variant="body1" className={classes.text}>
          {name}
          {period ? ` (${period})` : ''}
          {sub ? `: ${sub}` : ''}
        </Typography>
      </div>
      {level !== 4 && (<Handle className={classes.handle} type='source' position='right' />)}
    </>
  )
}

DAGNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
}

export default DAGNode

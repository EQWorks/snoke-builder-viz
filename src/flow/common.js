import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'


const useStyles = makeStyles((theme) => ({
  dot: ({ state }) => ({
    height: theme.spacing(1),
    width: theme.spacing(1),
    backgroundColor: ({
      failed: theme?.palette?.error?.main || '#ea0000',
      success: theme?.palette?.success?.main || '#00d308',
      running: theme?.palette?.primary?.light || '#009aff',
      skipped: theme?.palette?.primary[200] || '#eeeeee',
    }[state] || '#eeeeee'),
    borderRadius: '50%',
    display: 'inline-block',
  }),
}))

export const Dot = ({ state }) => {
  const classes = useStyles({ state })
  return (<span className={classes.dot} />)
}
Dot.propTypes = { state: PropTypes.string.isRequired }

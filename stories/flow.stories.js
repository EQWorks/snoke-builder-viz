import React from 'react'

import { storiesOf } from '@storybook/react'

import { Visual } from '../src'
import sample from './sample'


storiesOf('Flow', module)
  .add('Visual', () => {
    return (<Visual job={sample} />)
  })

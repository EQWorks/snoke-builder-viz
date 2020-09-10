import { createElement } from 'react'
import { styled, setup } from 'goober'


setup(createElement)

export const Dot = styled('span')`
  height: 0.5rem;
  width: 0.5rem;
  background-color: ${({ state }) => ({
    failed: '#ea0000;',
    success: '#00d308;',
    running: '#009aff;',
    skipped: '#eeeeee;',
  }[state] || '#eeeeee')};
  border-radius: 50%;
  display: inline-block;
`

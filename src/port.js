import React from 'react'
import PropTypes from 'prop-types'

import styled from 'styled-components'


const PortDefaultOuter = styled.div`
  width: 24px;
  height: 24px;
  background: cornflowerblue;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Port = ({ port }) => (
  <PortDefaultOuter>
    {!port.properties && (
      <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
        <path fill="white" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
      </svg>
    )}
  </PortDefaultOuter>
)
Port.propTypes = { port: PropTypes.object }
Port.defaultProps = { port: {} }

export default Port

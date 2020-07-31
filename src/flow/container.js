import React from 'react'
import PropTypes from 'prop-types'

import styled, { createGlobalStyle } from 'styled-components'


const GlobalStyle = createGlobalStyle`
  body {
    margin: 0px;
    max-width: 100vw;
    max-height: 100vh;
    overflow: hidden;
    box-sizing: border-box;
  }
  *, :after, :before {
    box-sizing: inherit;
  }
`

const Content = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  max-width: 100%;
  max-height: 100%;
`

const Container = ({ children }) => (
  <Content>
    {children}
    <GlobalStyle />
  </Content>
)

Container.propTypes = { children: PropTypes.node.isRequired }

export default Container

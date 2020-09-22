import React from "react";
import { addDecorator, configure } from "@storybook/react";
import { ThemeProvider } from "@material-ui/core/styles";
import DefaultTheme from "@eqworks/react-labs/dist/theme";

import 'semantic-ui-css/semantic.min.css'

configure(require.context("../stories", true, /\.stories\.js$/), module);

const GlobalWrapper = (storyFn) => (
  <ThemeProvider theme={DefaultTheme}>{storyFn()}</ThemeProvider>
);

addDecorator(GlobalWrapper);

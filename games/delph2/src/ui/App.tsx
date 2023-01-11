import React from "react"
import { ChakraProvider } from "@chakra-ui/react"
import { AppProvider } from "./components/appProvider"
import { Global } from "@emotion/react"
import { Room } from "colyseus.js"
import { DelphsTableState } from "../syncing/schema/DelphsTableState"
import theme from "../main-site-components/theme"
import RightSideUI from "./components/RightSideUI"
import BattleStrategyPicker from "./components/BattleStrategyPicker"

const Fonts = () => (
  <Global
    styles={`
      /* latin */
      @font-face {
        font-family: 'Bebas Neue';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('https://delphsart.s3.fr-par.scw.cloud/BebasNeue-Regular.ttf');
      }
      /* latin */
      @font-face {
        font-family: 'Cairo';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('https://delphsart.s3.fr-par.scw.cloud/Cairo-Regular.ttf');
      }
      `}
  />
)

const App: React.FC<{ app: pc.Application; room: Room<DelphsTableState> }> = ({
  app,
  room,
}) => {
  return (
    <ChakraProvider theme={theme}>
      <Fonts />
      <AppProvider app={app} room={room}>
        <BattleStrategyPicker />
        <RightSideUI />
      </AppProvider>
    </ChakraProvider>
  )
}

export default App

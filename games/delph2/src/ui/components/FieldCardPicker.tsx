import { HStack } from "@chakra-ui/react"
import React, { useCallback } from "react"
import { usePlayCanvasContext } from "./appProvider"
import useCurrentPlayer from "./hooks/useCurrentPlayer"
import useInventory from "./hooks/useInventory"
import { PLAY_CARD_EVT } from "../../game"

import { Card } from "../../main-site-components/Card"
import { Item } from "../../syncing/schema/DelphsTableState"

const FieldCardPicker: React.FC = () => {
  const { app } = usePlayCanvasContext()
  const player = useCurrentPlayer()
  const inventory = useInventory(player)

  const onCardClick = useCallback((evt:React.MouseEvent<HTMLDivElement, MouseEvent>, item:Item) => {
    evt.stopPropagation()
    app.fire(PLAY_CARD_EVT, item)
  }, [app])

  return (
    <HStack w="100%">
      {inventory.map((i) => {
        return <Card showCost={true} card={i} key={`card-${i.name}`} minW={["90px", "90px", "90px", "110px"]} onMouseDown={(evt) => onCardClick(evt, i)}/>
      })}
    </HStack>
  )
}

export default FieldCardPicker

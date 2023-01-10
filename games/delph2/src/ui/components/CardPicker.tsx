import { HStack, Spacer } from "@chakra-ui/react"
import React, { useContext } from "react"
import { PLAY_CARD_EVT } from "../../game"
import { Card } from "../../main-site-components/Card"
import { Item } from "../../syncing/schema/DelphsTableState"
import { PlayCanvasApplicationContext } from "./appProvider"
import useCurrentPlayer from "./hooks/useCurrentPlayer"
import useInventory from "./hooks/useInventory"

const CardPicker: React.FC = () => {
  const { app } = useContext(PlayCanvasApplicationContext)
  const player = useCurrentPlayer()
  const inventory = useInventory(player)

  const onCardClick = (evt:React.MouseEvent<HTMLDivElement, MouseEvent>, item:Item) => {
    evt.stopPropagation()
    app.fire(PLAY_CARD_EVT, item)
    evt.preventDefault()
  }

  console.log("player/inventory: ", player?.name, inventory)
  return (
    <HStack w="100%">
      {inventory.map((i) => {
        return <Card showCost={true} card={i} key={`card-${i.name}`} minW={["90px", "90px", "90px", "110px"]} onMouseDown={(evt) => onCardClick(evt, i)}/>
      })}
    </HStack>
  )
}

export default CardPicker

import { Box, HStack, Spacer } from "@chakra-ui/react"
import React from "react"
import { Card } from "../../main-site-components/Card"
import useCurrentPlayer from "./hooks/useCurrentPlayer"
import useInventory from "./hooks/useInventory"

const CardPicker: React.FC = () => {
  const player = useCurrentPlayer()
  const inventory = useInventory(player)

  console.log("player/inventory: ", player?.name, inventory)
  return (
    <HStack w="100%" divider={<Spacer />}>
      {inventory.map((i) => {
        return <Card card={i} key={`card-${i.name}`} minW="110px" />
      })}
    </HStack>
  )
}

export default CardPicker

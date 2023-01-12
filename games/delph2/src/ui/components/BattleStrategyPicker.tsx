import {
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react"
import React, { useCallback, useEffect, useState } from "react"
import { CHOOSE_STRATEGY_EVT } from "../../game"
import { Card } from "../../main-site-components/Card"
import { BattlePhase, Item } from "../../syncing/schema/DelphsTableState"
import { usePlayCanvasContext } from "./appProvider"
import useCurrentPlayer from "./hooks/useCurrentPlayer"
import useInventory from "./hooks/useInventory"
import useWarriorBattle from "./hooks/useWarriorBattle"

const BattleStrategyPicker: React.FC = () => {
  const { app } = usePlayCanvasContext()
  const player = useCurrentPlayer()
  const inventory = useInventory(player, "battle")
  const playerBattle = useWarriorBattle(player)
  if (playerBattle) {
    console.log(
      "---------------> player battle detected, ",
      playerBattle.toJSON(),
      playerBattle.phase === BattlePhase.strategySelect
    )
  }
  const [isChosen, setIsChosen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!playerBattle) {
      setIsChosen(false)
      setIsOpen(false)
      return
    }
    if (isChosen) {
      setIsOpen(false)
      return
    }
    setIsOpen(playerBattle.phase === BattlePhase.strategySelect)
  }, [playerBattle, isChosen])

  const onCardClick = useCallback(
    (evt: React.MouseEvent<HTMLDivElement, MouseEvent>, item: Item) => {
      evt.stopPropagation()
      app.fire(CHOOSE_STRATEGY_EVT, item)
      setIsChosen(true)
    },
    [app]
  )

  return (
    <Modal isOpen={isOpen} onClose={() => console.log("onclose")}>
      <ModalOverlay />
      <ModalContent p="6" bgColor="rgba(0,0,0,0.6)">
        <ModalHeader>
          <Heading>Pick Your Strategy</Heading>
        </ModalHeader>
        <ModalBody>
          <Wrap>
            {inventory.map((i) => {
              return (
                <WrapItem key={`strategyCard-${i.name}`}>
                  <Card
                    showCost={false}
                    card={i}
                    minW={["90px", "90px", "90px", "110px"]}
                    onMouseDown={(evt) => onCardClick(evt, i)}
                  />
                </WrapItem>
              )
            })}
          </Wrap>
          <Text mt="4">You have 8 seconds.</Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default BattleStrategyPicker

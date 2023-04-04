import React from 'react'
import { Heading, HStack, VStack, Text, Button } from '@chakra-ui/react'
import { usePlayCanvasContext } from './appProvider'
import { Player, PlayerMetaGameDetails, RoomState } from '../../syncing/schema/PickleChessState'

const EndScreen: React.FC = () => {
  const { room } = usePlayCanvasContext()

  if (room.state.roomState !== RoomState.gameOver) {
    return null
  }

  const winner = room.state.winner
  const currentPlayer = room.sessionId

  const isWinner = winner === currentPlayer

  const details: Player = (room.state.players as any)[currentPlayer]
  const metaDetails = details?.metaGameDetails || {}

  return (
    <VStack spacing={5} mt={10}>
      <Heading>{isWinner ? "Winner!" : "Lost..."}</Heading>
      <VStack>
          <Heading size="lg">Level: {metaDetails.level}</Heading>

          <Heading size="lg">Wins until next level: {metaDetails.nextLevelIn}</Heading>

          <Heading size="lg">Attempts remaining today: {metaDetails.attemptsRemaining}</Heading>

          <HStack>
            <Button variant="primary" onClick={() => window.location.reload() }>Try Again</Button>
          </HStack>
      </VStack>
    </VStack>
  )
}

export default EndScreen
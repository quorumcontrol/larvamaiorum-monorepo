import 'mocha'
import { expect } from 'chai'
import BoardRunner from '../src/utils/BoardRunner'
import { GameRunner } from '../src/hooks/gameRunner'
import dotenv from 'dotenv'

dotenv.config()

describe('BoardRunner', () => {
  it('runs a board', async () => {
    const tableId = '0x99d7154f853b0774acb7d1dfbaa80656503793705b93c71df5e36d0ce5aa4c1b'
    const runner = new BoardRunner(tableId)
    await runner.run()
    console.log("board runner: rewards: ", runner.rewards())
    // expect(runner.grid?.warriors.find((w) => w.id === '0xc0997b65767E024F5bE15d04d6038f1176fedC66')?.attack).to.equal(400)
    // expect(runner.rewards()['0xc0997b65767E024F5bE15d04d6038f1176fedC66']).to.equal(9)
    // expect(runner.rewards()['0x200C57c209B167dB2e30c8D20d62ec0B60117E21']).to.equal(28)

    const gameRunner = new GameRunner('0x99d7154f853b0774acb7d1dfbaa80656503793705b93c71df5e36d0ce5aa4c1b', {} as HTMLIFrameElement)
    await gameRunner.setup()
    return new Promise((resolve) => {
      gameRunner.once('END', () => {
        console.log('gamerunner: ', gameRunner.grid?.rewards())
        gameRunner.stop()
        resolve()
      })
    })
  })
})
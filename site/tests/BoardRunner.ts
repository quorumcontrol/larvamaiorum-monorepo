import 'mocha'
import { expect } from 'chai'
import BoardRunner from '../src/utils/BoardRunner'

describe('BoardRunner', () => {
  it('runs a board', async () => {
    const tableId = '0x8149661a31c6ea03e19ec6f9e67d37ea047701fa8183d5d3eaf8ac05d7991344'
    const runner = new BoardRunner(tableId)
    await runner.run()
    console.log("rewards: ", runner.rewards())
    // expect(runner.grid?.warriors.find((w) => w.id === '0xc0997b65767E024F5bE15d04d6038f1176fedC66')?.attack).to.equal(400)
    // expect(runner.rewards()['0xc0997b65767E024F5bE15d04d6038f1176fedC66']).to.equal(9)
    // expect(runner.rewards()['0x200C57c209B167dB2e30c8D20d62ec0B60117E21']).to.equal(28)
  })
})
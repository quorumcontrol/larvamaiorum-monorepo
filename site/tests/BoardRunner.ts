import 'mocha'
import { expect } from 'chai'
import BoardRunner from '../server/BoardRunner'

describe('BoardRunner', () => {
  it('runs a board', async () => {
    const tableId = '0xfd9b86cd3839f32e30f67bc896ec48c055fb171816e0a9fae4085c6885038aa2'
    const runner = new BoardRunner(tableId)
    await runner.run()
    expect(runner.grid?.warriors.find((w) => w.id === '0xc0997b65767E024F5bE15d04d6038f1176fedC66')?.attack).to.equal(400)
    expect(runner.gumpOutput()['0xc0997b65767E024F5bE15d04d6038f1176fedC66']).to.equal(9)
    expect(runner.gumpOutput()['0x200C57c209B167dB2e30c8D20d62ec0B60117E21']).to.equal(28)
  })
})
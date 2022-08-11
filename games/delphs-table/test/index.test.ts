import Warrior from "../src/boardLogic/Warrior";
import Grid from "../src/boardLogic/Grid";
import { deterministicRandom } from "../src/boardLogic/random";

describe("Grid", () => {
  function generateFakeWarriors(count: number, seed: string) {
    const warriors = [];
    for (let i = 0; i < count; i++) {
      warriors[i] = new Warrior({
        id: `warrior-${i}-${seed}`,
        name: `Warius ${i}`,
        attack: deterministicRandom(1000, `generateFakeWarriors-${i}-attack`, seed),
        defense: deterministicRandom(800, `generateFakeWarriors-${i}-defense`, seed),
        initialHealth: deterministicRandom(
          2000,
          `generateFakeWarriors-${i}-health`,
          seed
        ),
      });
    }
    return warriors;
  }

  it("sets up correctly", () => {
    const seed = "setsUpCorrectly";
    const warriors = generateFakeWarriors(10, seed);
    const grid = new Grid({ warriors, seed, gameLength: 100, sizeX: 10, sizeY: 10 });
    grid.start(seed)
    expect(grid).toBeDefined();
  });

  it("ticks", () => {
    const seed = "test2";
    const warriors = generateFakeWarriors(10, seed);
    const grid = new Grid({ warriors, seed, gameLength: 100, sizeX: 10, sizeY: 10 });
    grid.start(seed)
    for (let i = 0; i < 100; i++) {
      expect(grid.doDevTick()).toBeTruthy();
    }
  });

  it('completes', async () => {
    
  })
});

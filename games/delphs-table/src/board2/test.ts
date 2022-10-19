import Grid from "../boardLogic/Grid";
import { InventoryItem } from "../boardLogic/items";
import Warrior, { WarriorStats } from "../boardLogic/Warrior";
import GameController from "./GameController";


interface IFrameRoll {
  index: number,
  random: string,
  destinations: { id: string, x: number, y: number }[]
  items: { player: string, item: InventoryItem }[]
}

interface SetupMessage {
  tableId: string,
  warriors: WarriorStats[],
  gameLength: number,
  firstRoll: IFrameRoll,
  wootgumpMultipler: number,
  tableSize: number,
}

export const setupMessage: SetupMessage = {
  "tableId": "0x62a93a9178b5f95c8f1ebb8a6c98eb477a25e6fb9d3fb7f8d4620ac84a4bce0a",
  "firstRoll": {
    "index": 4116,
    "random": "0x316b07617c90c24552f36a3045ef15cbd6b48eb84e6cb8829ed75985da9197b7",
    "destinations": [],
    "items": []
  },
  "warriors": [
    {
      "id": "0xe546b43E7fF912FEf7ED75D69c1d1319595F6080",
      "name": "tobowers",
      "attack": 1405,
      "defense": 477,
      "initialHealth": 757,
      "initialGump": 133,
      "initialInventory": {
        "0x0000000000000000000000000000000000000000-2": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 2
          }
        },
        "0x0000000000000000000000000000000000000000-3": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 3
          }
        }
      },
      "autoPlay": true
    },
    {
      "id": "0x6dBf5f4AF008001f9289cA3C318A23F0d021b1c9",
      "name": "Demario_Volkman97",
      "attack": 1202,
      "defense": 221,
      "initialHealth": 661,
      "initialGump": 71,
      "initialInventory": {
        "0x0000000000000000000000000000000000000000-2": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 2
          }
        },
        "0x0000000000000000000000000000000000000000-3": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 3
          }
        }
      },
      "autoPlay": true
    },
    {
      "id": "0xf06554f46Bb4Cae087B632142303298d625e9769",
      "name": "Zoie_West20",
      "attack": 595,
      "defense": 923,
      "initialHealth": 557,
      "initialGump": 133,
      "initialInventory": {
        "0x0000000000000000000000000000000000000000-2": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 2
          }
        },
        "0x0000000000000000000000000000000000000000-3": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 3
          }
        }
      },
      "autoPlay": true
    },
    {
      "id": "0xb25eA6Fd04E6D22EFD4d87faF475F45a78189146",
      "name": "Amiya14",
      "attack": 1067,
      "defense": 905,
      "initialHealth": 252,
      "initialGump": 236,
      "initialInventory": {
        "0x0000000000000000000000000000000000000000-2": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 2
          }
        },
        "0x0000000000000000000000000000000000000000-3": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 3
          }
        }
      },
      "autoPlay": true
    },
    {
      "id": "0xeC1CC32B2F7705A9812aF053ceC70Ec5C79907cA",
      "name": "Israel.Hartmann97",
      "attack": 519,
      "defense": 405,
      "initialHealth": 374,
      "initialGump": 1087,
      "initialInventory": {
        "0x0000000000000000000000000000000000000000-2": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 2
          }
        },
        "0x0000000000000000000000000000000000000000-3": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 3
          }
        }
      },
      "autoPlay": true
    },
    {
      "id": "0xad87eeC73B6a11bB1A98932a805F1Dbbd8c13918",
      "name": "Alysa_Hickle",
      "attack": 689,
      "defense": 230,
      "initialHealth": 202,
      "initialGump": 170,
      "initialInventory": {
        "0x0000000000000000000000000000000000000000-2": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 2
          }
        },
        "0x0000000000000000000000000000000000000000-3": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 3
          }
        }
      },
      "autoPlay": true
    },
    {
      "id": "0x96Fc5DB39Cfc9fdA37EB2bF56886262fEf7c3263",
      "name": "Felicity_Raynor43",
      "attack": 1481,
      "defense": 370,
      "initialHealth": 477,
      "initialGump": 13,
      "initialInventory": {
        "0x0000000000000000000000000000000000000000-2": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 2
          }
        },
        "0x0000000000000000000000000000000000000000-3": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 3
          }
        }
      },
      "autoPlay": true
    },
    {
      "id": "0x632cE535b9921DC62B83B4CE838ff5C610e7ee45",
      "name": "Sydney65",
      "attack": 1099,
      "defense": 533,
      "initialHealth": 327,
      "initialGump": 41,
      "initialInventory": {
        "0x0000000000000000000000000000000000000000-2": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 2
          }
        },
        "0x0000000000000000000000000000000000000000-3": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 3
          }
        }
      },
      "autoPlay": true
    },
    {
      "id": "0xf5B8885C0eD029F5466cAe07DB02cA949622F42a",
      "name": "Velda6",
      "attack": 911,
      "defense": 973,
      "initialHealth": 714,
      "initialGump": 45,
      "initialInventory": {
        "0x0000000000000000000000000000000000000000-2": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 2
          }
        },
        "0x0000000000000000000000000000000000000000-3": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 3
          }
        }
      },
      "autoPlay": true
    },
    {
      "id": "0x3dAA5E2DDACCB4079898A3d129A2cFD1E03405c7",
      "name": "Matilda.Fahey21",
      "attack": 525,
      "defense": 656,
      "initialHealth": 647,
      "initialGump": 100,
      "initialInventory": {
        "0x0000000000000000000000000000000000000000-2": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 2
          }
        },
        "0x0000000000000000000000000000000000000000-3": {
          "quantity": 1,
          "item": {
            "address": "0x0000000000000000000000000000000000000000",
            "id": 3
          }
        }
      },
      "autoPlay": true
    }],
  "gameLength": 15,
  "tableSize": 8,
  "wootgumpMultipler": 24
}


const warriors = setupMessage.warriors.map((w) => {
  return new Warrior({
    id: w.id,
    name: w.name,
    attack: w.attack,
    defense: w.defense,
    initialHealth: w.initialHealth,
    initialGump: w.initialGump,
    initialInventory: w.initialInventory,
    autoPlay: w.autoPlay,
  });
});

export const grid = new Grid({
  warriors,
  seed: setupMessage.firstRoll.random.toString(),
  sizeX: setupMessage.tableSize,
  sizeY: setupMessage.tableSize,
  gameLength: setupMessage.gameLength,
  wootgumpMultipler: setupMessage.wootgumpMultipler,
});

grid.start(setupMessage.firstRoll.random);

export class TestHarness {
  controller: GameController

  constructor(controller: GameController) {
    this.controller = controller
  }

  go() {
    this.controller.setupBoard({
      currentPlayer: '0xe546b43E7fF912FEf7ED75D69c1d1319595F6080', // tobowers
      tableSize: setupMessage.tableSize,
      seed: grid.currentSeed,
      gameLength: setupMessage.gameLength,
    })
    this.initializeWarriors()
  }

  tick() {
    console.log("test harness tick")
    const output = grid.handleTick(`${Date.now()}-random-for-tick`)
    this.controller.handleTick(output)
  }

  private initializeWarriors() {
    this.controller.setupWarriors(grid.warriors.map((w) => w.toWarriorState()))
  }
}

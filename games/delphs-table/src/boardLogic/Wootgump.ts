import {v4 as uuidv4} from 'uuid';


class Wootgump {
  id: string
  constructor() {
    this.id = uuidv4()
  }
}

export default Wootgump

import { Entity } from "playcanvas"

export default function mustFindByName(e:Entity, name:string) {
  const graphNode = e.findByName(name)
  if (!graphNode) {
    throw new Error('did not find ' + name)
  }
  return graphNode as Entity
}

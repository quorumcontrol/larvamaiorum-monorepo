import { MapSchema } from "@colyseus/schema";

function mapToValues<T>(map: MapSchema<T>) {
  const vals:T[] = []
  map.forEach((v) => {
    vals.push(v)
  })
  return vals
}

export default mapToValues

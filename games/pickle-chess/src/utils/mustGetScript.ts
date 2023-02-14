
function mustGetScript<T>(entity: pc.Entity, scriptName: string): T {
  const script = entity.script?.get(scriptName);
  if (!script) {
    console.error('could not find ', scriptName, ' on ', entity)
    throw new Error('unknown script')
  }
  return script as unknown as T;
}

export default mustGetScript

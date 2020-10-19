const { createClient, spaceCenter } = require('krpc-node')

async function init() {
  const client = await createClient()
  const vessel = await client.send(spaceCenter.getActiveVessel())
  
  let control = await vessel.control.get();
  let orbitalReference = await vessel.orbitalReferenceFrame.get();
  let flight = await vessel.flight(orbitalReference);
  await control.throttle.set(1);
  await control.sas.set(true);
  await control.activateNextStage()
}

init()

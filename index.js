const { createClient, spaceCenter } = require('krpc-node')

async function init() {
  const client = await createClient()
  const vessel = await client.send(spaceCenter.getActiveVessel())
  console.log(await vessel.name.get())
}

init()

const { createClient, spaceCenter } = require('krpc-node')

async function init() {
  const client = await createClient()
  console.log('Connected')
  const vessel = await client.send(spaceCenter.getActiveVessel())
  let accentPhase = true, cruisePhase = false, insertionPhase = false

  let control = await vessel.control.get();
  let orbitalReference = await vessel.orbitalReferenceFrame.get();
  let flight = await vessel.flight(orbitalReference);
  await control.throttle.set(1);
  await control.sas.set(false);
  console.log('Setting full engines')
  await control.activateNextStage();

    async function run () {
      while (accentPhase || cruisePhase || insertionPhase) {
        const altitude = await flight.meanAltitude.get()
        const heading = await flight.heading.get()
        const orbit = await vessel.orbit.get()
        const apoapsis = await orbit.apoapsisAltitude.get()

        if (accentPhase) {
          const targetPitch = 90 * ((50000 - altitude) / 50000)
          const pitchDiff = await flight.pitch.get() - targetPitch

          if (await vessel.thrust.get() === 0) {
            await control.activateNextStage()
          }
          if (heading < 180) {
            await control.yaw.set(pitchDiff / 90)
          } else {
            await control.yaw.set(0.5)
          }
          if (apoapsis > 71000) {
            await control.sas.set(true)
            await control.throttle.set(0)
            await control.sasMode.set('Prograde')
            cruisePhase = true
            accentPhase = false
          }
        }
        if (cruisePhase) {
          // const timeToApoapsis = await orbit.timeToApoapsis.get()
          if (altitude > 66000) {
            await control.sasMode.set('Prograde')
            await control.throttle.set(1)
            insertionPhase = true
            cruisePhase = false
          }
        }
        if (insertionPhase) {
          await control.throttle.set(1)
          if ( await vessel.thrust.get() === 0) {
            await control.activateNextStage()
          }

          if (await orbit.periapsisAltitude.get() > 69000) {
            await control.throttle.set(0)
            insertionPhase = false
          }
        }
      }
    }

    run()

};





init()

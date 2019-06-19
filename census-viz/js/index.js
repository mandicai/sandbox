Promise.all([
  d3.csv('data/Census-Data-for-Edit-Test.csv'),
  d3.csv('data/Census-Data-Metadata.csv')
]).then(data => {
  let censusValues = data[0],
    censusKey = data[1]

  let southernStates = ['Alabama', 'Kentucky', 'Mississippi', 'Tennessee'],
    racialMinorityGroupKeys = [
      {
        race: 'Black or African American',
        keys: ['HC01_VC50', 'HC02_VC50']
      },
      {
        race: 'American Indian and Alaska Native',
        keys: ['HC01_VC51', 'HC02_VC51']
      }
    ]

  let filteredCensusValues = censusValues.filter(value => southernStates.includes(value['GEO.display-label']))

  let racialFilteredCensusValues = filteredCensusValues.map(stateValue => {
    let data = []

    racialMinorityGroupKeys.forEach(raceObject => {
      data.push({
        race: raceObject.race,
        durationOne: stateValue[raceObject.keys[0]],
        durationTwo: stateValue[raceObject.keys[1]]
      })
    })

    return {
      state: stateValue['GEO.display-label'],
      data: data
    }
  })

  console.log(racialFilteredCensusValues)
})

export default {
  "toolbar": [],
  dependencies: {
    coreModules : [
      'GUID',
      'panels'
    ]
  },
  providedServices : {
    viewPort : {
      '1.0.0' : 'provideServiceV1'
    }
  }
}

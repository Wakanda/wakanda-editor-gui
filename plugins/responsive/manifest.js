export default {
  "toolbar": [],
  // NOTE: dependencies not yet used from here
  dependencies: {
    coreModules : [
      'GUID',
      'panels'
    ]
  },
  providedServices : {
    viewPort : {
      '1.0.0' : provideServiceV1
    }
  }
}

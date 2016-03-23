export default {
  "toolbar": [],
  // NOTE: dependencies not yet used from here
  dependencies: {
    coreModules : [
      'GUID',
      'panels'
    ]
  },
  consumedServices: {
    viewPort: {
      // FIXME: now it support only the exact version (maybe use https://www.npmjs.com/package/semver)
      "1.0.0": "consumedViewPortServiceV1"
    }
  }
}

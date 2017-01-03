import htmlComponentsAsJson from './IonicComponents'; // components


export default {

  activate({coreModules}) {
    // activation
  },

  componentsGroupServiceV1Consume(service){
    let componentsGroupService = service;

    let htmlComponents = componentsGroupService
      .createComponentsFromJson(htmlComponentsAsJson);

    componentsGroupService.addGroup({
      groupName: 'Ionic Components',
      components : htmlComponents
    });
  }

}

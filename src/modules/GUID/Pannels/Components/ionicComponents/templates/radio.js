
let componentJson = {
  manifest: {
    name: 'Radio Button',
    properties:[],
    methodes: []
  },
  template: `<ion-list>
  <ion-radio ng-model="choice" ng-value="'A'">Choose A</ion-radio>
  <ion-radio ng-model="choice" ng-value="'B'">Choose B</ion-radio>
</ion-list>`
}

export default componentJson;


let componentJson = {
  manifest: {
    name: 'ion-header-bar',
    properties:[],
    methodes: []
  },
  template: `<ion-header-bar align-title="left" class="bar-positive">
  <div class="buttons">
    <button class="button" ng-click="doSomething()">Left Button</button>
  </div>
  <h1 class="title">Title!</h1>
  <div class="buttons">
    <button class="button">Right Button</button>
  </div>
</ion-header-bar>`
}

export default componentJson;

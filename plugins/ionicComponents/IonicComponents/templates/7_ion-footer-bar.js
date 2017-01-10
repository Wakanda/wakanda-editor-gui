
let componentJson = {
  manifest: {
    name: 'ion-footer-bar',
    properties:[],
    methodes: []
  },
  template: `<ion-footer-bar align-title="left" class="bar-assertive">
  <div class="buttons">
    <button class="button">Left Button</button>
  </div>
  <h1 class="title">Title!</h1>
  <div class="buttons" ng-click="doSomething()">
    <button class="button">Right Button</button>
  </div>
</ion-footer-bar>`
}

export default componentJson;

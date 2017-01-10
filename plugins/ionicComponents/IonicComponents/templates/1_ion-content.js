
let componentJson = {
  manifest: {
    name: 'ion-content',
    properties:[],
    methodes: []
  },
  template: `<ion-content>
  <ion-refresher
    pulling-text="Pull to refresh..."
    on-refresh="doRefresh()">
  </ion-refresher>
  <ion-list>
    <ion-item></ion-item>
    <ion-item></ion-item>
    <ion-item></ion-item>
  </ion-list>
</ion-content>`
}

export default componentJson;


let componentJson = {
  manifest: {
    name: 'ion-reorder-button',
    properties:[],
    methodes: []
  },
  template: `<ion-reorder-button class="ion-navicon"
                        on-reorder="moveItem(item, $fromIndex, $toIndex)">
    </ion-reorder-button>`
}

export default componentJson;

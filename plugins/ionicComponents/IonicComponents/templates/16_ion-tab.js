
let componentJson = {
  manifest: {
    name: 'ion-tab',
    properties:[],
    methodes: []
  },
  template: `<ion-tab
  title="Tab!"
  icon="my-icon"
  href="#/tab/tab-link"
  on-select="onTabSelected()"
  on-deselect="onTabDeselected()">
</ion-tab>`
}

export default componentJson;

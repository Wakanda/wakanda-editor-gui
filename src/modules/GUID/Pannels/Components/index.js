import htmlComponentsAsJson from './HtmlComponents'; // components
import bootstrapComponentsAsJson from './BootstrapComponents'; // components
import ionicComponentsAsJson from './ionicComponents'; // components
import Component from './Component' //class


let [htmlComponents, bootstrapComponents, ionicComponents ] = [ htmlComponentsAsJson, bootstrapComponentsAsJson, ionicComponentsAsJson]
  .map((componentsAsJson) => {
    return componentsAsJson.map((compoJson)=>{
     return new Component({manifest: compoJson.manifest, template: compoJson.template});
    });
  });


class ComponentPanel {
  constructor({documentEditor, containerId}) {
    this.documentEditor = documentEditor;
    this.container = document.getElementById(containerId);

    this._initContainer();
  }

  _initContainer() {
    for (let c of [...htmlComponents, ...bootstrapComponents, ...ionicComponents]) {
      let div = document.createElement('div');
      div.innerHTML = c.name;

      div.renderComponent = () => {
        return c.createElement();
      };

      this.container.appendChild(div);
    }
  }
  //
  // //Take template content and return dom element
  // //Template must have *A SINGLE* top level tag, other tags must be child of this unique parent
  // _elementFromTemplate({template}) {
  //   let el = document.createElement('div');
  //   el.innerHTML = template;
  //   return el.firstChild;
  // }
}

export default ComponentPanel;

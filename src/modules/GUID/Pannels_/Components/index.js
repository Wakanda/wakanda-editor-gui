//import htmlComponentsAsJson from './HtmlComponents'; // components
import bootstrapComponentsAsJson from './BootstrapComponents'; // components
import directivesAsJson from './Directives'; // components
import Component from './Component' //class


let [bootstrapComponents, directives ] = [ bootstrapComponentsAsJson, directivesAsJson]
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
    for (let c of [...bootstrapComponents, ...directives]) {
      let div = document.createElement('div');
      div.innerHTML = c.name;

      div.getComponent = () => {
        return c;
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

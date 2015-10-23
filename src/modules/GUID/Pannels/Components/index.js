import HtmlComponents from './HtmlComponents';

class ComponentPanel {
  constructor({documentEditor, containerId}) {
    this.documentEditor = documentEditor;
    this.container = document.getElementById(containerId);

    this._initContainer();
  }

  _initContainer() {
    for (let c of HtmlComponents) {
      let div = document.createElement('div');
      div.innerHTML = c.name;

      let renderedElement = this._elementFromTemplate({
        template: c.template
      });
      div.renderComponent = () => {
        return renderedElement.cloneNode(true);
      };

      this.container.appendChild(div);
    }
  }

  //Take template content and return dom element
  //Template must have *A SINGLE* top level tag, other tags must be child of this unique parent
  _elementFromTemplate({template}) {
    let el = document.createElement('div');
    el.innerHTML = template;
    return el.firstChild;
  }
}

export default ComponentPanel;

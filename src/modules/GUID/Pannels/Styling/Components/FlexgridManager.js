class FlexgridManager {

  constructor({
    documentEditor
  }) {
    this.documentEditor = documentEditor;
    this.bodyContainer = null;

    //FIXME: has to find a better way to do that
    this.FLEXGRID_URL = 'http://localhost:9090/flexgrid.css';
    // this.MODERNIZR_URL = 'http://localhost:9090/modernizr.js';

    this._injectLib({
      flexgridUrl: this.FLEXGRID_URL
    });

    this.documentEditor.onReady(() => {
      this._checkContainerEncapsulation();
    });
  }

  _injectLib({flexgridUrl}) {

    let linkTag = document.createElement('link');
    linkTag.rel = 'stylesheet';
    linkTag.href = flexgridUrl;

    // let srcTag = document.createElement('script');
    // srcTag.type = 'text/javascript';
    // srcTag.src = modernizrUrl;

    let h = this.documentEditor.document.head;
    h.appendChild(linkTag);
    // h.appendChild(srcTag);
  }

  _checkContainerEncapsulation() {
    let d = this.documentEditor.document;
    var container = null;
    var i;

    //Check if there is a container on body's children
    let containerClass = d.getElementsByClassName('container');
    for (i = 0; i < containerClass.length; i++) {
      if (containerClass[i].parentElement === d.body) {
        container = containerClass[i];
        break;
      }
    }

    //If elements are not in a div.container, move them onto a new one
    if (!container) {
      container = d.createElement('div');
      container.setAttribute('class', 'container');

      let bodyElements = d.body.children;
      d.body.appendChild(container);

      while (d.body.childElementCount > 0 && d.body.children[0] != container) {
        container.appendChild(d.body.children[0]);
      }
    }

    // this.documentEditor.events.emit('GUID.dom.encapsulated');
    this.bodyContainer = container;
  }
}

export default FlexgridManager;

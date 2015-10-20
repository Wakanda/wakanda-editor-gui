class BoxManager {
  constructor({documentEditor}) {
    this.documentEditor = documentEditor;

    this.htmlElement = null;
    this.marginInputs = new Map();

    this._initHtmlElement();
    this._subscribeToDocumentEditorEvents();
  }

  _initHtmlElement() {

    let capitalize = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    let div = document.createElement('div');
    div.id = 'boxManager';
    this.htmlElement = div;

    let title = document.createElement('h6');
    title.innerHTML = 'Margin';
    div.appendChild(title);

    for (let pos of ['top', 'bottom', 'left', 'right']) {
      let input = document.createElement('input');
      input.id = 'boxManager' + capitalize(pos);
      input.type = 'text';

      input.addEventListener('change', () => {
        this.documentEditor.changeSelectedElementStyleAttribute({
          attribute: 'margin-' + pos,
          value: input.value
        });
      });

      this.marginInputs.set(pos, input);
      div.appendChild(input);
    }
    div.appendChild(document.createElement('div'));
  }

  appendToElement(element) {
    if (this.htmlElement) {
      element.appendChild(this.htmlElement);
    }
  }

  _subscribeToDocumentEditorEvents() {
    this.documentEditor.onElementSelected(({element}) => {
      if (element) {
        for (let pos of ['top', 'bottom', 'left', 'right']) {
          let input = this.marginInputs.get(pos);
          input.value = element.style['margin-' + pos];
        }
      }
    });
  }
}

export default BoxManager;

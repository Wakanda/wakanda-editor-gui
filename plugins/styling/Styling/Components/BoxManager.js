class BoxManager {
  constructor({documentEditor}) {
    this.documentEditor = documentEditor;

    this.htmlElement = null;
    this.marginInputs = new Map();
    this.paddingInputs = new Map();

    this._initHtmlElement();
    this._subscribeToDocumentEditorEvents();
  }

  _initHtmlElement() {
    this.htmlElement = document.createElement('div');

    this._initBoxForAttribute({
      attributeName: 'margin',
      attributeMap: this.marginInputs,
      container: this.htmlElement
    });
    this._initBoxForAttribute({
      attributeName: 'padding',
      attributeMap: this.paddingInputs,
      container: this.htmlElement
    });
  }

  _initBoxForAttribute({attributeName, attributeMap, container}) {
    let capitalize = (string) => {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    let div = document.createElement('div');
    div.className = 'boxManager';

    let title = document.createElement('h6');
    title.innerHTML = capitalize(attributeName);
    div.appendChild(title);

    for (let pos of ['top', 'bottom', 'left', 'right']) {
      let input = document.createElement('input');
      input.className = 'boxManager' + capitalize(pos);
      input.type = 'text';

      input.addEventListener('change', () => {
        this.documentEditor.changeSelectedElementStyleAttribute({
          attribute: attributeName + '-' + pos,
          value: input.value
        });
      });

      attributeMap.set(pos, input);
      div.appendChild(input);
    }

    let input = document.createElement('input');
    input.className = 'boxManagerMiddle';
    input.type = 'text';
    input.addEventListener('change', () => {
      this.documentEditor.changeSelectedElementStyleAttribute({
        attribute: attributeName,
        value: input.value
      });
    });
    attributeMap.set('all', input);
    div.appendChild(input);

    div.appendChild(document.createElement('div'));

    container.appendChild(div);
  }

  appendToElement(element) {
    if (this.htmlElement) {
      element.appendChild(this.htmlElement);
    }
  }

  _resetAttributes({element, attributeName, attributeMap}) {
    for (let pos of ['top', 'bottom', 'left', 'right']) {
      let input = attributeMap.get(pos);
      input.value = element.style[attributeName + '-' + pos];
    }

    let inputMiddle = attributeMap.get('all');
    let generalAttribute = element.style[attributeName];
    if (generalAttribute.match(/^\d+px$/)) {
      inputMiddle.value = generalAttribute;
    }
    else {
      inputMiddle.value = null;
    }
  }

  _resetSingleAttribute({element, position, attributeName, attributeMap}) {
    let input = attributeMap.get(position);
    input.value = element.style[attributeName + '-' + position];

    let inputMiddle = attributeMap.get('all');
    let generalAttribute = element.style[attributeName];
    if (generalAttribute.match(/^\d+px$/)) {
      inputMiddle.value = generalAttribute;
    }
    else {
      inputMiddle.value = null;
    }
  }

  _subscribeToDocumentEditorEvents() {
    this.documentEditor.onElementSelected(({element}) => {
      this.selectedElement = element;
      if (element) {
        this._resetAttributes({
          element,
          attributeName: 'margin',
          attributeMap: this.marginInputs
        });
        this._resetAttributes({
          element,
          attributeName: 'padding',
          attributeMap: this.paddingInputs
        });
      }
    });

    this.documentEditor.onElementStyleAttributeChange(({element, attribute, oldValue, value}) => {
      if (this.selectedElement === element) {

        if (attribute === 'margin' || attribute === 'padding') {
          this._resetAttributes({
            element,
            attributeName: attribute,
            attributeMap: attribute === 'margin' ? this.marginInputs : this.paddingInputs
          });
        }
        else {
          let regexp = new RegExp(/^(margin|padding)\-(top|bottom|left|right)$/);
          let result = regexp.exec(attribute);
          if (result && result.length > 1) {
            this._resetSingleAttribute({
              element,
              position: result[2],
              attributeName: result[1],
              attributeMap: result[1] === 'margin' ? this.marginInputs : this.paddingInputs
            });
          }
        }
      }
    });
  }
}

export default BoxManager;

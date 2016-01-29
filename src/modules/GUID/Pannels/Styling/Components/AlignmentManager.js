class AlignmentManager {
  constructor({documentEditor}) {
    this.documentEditor = documentEditor;

    this.horizontalModes = ['left', 'center', 'right', 'justify'];
    this.horizontalButtons = {};
    this.htmlElement = null;
    this.classButtonOn = 'btn-primary';
    this.classButtonOff = 'btn-default';
    this.currentHorizontalMode = null;

    this._initHtmlElement();
    this._initButtonListeners();
    this._subscribeToDocumentEditorEvents();
  }

  _initHtmlElement() {
    let div = this.htmlElement = document.createElement('div');

    let title = document.createElement('h6');
    title.innerHTML = 'Alignment';
    div.appendChild(title);

    for (let mode of this.horizontalModes) {
      let a = document.createElement('a');
      a.setAttribute('role', 'button');
      a.className = 'btn btn-default btn-sm';
      a.isOn = false;

      let i = document.createElement('i');
      i.className = 'fa fa-align-' + mode;

      a.appendChild(i);
      div.appendChild(a);
      this.horizontalButtons[mode] = a;
    }
  }

  _initButtonListeners() {
    for (let mode of this.horizontalModes) {
      let button = this.horizontalButtons[mode];

      button.addEventListener('click', () => {
        this._disableAllButtons({horizontal: true});
        this._toggleButton({button, on: true});
        this._horizontalValueChange({value: mode});
      });
    }
  }

  _horizontalValueChange({value}) {
    if (this.horizontalCallback) {
      this.horizontalCallback(value);
    }
  }

  onHorizontalValueChange(callback) {
    this.horizontalCallback = callback;
  }

  _toggleButton({button, on}) {

    button.isOn = on;
    if (on) {
      button.classList.remove(this.classButtonOff);
      button.classList.add(this.classButtonOn);
    }
    else {
      button.classList.remove(this.classButtonOn);
      button.classList.add(this.classButtonOff);
    }
  }

  _disableAllButtons({horizontal, vertical}) {
    if (horizontal) {
      for (let mode of this.horizontalModes) {
        this._toggleButton({
          button: this.horizontalButtons[mode],
          on: false
        });
      }
    }
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);
  }

  _subscribeToDocumentEditorEvents() {
    this.documentEditor.onElementSelected(({element}) => {
      if (this.selectedElement !== element) {
        this.selectedElement = element;

        let textAlign = this.documentEditor.styleManager.getInlineStyleAttribute({
          element,
          attribute: 'text-align'
        });
        if (textAlign && textAlign.length > 0) {
          let index = this.horizontalModes.indexOf(textAlign);
          if (index !== -1) {
            let button = this.horizontalButtons[textAlign];
            this._disableAllButtons({horizontal: true});
            this._toggleButton({
              button,
              on: true
            });
          }
        }
        else {
          this._disableAllButtons({horizontal: true});
        }
      }
    });

    this.documentEditor.onElementDeselected(() => {
      this.selectedElement = null;
      this._disableAllButtons({horizontal: true});
    });
  }
}

export default AlignmentManager;

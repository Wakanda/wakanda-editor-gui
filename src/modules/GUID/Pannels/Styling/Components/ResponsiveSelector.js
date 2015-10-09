class ResponsiveSelector {
  constructor({documentEditor}) {

    this.BUTTON_ACTIVE_CLASSES = 'btn btn-primary';
    this.BUTTON_INACTIVE_CLASSES = 'btn btn-default'
    this.DEVICE_SIZE_MAP = {
      phone: '750px',
      tablet: '950px',
      desktop: '100%'
    };

    this.documentEditor = documentEditor;

    this.buttons = [];
    this._initHtmlElement();
  }

  _initHtmlElement() {
    let _this = this;
    this.htmlElement = document.createElement('div');

    for (let device of ['phone', 'tablet', 'desktop']) {
      let b = document.createElement('a');
      b.setAttribute('role', 'button');
      b.innerHTML = device;
      b.className = this.BUTTON_INACTIVE_CLASSES;
      b.addEventListener('click', function () {
        _this._allButtonsInactive();
        b.className = _this.BUTTON_ACTIVE_CLASSES;
        _this._valueChange(device);
      });

      this.htmlElement.appendChild(b);
      this.buttons.push(b);
    }
  }

  _allButtonsInactive() {
    for (let b of this.buttons) {
      b.className = this.BUTTON_INACTIVE_CLASSES;
    }
  }

  _valueChange(value) {
    this.valueChangeCallBack(this.DEVICE_SIZE_MAP[value]);
  }

  onValueChange(callback) {
    this.valueChangeCallBack = callback;
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);
  }
}

export default ResponsiveSelector;

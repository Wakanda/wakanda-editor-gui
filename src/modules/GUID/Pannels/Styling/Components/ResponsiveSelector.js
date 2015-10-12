import responsiveDevices from './responsiveDevices';

class ResponsiveSelector {
  constructor({documentEditor}) {

    this.BUTTON_ACTIVE_CLASSES = 'btn btn-primary';
    this.BUTTON_INACTIVE_CLASSES = 'btn btn-default'
    this.DEVICE_SIZE_MAP = {
      xs: '600px',
      sm: '800px',
      md: '1024px',
      lg: '100%'
    };

    this.documentEditor = documentEditor;

    this.buttons = [];
    this._initHtmlElement();
  }

  _initHtmlElement() {
    let _this = this;
    this.htmlElement = document.createElement('div');

    for (let device of responsiveDevices.devices) {
      let b = document.createElement('a');
      b.setAttribute('role', 'button');
      b.innerHTML = device.name;
      b.className = this.BUTTON_INACTIVE_CLASSES;
      b.addEventListener('click', function () {
        _this._allButtonsInactive();
        b.className = _this.BUTTON_ACTIVE_CLASSES;
        _this._valueChange({
          width: device.width,
          minWidth: device.minWidth
        });
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

  _valueChange({width, minWidth}) {
    this.valueChangeCallBack({width, minWidth});
  }

  onValueChange(callback) {
    this.valueChangeCallBack = callback;
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);
  }
}

export default ResponsiveSelector;

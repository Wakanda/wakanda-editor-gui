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
    this.currentDeviceName = null;
    this.selectedElement = null;

    this._initHtmlElement();
    this._subscribeToDocumentEditorEvents();
  }

  _initHtmlElement() {
    let _this = this;
    this.htmlElement = document.createElement('div');
    this.htmlElement.style['margin-bottom'] = '10px';

    let div = document.createElement('div');
    div.innerHTML = 'Editor size';
    this.htmlElement.appendChild(div);

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
          minWidth: device.minWidth,
          deviceName: device.name
        });
      });

      this.htmlElement.appendChild(b);
      this.buttons.push(b);
    }

    this.classInput = document.createElement('input');
    this.classInput.placeholder = 'Responsive class';
    this.htmlElement.appendChild(this.classInput);
  }

  _allButtonsInactive() {
    for (let b of this.buttons) {
      b.className = this.BUTTON_INACTIVE_CLASSES;
    }
  }

  _valueChange({width, minWidth, deviceName}) {
    this.valueChangeCallBack({width, minWidth});
    this.currentDeviceName = deviceName;
    this._determineResponsiveClass({element: this.selectedElement});
  }

  onValueChange(callback) {
    this.valueChangeCallBack = callback;
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);
  }

  _determineResponsiveClass({element}) {
    this.classInput.value = null;

    if (this.currentDeviceName && element) {
      let classes = element.className.split(' ');
      let prefix = 'col-' + this.currentDeviceName + '-';

      for (let c of classes) {
        if (c.indexOf(prefix) != -1) {
          this.classInput.value = c;
          break;
        }
      }
    }
  }

  _subscribeToDocumentEditorEvents() {
    this.documentEditor.onElementSelected(({element}) => {
      this.selectedElement = element;
      this._determineResponsiveClass({element});
    });

    this.documentEditor.onElementDeselected(() => {
      this.selectedElement = null;
      this.classInput.value = null;
    });
  }
}

export default ResponsiveSelector;

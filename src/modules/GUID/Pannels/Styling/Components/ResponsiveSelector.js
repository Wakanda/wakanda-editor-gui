import responsiveDevices from './responsiveDevices';

class ResponsiveSelector {
  constructor({documentEditor}) {

    this.BUTTON_ACTIVE_CLASSES = 'btn btn-primary';
    this.BUTTON_INACTIVE_CLASSES = 'btn btn-default';

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
    this.classInput.disabled = true;
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
    this.classInput.disabled = false;
  }

  onSelectorValueChange(callback) {
    this.valueChangeCallBack = callback;
  }

  onClassInputValueChange(callback) {
    let _this = this;
    this.classInput.addEventListener('change', function () {
      if (_this.currentDeviceName && _this.selectedElement) {
        let esm = _this.documentEditor.styleManager.getElementStyleManager({element: _this.selectedElement});
        let newValue = _this.classInput.value;
        let oldValue = esm.getResponsiveClassForDeviceName({deviceName: _this.currentDeviceName});

        callback({newValue, oldValue});
      }
    });
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);
  }

  _determineResponsiveClass({element}) {
    if (element) {
      let manager = this.documentEditor.styleManager.getElementStyleManager({element});
      this.classInput.value = manager.getResponsiveClassForDeviceName({
        deviceName: this.currentDeviceName
      });
    }
    else {
      this.classInput.value = null;
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

    this.documentEditor.onElementClassadd(() => {
      if (this.selectedElement) {
        this._determineResponsiveClass({element: this.selectedElement});
      }
    });

    this.documentEditor.onElementClassRemove(() => {
      if (this.selectedElement) {
        this._determineResponsiveClass({element: this.selectedElement});
      }
    });

    this.documentEditor.onElementClassChange(({changeType, element, className})=>{
      if (element === this.selectedElement) {
        this._determineResponsiveClass({element: this.selectedElement});
      }
    });
  }
}

export default ResponsiveSelector;

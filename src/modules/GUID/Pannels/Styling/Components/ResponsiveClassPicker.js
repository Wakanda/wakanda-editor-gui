class ResponsiveClassPicker {

  constructor({documentEditor}) {

    this.documentEditor = documentEditor;
    this.htmlElement = null;
    this.currentDeviceName = null;
    this.selectedElement = null;
    this.optionsMap = new Map();

    this._initHtmlElement();
    this._subscribeToEvents();
    this._subscribeToDocumentEditorEvents();
  }

  _initHtmlElement() {
    let container = document.createElement('div');
    this.select = document.createElement('select');
    container.appendChild(this.select);
    this.htmlElement = container;
  }

  appendToElement(element) {
    element.appendChild(this.htmlElement);
  }

  onValueChange(callback) {
    this.select.addEventListener('change', () => {
      if (this.currentDeviceName && this.selectedElement) {
        let esm = this.documentEditor.styleManager.getElementStyleManager({element: this.selectedElement});
        var newValue = this.select.value;
        if (newValue == 'null') {
          newValue = null;
        }
        let oldValue = esm.getResponsiveClassForDeviceName({deviceName: this.currentDeviceName});

        callback({newValue, oldValue});
      }
    });
  }

  _emptySelect() {
    while (this.select.firstChild) {
      this.select.removeChild(this.select.firstChild);
    }
  }

  _switchToDevice({deviceName}) {
    this.currentDeviceName = deviceName;
    this._emptySelect();

    for (let opt of this._getOptions({deviceName})) {
      this.select.appendChild(opt);
    }
    console.log('#select refilled');
  }

  _determineResponsiveClass({element}) {
    if (element) {
      let manager = this.documentEditor.styleManager.getElementStyleManager({element});
      this.select.value = manager.getResponsiveClassForDeviceName({
        deviceName: this.currentDeviceName
      });
    }
    else {
      this.select.value = null;
    }
  }

  _getOptions({deviceName}) {
    if (this.optionsMap.has(deviceName)) {
      return this.optionsMap.get(deviceName);
    }

    let options = [];
    var opt = document.createElement('option');
    opt.value = null;
    opt.text = 'None';
    options.push(opt);
    for (var i = 1; i <= 12; i++) {
      opt = document.createElement('option');
      opt.value = 'col-' + deviceName + '-' + i;
      opt.text = 'col-' + deviceName + '-' + i;
      options.push(opt);
    }

    this.optionsMap.set(deviceName, options);
    return options;
  }

  _subscribeToEvents() {
    this.documentEditor.events.on('GUID.responsive.change', ({deviceName}) => {
      this._switchToDevice({deviceName});

      if (this.selectedElement) {
        this._determineResponsiveClass({element: this.selectedElement});
      }
    });
  }

  _subscribeToDocumentEditorEvents() {
    this.documentEditor.onElementSelected(({element}) => {
      this.selectedElement = element;
      this._determineResponsiveClass({element});
    });

    this.documentEditor.onElementDeselected(() => {
      this.selectedElement = null;
      this.select.value = null;
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

    this.documentEditor.onElementClassChange(() =>{
      if (this.selectedElement) {
        this._determineResponsiveClass({element: this.selectedElement});
      }
    });
  }
}

export default ResponsiveClassPicker;

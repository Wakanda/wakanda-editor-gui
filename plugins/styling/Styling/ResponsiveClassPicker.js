class ResponsiveClassPicker {

  constructor({documentEditor, portViewService}) {
    /*
    //  portViewService
    setPortView
    portViews
    onPortViewChange
    */
    this._portViewsService = portViewService;
    this.documentEditor = documentEditor;
    this.htmlElement = null;
    this.currentDeviceName = null;
    this.selectedElement = null;
    this.optionsMap = new Map();

    this._initHtmlElement();
    this._subscribeToEvents();
    this._subscribeToDocumentEditorEvents();

    this.onValueChange(({newValue, oldValue}) => {
      this.documentEditor.addRemoveClasses({
        classesToAdd: [newValue],
        classesToRemove: [oldValue]
      });
    });
  }

  _initHtmlElement() {
    let container = document.createElement('div');
    this.select = document.createElement('select');
    container.appendChild(this.select);
    this.htmlElement = container;
  }

  insertFirst(element) {
    let parent = element;
    let child = parent.firstChild;
    parent.insertBefore(this.htmlElement, child);
  }

  onValueChange(callback) {
    this.select.addEventListener('change', () => {
      if (this.currentDeviceName && this.selectedElement) {
        let esm = this.documentEditor.styleManager.getElementStyleManager({
          element: this.selectedElement
        });
        var newValue = this.select.value;
        if (newValue == 'null') {
          newValue = null;
        }
        let oldValue = this._getResponsiveClassForDeviceName({
          deviceName: this.currentDeviceName,
          element : this.selectedElement
        });

        callback({newValue, oldValue});
      }
    });
  }
  _getResponsiveClassForDeviceName({deviceName = this.currentDeviceName, element = this.selectedElement}){
    if (deviceName) {
      let classes = element.classList;
      let prefix = 'col-' + deviceName + '-';

      for (let c of classes) {
        if (c.indexOf(prefix) != -1) {
          return c;
        }
      }
    }

    return null;
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
    // console.log('#select refilled');
  }

  _determineResponsiveClass({element}) {
    if (element) {
      this.select.value = this._getResponsiveClassForDeviceName({
        deviceName: this.currentDeviceName,
        element
      });
      // let manager = this.documentEditor.styleManager.getElementStyleManager({element});
      // this.select.value = manager.getResponsiveClassForDeviceName({
      //   deviceName: this.currentDeviceName
      // });
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
    this._portViewsService.onPortViewChange(({deviceName}) => {
      this._switchToDevice({deviceName});

      if (this.selectedElement) {
        this._determineResponsiveClass({element: this.selectedElement});
      }
    });
    // this.documentEditor.events.on('GUID.responsive.change', ({deviceName}) => {
    //   this._switchToDevice({deviceName});
    //
    //   if (this.selectedElement) {
    //     this._determineResponsiveClass({element: this.selectedElement});
    //   }
    // });
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
  }
}

export default ResponsiveClassPicker;

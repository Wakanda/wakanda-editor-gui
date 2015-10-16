import ResponsiveDevices from './ResponsiveDevices';

class ResponsiveSelector {
  constructor({documentEditor, containerId}) {

    this.documentEditor = documentEditor;
    this.container = document.getElementById(containerId);

    this.buttons = new Map();
    this.currentDeviceName = null;
    this.selectedElement = null;
    this.iconBackgrounds = new Map();

    this._initHtmlElement();
    this._subscribeToDocumentEditorEvents();
  }

  _initHtmlElement() {

    var last;
    for (let device of ResponsiveDevices.devices) {
      let li = document.createElement('li');
      let b = document.createElement('a');
      b.setAttribute('role', 'button');

      for (let active of [true, false]) {
        let activeStr = active ? 'on' : 'off';
        this.iconBackgrounds.set(device.name + '_' + activeStr, this._iconBackground({
          deviceName: device.name,
          active: active
        }));
      }

      b.addEventListener('click', () => {
        this._toggleButton({button: b});
        this._valueChange({
          width: device.width,
          minWidth: device.minWidth,
          deviceName: device.name
        });
      });

      li.appendChild(b);
      this.buttons.set(b, {
        on: () => {
          b.style.background = this.iconBackgrounds.get(device.name + '_on');
        },
        off: () => {
          b.style.background = this.iconBackgrounds.get(device.name + '_off');
        }
      });
      this.container.appendChild(li);
      last = b;
    }
    this._toggleButton({button: last});

    // this.classInput = document.createElement('input');
    // this.classInput.placeholder = 'Responsive class';
    // this.classInput.disabled = true;
    // this.htmlElement.appendChild(this.classInput);
  }


  _iconBackground({deviceName, active}) {
    let iconUrl = 'url(\'./images/mediaqueries/' + deviceName + '_' + (active ? 'on' : 'off') + '.png\') center no-repeat';
    let bgColor = active ? '#FBB500' : '';

    return iconUrl + ' ' + bgColor;
  }

  _toggleButton({button}) {
    this.buttons.forEach((obj, b) => {
      if (b !== button) {
        obj.off();
      }
      else {
        obj.on();
      }
    });
  }

  _valueChange({width, minWidth, deviceName}) {
    this.documentEditor.changeDocumentSize({width: width, minWidth: minWidth});
    this.currentDeviceName = deviceName;
    // this._determineResponsiveClass({element: this.selectedElement});
    // this.classInput.disabled = false;
  }

  // onClassInputValueChange(callback) {
  //   let _this = this;
  //   this.classInput.addEventListener('change', function () {
  //     if (_this.currentDeviceName && _this.selectedElement) {
  //       let esm = _this.documentEditor.styleManager.getElementStyleManager({element: _this.selectedElement});
  //       let newValue = _this.classInput.value;
  //       let oldValue = esm.getResponsiveClassForDeviceName({deviceName: _this.currentDeviceName});
  //
  //       callback({newValue, oldValue});
  //     }
  //   });
  // }

  // _determineResponsiveClass({element}) {
  //   if (element) {
  //     let manager = this.documentEditor.styleManager.getElementStyleManager({element});
  //     this.classInput.value = manager.getResponsiveClassForDeviceName({
  //       deviceName: this.currentDeviceName
  //     });
  //   }
  //   else {
  //     this.classInput.value = null;
  //   }
  // }

  _subscribeToDocumentEditorEvents() {
    // this.documentEditor.onElementSelected(({element}) => {
    //   this.selectedElement = element;
    //   this._determineResponsiveClass({element});
    // });
    //
    // this.documentEditor.onElementDeselected(() => {
    //   this.selectedElement = null;
    //   this.classInput.value = null;
    // });
    //
    // this.documentEditor.onElementClassadd(() => {
    //   if (this.selectedElement) {
    //     this._determineResponsiveClass({element: this.selectedElement});
    //   }
    // });
    //
    // this.documentEditor.onElementClassRemove(() => {
    //   if (this.selectedElement) {
    //     this._determineResponsiveClass({element: this.selectedElement});
    //   }
    // });
    //
    // this.documentEditor.onElementClassChange(({changeType, element, className})=>{
    //   if (element === this.selectedElement) {
    //     this._determineResponsiveClass({element: this.selectedElement});
    //   }
    // });
  }
}

export default ResponsiveSelector;

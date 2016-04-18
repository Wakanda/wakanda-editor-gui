import ResponsiveDevices from './ResponsiveDevices';
// TODO: add packages dependencies for each
import MultiEvent from '../../../lib/multi-event-master/src/multi-event-es6.js';

class ResponsiveSelector {
  constructor({documentEditor, containerId, container}) {
    this._documentEditor = documentEditor;
    this._container = container || document.getElementById(containerId);

    this._buttons = new Map();
    this._iconBackgrounds = new Map();

    this._events = new MultiEvent();

    this._initHtmlElement();
  }

  _initHtmlElement() {
    var last;
    for (let device of ResponsiveDevices.devices) {
      let li = document.createElement('li');
      let b = document.createElement('a');
      b.setAttribute('role', 'button');

      for (let active of [true, false]) {
        let activeStr = active ? 'on' : 'off';
        this._iconBackgrounds.set(device.name + '_' + activeStr, this._iconBackground({
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
      this._buttons.set(b, {
        device,
        on: () => {
          b.style.background = this._iconBackgrounds.get(device.name + '_on');
        },
        off: () => {
          b.style.background = this._iconBackgrounds.get(device.name + '_off');
        }
      });
      this._container.appendChild(li);
      last = b;
    }
    this._toggleButton({button: last});
  }

  _getButtonFromDevice({deviceName}){
    let button = null;
    for(let current of this._buttons){
      if(current[0].name == deviceName){
        button = current[1];
        break;
      }
    }
    return button;
  }

  _iconBackground({deviceName, active}) {
    let iconUrl = 'url(\'./images/mediaqueries/' + deviceName + '_' + (active ? 'on' : 'off') + '.png\') center no-repeat';
    let bgColor = active ? '#FBB500' : '';

    return iconUrl + ' ' + bgColor;
  }

  _toggleButton({button}) {
    this._buttons.forEach((obj, b) => {
      if (b !== button) {
        obj.off();
      }
      else {
        obj.on();
      }
    });
  }

  _valueChange({width, minWidth, deviceName}) {
    this._documentEditor.changeDocumentSize({width: width, minWidth: minWidth});
    this._events.emit('change', {deviceName});
  }

  onPortViewChange(callBack){
    this._events.on('change', callBack);
  }
}

export default ResponsiveSelector;

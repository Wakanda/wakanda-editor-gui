import responsiveDevices from '../../Pannels/Styling/Components/responsiveDevices';

class ElementStyleManager{
  constructor({element}) {
    this.element = element;

    this.responsiveClasses = new Map();
    this._initResponsiveClasses();
  }

  getAttributeValue(attributeName) {
    return this.element.style[attributeName];
  }

  changeStyleAttribute({attributeName, value}) {

    if (this.element.style.hasOwnProperty(attributeName)) {
      console.log('setting ' + attributeName + ' property to ' + value + ' for element', this.element);
      this.element.style[attributeName] = value;
    }
  }

  setResponsiveClassForDeviceName({deviceName, className: newValue}) {
    if (deviceName) {

    }
  }

  getResponsiveClassForDeviceName({deviceName}) {
    return this.responsiveClasses.has(deviceName) ? this.responsiveClasses.get(deviceName) : null;
  }

  _getResponsiveClassForDeviceName({deviceName}) {
    if (deviceName) {
      let classes = this.element.classList;
      let prefix = 'col-' + deviceName + '-';

      for (let c of classes) {
        if (c.indexOf(prefix) != -1) {
          return c;
        }
      }
    }

    return null;
  }

  _initResponsiveClasses() {
    console.log('initializing responsive class map');
    for (let device of responsiveDevices.devices) {
      console.log('adding ' + device.name + ' to weakmap');

      let c = this._getResponsiveClassForDeviceName({
        deviceName: device.name
      });
      this.responsiveClasses.set(device.name, c);
    }
  }
}


export default ElementStyleManager;

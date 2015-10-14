import responsiveDevices from '../../Pannels/Styling/Components/responsiveDevices';

class ElementStyleManager{
  constructor({element}) {
    this.element = element;

    this.responsiveClasses = null;
    this.initResponsiveClasses();
  }

  addClass({className}) {
    console.log('Adding class ' + className);
    this.element.classList.add(className);
    this.initResponsiveClasses();
  }

  removeClass({className}) {
    console.log('Removing class ' + className);
    this.element.classList.remove(className);
    this.initResponsiveClasses();
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

  initResponsiveClasses() {
    this.responsiveClasses = new Map();

    for (let device of responsiveDevices.devices) {
      let c = this._getResponsiveClassForDeviceName({
        deviceName: device.name
      });
      this.responsiveClasses.set(device.name, c);
    }
  }
}


export default ElementStyleManager;

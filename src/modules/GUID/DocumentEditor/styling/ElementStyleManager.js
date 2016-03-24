class ElementStyleManager{
  constructor({element}) {
    this.element = element;

    this.responsiveClasses = null;
  }

  changeClassName({fullClassName}) {
    this.element.className = fullClassName;
  }

  addClass({className}) {
    console.log('Adding class ' + className);
    this.element.classList.add(className);
  }

  removeClass({className}) {
    console.log('Removing class ' + className);
    this.element.classList.remove(className);
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

  // getResponsiveClassForDeviceName({deviceName}) {
  //   return this.responsiveClasses.has(deviceName) ? this.responsiveClasses.get(deviceName) : null;
  // }

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

  //return an array container either "all" or actives borders (left, right, top and/or bottom)
  getEnabledBorders() {
    if (this.element.style.border.length > 0) {
      return ['all'];
    }
    else {
      let a = [];

      for (let side of ['top', 'right', 'bottom', 'left']) {
        if (this.element.style['border-' + side].length > 0) {
          a.push(side);
        }
      }

      return a;
    }
  }
}


export default ElementStyleManager;

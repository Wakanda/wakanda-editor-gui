class ElementStyleManager{
  constructor({element}) {
    this.element = element;
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

}


export default ElementStyleManager;

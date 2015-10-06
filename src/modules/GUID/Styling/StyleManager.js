export default class StyleManager {

  constructor({element, documentEditor}) {
    this.element = element;
    this.documentEditor = documentEditor;
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

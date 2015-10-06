import ElementStyleManager from './ElementStyleManager';

class StyleManager{
  constructor({document:d, /**/}){
    this.document = d;
    this.elementToElementStyleManager = new WeakMap();
  }

  changeInlineStyleAttribute({element, attributeName, value}){
    let elementStyleManager = this.getElementStyleManager({element});
    elementStyleManager.changeStyleAttribute({ attributeName, value });
  }

  getInlineStyleAttribute({element, attribute}){
    let elementStyleManager = this.getElementStyleManager({element});
    return elementStyleManager.getAttributeValue(attribute);
  }

  // NOTE: la liaison entre l'element et son manager se fait ici
  getElementStyleManager({element}){
    if(! this.elementToElementStyleManager.has(element)){
      let elementStyleManager = new ElementStyleManager({element});
      this.elementToElementStyleManager.set(element, elementStyleManager);
    }
    return this.elementToElementStyleManager.get(element);
  }

}

export default StyleManager;

import ElementStyleManager from './ElementStyleManager';
import StyleSheetManager from './StyleSheetManager';

class StyleManager{
  constructor({document:d, /**/}){
    this.document = d;
    this.elementToElementStyleManager = new WeakMap();
    this.sheetToStylesheetManager = new WeakMap();
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

  getAllStyleSheets() {
    var ret = [];
    for (var i = 0; i < this.document.styleSheets.length; i ++) {
    // for (let stylesheet of this.document.stylesheets) {
    let stylesheet = this.document.styleSheets[i];
      if (!this.sheetToStylesheetManager.has(stylesheet)) {
        this.sheetToStylesheetManager.set(stylesheet, new StyleSheetManager(stylesheet));
      }

      ret.push(this.sheetToStylesheetManager.get(stylesheet));
    }

    return ret;
  }
}

export default StyleManager;

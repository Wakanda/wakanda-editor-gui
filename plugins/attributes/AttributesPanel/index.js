import ContentRenderer from './ContentRenderer';
import AttributesRenderer from './AttributesRenderer';

class AttributesPanel{
  constructor({documentEditor,panelContainer, containerId}){
    this._documentEditor = documentEditor;
    this._panelContainer = panelContainer || document.getElementById(containerId);

    this._documentEditor.onElementSelected(({element})=>{
      this._selectedElement = element;
    });

    this._contentRenderer = this.initContentRenderer();
    this._attributesRenderer = this.initAttributesRenderer();
  }
  initAttributesRenderer(){
    let attributesRendererContainer = document.createElement('div');
    this._panelContainer.appendChild(attributesRendererContainer);

    let attributesRenderer = new AttributesRenderer({
      container: attributesRendererContainer,
      documentEditor: this._documentEditor
    });

    this._documentEditor.onElementSelected(({element})=>{
      attributesRenderer.clearAttributesList();
      let selectedElementAttributes = element.attributes;
      for(let ii = 0; ii < selectedElementAttributes.length; ii++){
        let attribute = selectedElementAttributes[ii];
        let attributeName = attribute.name,
            value = attribute.value;
        let ok = ( -1 === ['class', 'style'].indexOf(attributeName) );
        if(ok){
          attributesRenderer.fillAttribute({attributeName, value});
        }
      }
    });

    this._documentEditor.onElementAttributeChange(({element, attribute, oldValue, value})=>{
      if(element === this._selectedElement){
        // NOTE: binding needs optimisation
        attributesRenderer.fillAttribute({attributeName: attribute, value});
      }
    });

    attributesRenderer.onAttributeChange = (({attributeName, value})=>{
      let oldValue = this._selectedElement.getAttribute(attributeName);
      if(oldValue !== value){
        this._documentEditor.changeElementAttribute({attribute: attributeName, value});
      }
    });

    attributesRenderer.onClickAdd = ({attributeName, value})=>{
      this._documentEditor.changeElementAttribute({attribute: attributeName, value});
    };

    return attributesRenderer;
  }
  initContentRenderer(){
    let contentRendererContainer = document.createElement('div');
    this._panelContainer.appendChild(contentRendererContainer);

    let contentRenderer = new ContentRenderer({
      container: contentRendererContainer,
      documentEditor: this._documentEditor
    });

    this._documentEditor.onElementSelected(({element})=>{
      let content = this._documentEditor.getElementText({element});
      if(content !== null){
        contentRenderer.content = content;
        contentRenderer.onChange = (newContent)=>{
          if(newContent !== content){
            this._documentEditor.changeElementText({element, text : newContent});
          }
        }
        contentRenderer.content = content;
      }
    });
    this._documentEditor.onElementTextChange(({element, text})=>{
      if(this._selectedElement === element){
        contentRenderer.content = text;
      }
    });

    return contentRenderer;
  }
}


export default AttributesPanel;

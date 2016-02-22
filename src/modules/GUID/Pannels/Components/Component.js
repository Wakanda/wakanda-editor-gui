import {elementFromTemplate} from '../../functUtils';

class Property{
  constructor({propertyAsJson}){
    this._type = propertyAsJson.type;
    this._defaultValue = propertyAsJson.defaultValue
  }
  get defaultValue(){
    return this._defaultValue;
  }
  get type(){
    return this._type;
  }
}

class Component {
  constructor({manifest, template}){
    this._name = manifest.name;
    this._importHref = manifest.importHref;
    this._propertiesMap = new Map();
    this._template = template;
    this._methodes = manifest.methodes;

    manifest.properties.forEach((propertyAsJson)=>{
      this._propertiesMap.set(propertyAsJson.name, new Property({propertyAsJson}));
    });

    this._jsDependencies = manifest.jsDependencies;
    this._angularApplicationName = manifest.angularApplicationName;
  }

  get name(){
    return this._name;
  }

  get jsDependencies(){
    return this._jsDependencies || [];
  }
  
  get importHref(){
    return importHref || null;
  }

  get properties(){
    return this._propertiesMap.values();
  }

  get propertiesNames(){
    return this._propertiesMap.keys();
  }

  getProperyByName({propertyName}){
    return this._propertiesMap.get(propertyName);
  }

  get methodesNames(){
    return this._methodes;
  }

  createElement(){
    // IDEA: documentFragement
    return elementFromTemplate({template: this._template});
  }

}

export default Component;

class Script{
	constructor({scriptTag}){
		this._scriptTag = scriptTag;
		this._dependencies = new Set();
	}
	get src(){
		return this._scriptTag.getAttribute('src');
	}
	get text(){
		return (!this.src) && this._scriptTag.text;
	}
	get type(){
		if(this.src){
			return Script.SCRIPT_TYPE_FILE;
		}else{
			return Script.SCRIPT_TYPE_EMBD;
		}
	}
	addDependency({script}){
		this._dependencies.add(script);
	}
	get dependencies(){
		return [...this._dependencies.values()];
	}
	get tag(){
		return this._scriptTag;
	}
	equalsTo({script}){
		return this._scriptTag.outerHTML === script._scriptTag.outerHTML;
	}
}

Script.SCRIPT_TYPE_FILE = "File Script";
Script.SCRIPT_TYPE_EMBD = "Embeded Script";


export default Script;

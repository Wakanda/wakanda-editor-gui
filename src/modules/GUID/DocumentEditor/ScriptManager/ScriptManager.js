import Script from "./Script";

class ScriptManager{
	constructor({headerScripts}){
		this._template = document.createElement('template');
		this._template.innerHTML = headerScripts.join('');
		this._docFrag = this._template.content;

		this._scriptTagToScriptObj = new Map();
		[...this._docFrag.children].forEach(this.__initScriptTagFunction);
	}
	get __initScriptTagFunction(){
		return (scriptTag)=>{
			let scriptObj = new Script({scriptTag});
			this._scriptTagToScriptObj.set(scriptTag, scriptObj);
		}
	}

	get scripts(){
		let scriptsSet = new Set();
		let addScript = (script)=>{
			let dependencies = script.dependencies;
			dependencies.forEach(addScript);

			if(! scriptsSet.has(script)){
				scriptsSet.add(script);
			}
		};

		[...this._scriptTagToScriptObj.values()].forEach(addScript);

		return [...scriptsSet.values()];
	}

	get scriptsAsStringArray(){
		return this.scripts
			.map((script)=>{
				return script.tag.outerHTML;
			});
	}

	addScript ({script}){
		let scriptTag = script.tag;
		this._scriptTagToScriptObj.set(scriptTag, script);
		this._docFrag.appendChild(scriptTag);
	}

	addStringScript ({scriptAsString}){
		if(-1 === this.scriptsAsStringArray.indexOf(scriptAsString)){
			this.template.innerHTML += scriptAsString;
			this.__initScriptTagFunction(this._docFrag.lastElementChild);
		}
	}

	removeScript({script}){
		let scriptTag = script.tag;
		this._scriptTagToScriptObj.delete(scriptTag);
		this._docFrag.removeChild(scriptTag);
	}

}

export default ScriptManager;

import { HttpClient } from "../../../../lib/aurelia-http-client";

class Script {
	constructor({htmlTag, document:d}){
		this.document = d;
		this.htmlTag = htmlTag;

		// TODO: positions
		this._parentTag = this.htmlTag.parentElement
											|| this.document.head;
	}

	get codePromise(){
		return this._codePromise;
	}

	save(){
		console.error('Not yet implemented');
	}

	// NOTE: do not use those methods directly
	removeFromDocument(){
		let parent = this.htmlTag.parentElement
		parent.removeChild(this.htmlTag);
		return this;
	}

	// NOTE: do not use those methods directly
	addToDocument(){
		this._parentTag.appendChild(this.htmlTag);
		return this;
	}

	get text(){
		if(this._text){
			return this._text;
		}else if(this.src){
			return this.src.split('/').pop();
		}
	}
}

class ScriptEmbded extends Script {
	constructor({htmlTag, document:d, text}){
		super({ htmlTag, document:d });
		this._codePromise = this.loadCode();
		this._text = text || "Embded script";
	}

	get type(){
		return 'embded';
	}

	loadCode(){
		let promise;
		if(this.htmlTag.innerText){
			promise = Promise.resolve(this.htmlTag.innerText);
		}else{
			promise = Promise.reject({
				error : 'No tontent',
				tag: this.htmlTag
			});
		}

		return promise;
	}

	save({content}){
		// TODO: innerText/innerHTML
		this.innerHTML.content;
	}

}

class SctriptFile extends Script {
	constructor({htmlTag, document:d}){
		super({ htmlTag, document:d });
		this.http = new HttpClient();

		this.src = this.toAbsoluteUrl({
			src: this.htmlTag.getAttribute('src')
		});

		this._codePromise = this.loadCode();
	}

	toAbsoluteUrl({src}){
		// TODO: !important rewrite this methode
		if(src.indexOf('http') === 0){
			console.log('not yet ' + src);
			return null;
		}
		return `${this.document.location.origin}/workspace/${src}`;
	}

	get type(){
		return 'file';
	}

	loadCode(){
		this.src = this.toAbsoluteUrl({
			src: this.htmlTag.getAttribute('src')
		});
		if (this.src){
			return this.http.get(this.src)
											.then( (res) => res.response );
		}	else {
			return Promise.resolve("");
		}
	}
}

class ScriptManager{
	constructor({document:d}){
		this.document = d;

		this._scripts = this.initScripts();
	}
	// TODO: order
	addScript({script}){
		if(! this.exists(script)){
			this._scripts.push(script);
			script.addToDocument();
			return true;
		}else{
			return false;
		}
	}
// TODO: optimise script search and add ...
	removeScript({script}){
		if(this.exists({script})){
			let idx = this.getScriptIndex({script});
			script.removeFromDocument();
			this._scripts.splice(idx, 1);
			return true;
		}else{
			return false;
		}
	}

	getScriptIndex({script}){
		return this._scripts.indexOf(script);
	}

	exists({script}){
		let idx = this.getScriptIndex({script});
		return idx !== -1;
	}

	get scripts(){
		return this._scripts;
	}

	// TODO: static
	createEmbdedScript({content, text}){
		let scriptTag = this.document.createElement('script');

		scriptTag.setAttribute('type','text/javascript');
		scriptTag.innerHTML = content;

		return new ScriptEmbded({
			document: this.document,
			htmlTag: scriptTag,
			text
		});
	}

	initScripts(){
		let tags = this.document.querySelectorAll('script');
		return Array
			.from(tags)
			.map((htmlTag)=>{
				let src = htmlTag.getAttribute('src'),
						content = htmlTag.innerText;
				let constructorArgs = { htmlTag, document: this.document };
				if (src) {
					return new SctriptFile(constructorArgs);
				} else if (content) {
					return new ScriptEmbded(constructorArgs)
				} else {
					console.error('Something is going wrong around here');
				}
			})
			.filter( (script) => script !== undefined && script.text );// TODO: review
	}
}


export default ScriptManager;

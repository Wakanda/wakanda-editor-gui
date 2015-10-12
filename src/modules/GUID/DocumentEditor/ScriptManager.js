import { HttpClient } from "../../../../lib/aurelia-http-client";

class Script {
	constructor({htmlTag, document:d}){
		this.document = d;
		this.htmlTag = htmlTag;

		// TODO: positions
		this._parentTag = this.htmlTag.parentElement;
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
		this.parentElement.appendChild(this.htmlTag);
		return this;
	}
}

class ScriptEmbded extends Script {
	constructor({htmlTag, document:d}){
		super({ htmlTag, document:d });
		this._codePromise = this.loadCode();
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
		this._codePromise = this.loadCode();
	}

	toAbsoluteUrl({src}){
		// TODO: !important rewrite this methode
		if(src.indexOf('http') === 0){
			console.log('not yet ' + src);
			return null;
		}
		return `${this.document.location.origin}${src}`;
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

	get scripts(){
		return this._scripts;
	}

	// TODO: temporary code for poc only
	createEmbdedScript({content}){
		let scriptTag = this.document.createElement('script');

		scriptTag.setAttribute('type','text/javascript');
		scriptTag.innerHTML = content;
		this.document.head.appendChild(scriptTag);

		return new ScriptEmbded({
			document: this.document,
			htmlTag: scriptTag
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
			.filter( (script) => script !== undefined );
	}
}


export default ScriptManager;

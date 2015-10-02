import { HttpClient } from "../../../../lib/aurelia-http-client";

class Script {
	constructor({htmlTag, document:d}){
		this.document = d;
		this.htmlTag = htmlTag;

	}

	get codePromise(){
		return this._codePromise;
	}

	save(){
		console.error('Not yet implemented');
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
		return `${this.document.location.origin}/${src}`;
	}

	loadCode(){
		this.src = this.toAbsoluteUrl({
			src: this.htmlTag.getAttribute('src')
		});
		let promiseOfCode = this.http.get(this.src)
														.then( (res) => res.response );
		return promiseOfCode;
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

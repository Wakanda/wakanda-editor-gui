import { HttpClient }
from "../../../../lib/aurelia-http-client";

class ScriptTag {
	constructor({	document: d	}) {
		this.http = new HttpClient();

		this._document = d;
		this._sctiptTags = [];

		this._scriptSrcs = [];
		this._scriptContents = [];

		this.initTagArray();
	}

	// TODO: add onReady and organize dependencies
	get allCodePromise() {
		let promises = this._scriptSrcs.map(({promiseOfCode}) => promiseOfCode);
		let codesContent = this._scriptSrcs.map(({content}) => content);
		return Promise.all([...promises, ...codesContent])
			.then((codeBlocks) => {
				return codeBlocks.join("\n");
			});
	}

	initTagArray() {
		let scriptTags = this._document.querySelectorAll('script');

		this._sctiptTags = Array.from(scriptTags);
		this._sctiptTags.forEach((scriptTag) => {
			let src = scriptTag.getAttribute('src');
			let content = scriptTag.innerText;

			if (src) {
				// TODO: relative src only for the moment
				src = `${this._document.location.origin}${src}`;
				let promiseOfCode = this.http.get(src).then((res) => res.response);
				this._scriptSrcs.push({	scriptTag, src, promiseOfCode	});
			} else if (content) {
				this._scriptSrcs.push({	scriptTag, content });
			} else {
				console.error('Something is going wrong around here');
			}
		});
	}

	exists({ href }) {
		return (-1 !== this._scriptSrcs.indexOf(href));
	}


}

export default ScriptTag;

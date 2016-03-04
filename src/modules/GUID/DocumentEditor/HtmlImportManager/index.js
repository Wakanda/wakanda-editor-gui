class HtmlImportManager {
	constructor({importTagsAsStringArray}) {
		this._htmlImportSet = new Set();
		this._template = document.createElement('template');
		this._docFrag = this._template.content;

		this._template.innerHTML = importTagsAsStringArray.join('');
		[...this._docFrag.children].forEach((linkTag)=>{
			this.addImport({
				href: linkTag.getAttribute('href')
			});
		});
	}

	static _createTagFromHref({href}){
		let tag = document.createElement('link');
		tag.setAttribute('rel', 'import');
		tag.setAttribute('href', href);

		return tag;
	}

	exists({href}){
		return this._htmlImportSet.has(href);
	}

	addImport({href}){
		if(! this.exists({href})){
			this._htmlImportSet.add(href);
			let importTag = HtmlImportManager._createTagFromHref({href});
			this._docFrag.appendChild(importTag);
		}
	}

	removeImport({href}) {
		this._htmlImportSet.delete(href);
		let tag = this._docFrag.querySelector(`link[href="${href}"]`);
		this._docFrag.removeChild(tag);
	}

	get hrefs() {
		return [...this._htmlImportSet.values()];
	}

	get htmlImportTagsAsStringArray() {
		return [...this._docFrag.children].map((linkTag)=>{
			return linkTag.outerHTML;
		});
	}

}

export default HtmlImportManager;

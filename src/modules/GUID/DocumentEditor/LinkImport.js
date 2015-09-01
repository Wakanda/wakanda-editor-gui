class LinkImport {
	static addImportToDocument(doc, href) {
		let link = doc.createElement('link');

		link.setAttribute('rel', 'import');
		link.setAttribute('href', href);

		doc.head.appendChild(link);
	}

	constructor(args) {
		this.document = args.document;
		this.initImportHref();

	}

	initImportHref() {
		let linkNodes = this.document.querySelectorAll('link[rel="import"]');

		this.importHrefs = Array.prototype.map.call(linkNodes, function(linkNode) {
			return linkNode.getAttribute('href');
		});
	}

	addImport(href){
		if (href !== undefined && -1 == this.importHrefs.indexOf(href)) {
			this.importHrefs.push(href);
			LinkImport.addImportToDocument(href);
		}
	}

	addPolymerWidget(polymerWidget) {
		let importHref = polymerWidget['import'];
		this.addImport(importHref);
	}

	removeImport(href){
		let index = this.importHrefs.indexOf(href);
		if (index !== -1) {
			this.importHrefs.splice(index, 1);
			let linkInDom = this.document.querySelector('link[rel="import"][href="' + href + '"]');
			if (linkInDom.parentNode) {
				linkInDom.parentNode.removeChild(linkInDom);
			}
		}
	}

	//TODO: this function is not yet used
	removePolymerWidget(polymerWidget) {
		let importHref = polymerWidget['import'];
		this.removeImport(importHref);
	}

}

export default LinkImport;

class LinkImport {
	static addImportToDocument(doc, href) {
		let link = doc.createElement('link');

		link.setAttribute('rel', 'import');
		link.setAttribute('href', href);

		doc.head.appendChild(link);
	}

	constructor(doc) {
		this.document = doc;
		this.initImportHref();

	}

	initImportHref() {
		let linkNodes = this.document.querySelectorAll('link[rel="import"]');

		this.importHrefs = Array.prototype.map.call(linkNodes, function(linkNode) {
			return linkNode.getAttribute('href');
		});
	}

	addPolymerWidget(polymerWidget) {
		let importHref = polymerWidget['import'];
		if (importHref !== undefined && -1 == this.importHrefs.indexOf(importHref)) {
			this.importHrefs.push(importHref);
			LinkImport.addImportToDocument(importHref);
		}
	}

	//TODO: this function is not yet used
	removePolymerWidget(polymerWidget) {
		let importHref = polymerWidget['import'];
		let index = this.importHrefs.indexOf(importHref);
		if (index !== -1) {
			this.importHrefs.splice(index, 1);
			let linkInDom = this.document.querySelector('link[rel="import"][href="' + importHref + '"]');
			if (linkInDom.parentNode) {
				linkInDom.parentNode.removeChild(linkInDom);
			}
		}
	}

}

export default LinkImport;

class Outline {
	constructor(args) {
		let {
			containerId
		} = args;
		this.container = document.getElementById(containerId);
		this.documentEditor = IDE.GUID.documentEditor;
		this.userInterface = IDE.GUID.userInterface;

		this.elementToIdWP = new WeakMap();
		this.render();
		this.syncWihDocumentEditor();
	}

	getDomPath(el) {
		//TODO change this
		// if (el.tagName.toLowerCase() === 'html' || !el) {
		// 	el = el.getElementsByTagName('body');
		// }
		if (this.elementToIdWP.has(el)) {
			return this.elementToIdWP.get(el);
		}
		var stack = [];
		while (el.parentNode != null) {
			//console.log(el.nodeName);
			var sibCount = 0;
			var sibIndex = 0;
			for (var i = 0; i < el.parentNode.childNodes.length; i++) {
				var sib = el.parentNode.childNodes[i];
				if (sib.nodeName == el.nodeName) {
					if (sib === el) {
						sibIndex = sibCount;
					}
					sibCount++;
				}
			}
			if (el.hasAttribute('id') && el.id != '') {
				stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
			} else if (sibCount > 1) {
				stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
			} else {
				stack.unshift(el.nodeName.toLowerCase());
			}
			el = el.parentNode;
		}
		let ret = stack.slice(1);

		this.elementToIdWP.set(el, ret);

		return ret; // removes the html element
	}

	render() {
		let _this = this;

		var jstree = require("../../../../lib/jstree/jstree.js");
		var $ = require("../../../../lib/jquery-2.1.3.min.js");

		this.$container = $(this.container);
		this.$container.jstree({
			core: {
				data: function(obj, cb) {
					let data = [];

					IDE.GUID.documentEditor.documentPromise.then((iframeDoc) => {
						let itemsN = iframeDoc.body.getElementsByTagName("*");
						let items = [];
						for(let i = 0; i<itemsN.length; i++){
							items.push(itemsN.item(i));
						}
						// items = Object.keys(items).map(key => items[key]);
						items.push(iframeDoc.body);

						_this.idToElementMap = new Map();

						for (var i = 0; i < items.length; i++) {
							let item = items[i];
							if (item.tagName.toLowerCase() === 'script') {
								continue;
							}
							let itemPath = _this.getDomPath(item);

							let id = itemPath.join(' > ');
							let text = item.tagName.toLowerCase();
							let textWithId = itemPath.pop();
							if(textWithId.indexOf('#') !== -1){
								text = textWithId;
							}
							let parent = itemPath.length ? itemPath.join(' > ') : '#';

							let icon = require('./html.png');

							_this.idToElementMap.set(id, item);

							data.push({ id, parent, text, icon });
						}
						cb(data);

					});
				}
			}
		});

	}

	syncWihDocumentEditor() {
		let _this = this;
		this.$container.on("changed.jstree", function(e, data) {
			if (data.action === "select_node") {
				let element = _this.idToElementMap.get(data.node.id);
				if (_this.documentEditor.selectedElement !== element) {
					_this.documentEditor.selectElement({
						element
					});
					console.log(data.node.id);
				}
			}
		});
		this.$container.bind("hover_node.jstree", function(e, data) {
			let element = _this.idToElementMap.get(data.node.id);
			IDE.GUID.userInterface.highLightElement(element);
		});
		this.$container.bind("dehover_node.jstree", function(e, data) {
			IDE.GUID.userInterface.clearHighLighting();
		});


		this.documentEditor.onElementSelected(function(args) {
			let {
				element
			} = args;
			let id = _this.getDomPath(element).join(' > ');
			let treeInstance = _this.$container.jstree(true);
			treeInstance.deselect_all();
			treeInstance.select_node(id);
		});
		this.userInterface.onElementHighLight(function(args) {
			let {
				element
			} = args;
			let treeInstance = _this.$container.jstree(true);
			if (!(element.tagName)) {
				console.log(element);
			}
			if (element.tagName.toLowerCase() === 'html') {
				treeInstance.dehover_node('body');
			} else {
				let id = _this.getDomPath(element).join(' > ');
				// treeInstance.deselect_all();
				treeInstance.hover_node(id);
			}
		});
		this.userInterface.onClearHighLighting(function(args) {
			let {
				element
			} = args;
			let treeInstance = _this.$container.jstree(true);
			if (!(element)) {
				console.log(element);
			}
			if (element.tagName.toLowerCase() === 'html') {
				treeInstance.dehover_node('body');
			} else {
				let id = _this.getDomPath(element).join(' > ');
				// treeInstance.deselect_all();
				treeInstance.dehover_node(id);
			}
		});
	}


}


export default Outline;

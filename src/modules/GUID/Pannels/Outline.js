//TODO Join(' > ')

class Outline {
	constructor({
		containerId, documentEditor = IDE.GUID.documentEditor,
		userInterface = IDE.GUID.userInterface
	}) {
		this.documentEditor = documentEditor;
		this.userInterface = userInterface;

		this.container = document.getElementById(containerId);

		this.elementToIdWP = new WeakMap();
		this.render();
		this.syncWihDocumentEditor();
		this.syncWihUserInterface();
	}

	getDomPath(el) {
		//TODO change this
		// if (el.tagName.toLowerCase() === 'html' || !el) {
		// 	el = el.getElementsByTagName('body');
		// }
		let el_o = el;
		if (this.elementToIdWP.has(el)) {
			return this.elementToIdWP.get(el).slice();
		}
		var stack = [];
		while (el.parentNode != null) {
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
		this.elementToIdWP.set(el_o, ret);
		return ret.slice(); // removes the html element
	}

	getElementFromId(id) {
		if (this.idToElementMap.has(id)) {
			return this.idToElementMap.get(id);
		} else {
			console.log('warning');
		}
	}

	addElement(element) {
		let {
			id, parent, text, icon
		} = this.createJsTreeNode(element);

		this.idToElementMap.set(id, element);

		let jst = this.$container.jstree();

		jst.create_node(parent, {
			id, text, icon
		});

		jst.refresh();
	}

	removeElement({element, id}) { // id or element
		id = id || this.getDomPath(element).join(' > ');
		let jst = this.$container.jstree();

		jst.delete_node(id);

		jst.refresh();
	}

	render() {
		let _this = this;

		var jstree = require("../../../../lib/jstree/jstree.js");
		var $ = require("../../../../lib/jquery-2.1.3.min.js");

		this.$container = $(this.container);
		this.$container.jstree({
			plugins: ["contextmenu"],
			contextmenu: {
				items: function($node) {
					return {
						Delete: {
							label: "Remove",
							action: function(obj) {
								let {
									id
								} = $node;
								let element = _this.getElementFromId(id);
								_this.documentEditor.removeElement({
									element
								});
							}
						}
					};
				}
			},
			core: {
				data: function(obj, cb) {
					let data = [];

					_this.documentEditor.onDomEncapsulated((iframeDoc) => {
						let itemsN = iframeDoc.body.getElementsByTagName("*");
						let items = [];
						for (let i = 0; i < itemsN.length; i++) {
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

							let {
								id, parent, text, icon
							} = _this.createJsTreeNode(item);

							_this.idToElementMap.set(id, item);

							data.push({
								id, parent, text, icon
							});
						}
						cb(data);

					});
				}
			}
		});

	}

	createJsTreeNode(item) {
		let itemPath = this.getDomPath(item);

		let id = itemPath.join(' > ');
		let text = item.tagName.toLowerCase();
		let textWithId = itemPath.pop();
		if (textWithId.indexOf('#') !== -1) {
			text = textWithId;
		}
		let parent = itemPath.length ? itemPath.join(' > ') : '#';

		let icon = require('./html.png');

		this.idToElementMap.set(id, item);

		return {
			id, parent, text, icon
		};
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
				}
			}
		});
		this.documentEditor.onElementSelected( ({element}) => {
			let id = _this.getDomPath(element).join(' > ');
			let treeInstance = _this.$container.jstree(true);
			treeInstance.deselect_all();
			treeInstance.select_node(id);
		});
		this.documentEditor.onAppendElement( ({child}) => {
			_this.addElement(child);
		});
		this.documentEditor.onRemoveElement( ({child}) => {
			_this.removeElement({
				element: child
			});
		});
		this.documentEditor.onElementDeselected( () => {
			let treeInstance = _this.$container.jstree(true);
			treeInstance.deselect_all();
		})

	}
	syncWihUserInterface() {
		let _this = this;
		this.$container.bind("hover_node.jstree", (e, data) => {
			let element = _this.idToElementMap.get(data.node.id);
			IDE.GUID.userInterface.highLightElement(element);
		});
		this.$container.bind("dehover_node.jstree", (e, data) => {
			IDE.GUID.userInterface.clearHighLighting();
		});
		this.userInterface.onElementHighLight( ({element}) => {
			let treeInstance = _this.$container.jstree(true);
			if (element.tagName.toLowerCase() === 'html') {
				treeInstance.dehover_node('body');
			} else {
				let id = _this.getDomPath(element).join(' > ');
				// treeInstance.deselect_all();
				treeInstance.hover_node(id);
			}
		});
		this.userInterface.onClearHighLighting( ({element}) => {
			let treeInstance = _this.$container.jstree(true);
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

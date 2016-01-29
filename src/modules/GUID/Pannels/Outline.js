class Outline {
  constructor({containerId, documentEditor, userInterface}) {
    this.documentEditor = documentEditor;
    this.userInterface = userInterface;
    this.container = document.getElementById(containerId);

    this.jstreeData = [];
    this.idToElementMap = new Map();
    this.elementToIdMap = new Map();
    this._initJstree();

    this._syncWithDocumentEditor();
    this._syncWithUserInterface();
  }

  _initJstree() {
    var jstree = require("../../../../lib/jstree/jstree.js");
		var $ = require("../../../../lib/jquery-2.1.3.min.js");

    this.$container = $(this.container);
    this.$container.jstree({
      plugins: ["contextmenu"],
      contextmenu: {
        items: ($node) => {
          return {
            Delete: {
              label: "Remove",
              action: (obj) => {
                let {id} = $node;
                let element = this._getElementFromId(id);
                this.documentEditor.removeElement({
                  element
                });
              }
            }
          };
        }
      },
      core: {
        data: (_, callback) => {
          callback(this.jstreeData);
        }
      }
    });

    this.documentEditor.documentPromise.then((iframeDoc) => {
      this._refreshAll();
    });
  }

  _refreshAll() {
    this._processBodyToTree({
      bodyElement: this.documentEditor.document.body
    });
  }

  _processBodyToTree({bodyElement}) {
    var data = [];
    this.idToElementMap.clear();
    this.elementToIdMap.clear();

    this._processElement({
      element: bodyElement,
      data
    });

    this.jstreeData = data;
    this.$container.jstree().refresh();
  }

  //Recursive call, stop when element is null, data is filled by every call
  _processElement({element, data}) {
    if (element && element.tagName.toLowerCase() !== 'script') {
      let jstreeNode = this._jstreeNodeFromElement({element});
      data.push(jstreeNode);
      this.idToElementMap.set(jstreeNode.id, element);
      this.elementToIdMap.set(element, jstreeNode.id);

      for (var i = 0; i < element.childElementCount; i++) {
        this._processElement({
          element: element.children[i],
          data
        });
      }
    }
  }

  _jstreeNodeFromElement({element}) {

    let domPath = this._getDomPath(element);
    let id = domPath.join(' > ');

    //Remove last element to have parent string
    domPath.splice(-1, 1);
    let parent = domPath.length ? domPath.join(' > ') : '#';

    let icon = require('./html.png');
    let name = element.tagName.toLowerCase();
    if (element.id.length > 0) {
      name += '#' + element.id;
    }

    return {id, parent, text: name, icon};
  }

  _getDomPath(el) {

		var stack = [];
		while (el.parentNode !== null) {
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

    //Return ommiting the first element, which is HTML tag
		return stack.slice(1);
	}

  _getElementFromId(id) {
    if (this.idToElementMap.has(id)) {
      return this.idToElementMap.get(id);
    }
    else {
      return null;
    }
  }

  _getIdFromElement(element) {
    if (this.elementToIdMap.has(element)) {
      return this.elementToIdMap.get(element);
    }
    else {
      return null;
    }
  }

  _syncWithDocumentEditor() {
    this.$container.on('changed.jstree', (_, data) => {
      if (data.action === 'select_node') {
        let element = this._getElementFromId(data.node.id);
        if (this.documentEditor.selectedElement !== element) {
          this.documentEditor.selectElement({element});
        }
      }
    });

    this.documentEditor.onElementSelected( ({element}) => {
      let id = this._getIdFromElement(element);
      if (id) {
        let jstree = this.$container.jstree();
        jstree.deselect_all();
        jstree.select_node(id);
      }
    });

    this.documentEditor.onAppendElement(({child}) => {
      this._refreshAll();
    });

    this.documentEditor.onRemoveElement(({child}) => {
      this._refreshAll();
    });

    this.documentEditor.onElementDeselected(() => {
      this.$container.jstree().deselect_all();
    });
  }

  _syncWithUserInterface() {
    this.$container.bind('hover_node.jstree', (_, data) => {
      let element = this._getElementFromId(data.node.id);
      this.userInterface.highLightElement(element);
    });

    this.$container.bind('dehover_node.jstree', (_, data) => {
      this.userInterface.clearHighLighting();
    });

    this.userInterface.onElementHighLight(({element}) => {
      let jstree = this.$container.jstree();
      if (element.tagName.toLowerCase() === 'html') {
        jstree.dehover_node('body');
      }
      else {
        let id = this._getIdFromElement(element);
        jstree.hover_node(id);
      }
    });

    this.userInterface.onClearHighLighting(({element}) => {
      let jstree = this.$container.jstree();
      if (element.tagName.toLowerCase() === 'html') {
        jstree.dehover_node('body');
      }
      else {
        let id = this._getIdFromElement(element);
        jstree.dehover_node(id);
      }
    });
  }
}

export default Outline;

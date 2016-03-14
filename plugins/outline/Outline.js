class Outline {
  constructor({panelContainer, containerId, documentEditor, userInterface}) {
    this.documentEditor = documentEditor;
    this.userInterface = userInterface;
    this.container = panelContainer || document.getElementById(containerId);

    this.jstreeData = [];
    this.idToElementMap = new Map();
    this.elementToIdMap = new Map();
    this._initJstree();

    this._syncWithDocumentEditor();
    this._syncWithUserInterface();
  }

  _initJstree() {
    // TODO: use dependencies injection
    var jstree = require("../../lib/jstree/jstree.js");
		var $ = require("../../lib/jquery-2.1.3.min.js");

    this.$container = $(this.container);
    this.$container.jstree({
      plugins: ["contextmenu", "dnd"],
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
      dnd : {
        "is_draggable" : (data) => {
          let node = data[0];
          return node.id.toLowerCase() !== 'body';
        },
        "check_while_dragging": true
      },
      core: {
        data: (_, callback) => {
          callback(this.jstreeData);
        },
        check_callback: function (operation, node, node_parent, node_position, more) {
          if(node_parent.id === '#'){
            return false;
          }
        }
      }
    }).bind("move_node.jstree", (e, data) => {
      let nodeId = data.node.id;
      let newParent = data.parent;
      let newPosition = data.position;

      let parentNode = this.$container.jstree(true).get_node(newParent);
      let brothers = parentNode.children;


      let theNodeAfterId = brothers[newPosition + 1];

      let element = this._getElementFromId(nodeId);

      if(theNodeAfterId){
        let theElementAfter = this._getElementFromId(theNodeAfterId);
        this.documentEditor.moveBeforeElement({
          element,
          elementRef: theElementAfter
        });
      }else{
        let parentElement = this._getElementFromId(newParent);
        this.documentEditor.moveInsideElement({
          element,
          elementRef: parentElement
        });
      }
    }).bind('refresh.jstree', ()=>{
      this._updateSelectedElement();
      this.$container.jstree('open_all');
    });

    this._refreshAll();
  }

  _refreshAll() {
    this._processBodyToTree({
      bodyElement: this.documentEditor.sourceDocument.body
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

    let icon = require('./images/html.png');
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

  _updateSelectedElement(){
    let element = this.documentEditor.selectedElement;
    if(element){
      let id = this._getIdFromElement(element);
      if (id) {
        let jstree = this.$container.jstree();
        jstree.deselect_all();
        jstree.select_node(id);
      }
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
      this._updateSelectedElement();
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
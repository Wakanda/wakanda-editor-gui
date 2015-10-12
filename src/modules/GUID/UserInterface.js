import MultiEvent from '../../../lib/multi-event-master/src/multi-event-es6.js';

class UserInterface {
	constructor({documentEditor}) {
		// let _EventEmitter = require('../../../lib/micro-events.js');
		// this.events = new _EventEmitter();
		this.events = new MultiEvent();

		this.documentEditor = documentEditor;
		this.canvas = document.createElement('canvas');
		this.HIGHLIGHT = null;
		this._highLightedElement = null;

		this.canvas.classList.add('user-interface-canvas');
		this.cloudEditorIDE = documentEditor.cloudEditorIDE;
		this.cloudEditorIDE.appendChild(this.canvas);

		let fabric = require('../../../lib/fabric.js');

		this.fabric_canvas = new fabric.Canvas(this.canvas);

		this.resetCanvasDimentions();

		this.initHighLighting();
		this.initElementSelection();
		this.subscribeToDocumentEditorEvents();

		let keyboardJS = require('../../../lib/keyboardjs');
		this.initKeyboardWatchers(keyboardJS);
	}

	initKeyboardWatchers(keyboardJS) {

		var _this = this;

		//Deselect the selected element if any
		keyboardJS.bind('esc', () => {
			_this.documentEditor.deselectElement();
		});

		//Remove the selected element if any
		keyboardJS.bind('del', () => {

			let element = _this._highLightedElement;

			if (element.tagName != 'BODY') {
				_this.documentEditor.removeElement({element});
			}
		});
	}

	resetCanvasDimentions() {
		let {
			width, height
		} = this.documentEditor.dimensions;
		this.fabric_canvas.setDimensions({
			width, height
		});
	}

	clearHighLighting() {
		let a = this.HIGHLIGHT == null;
		let b = this._highLightedElement == null;
		if (a != b) {
			console.log(this);
		}
		if (this.HIGHLIGHT) {
			let element = this._highLightedElement;
			this.fabric_canvas.remove(this.HIGHLIGHT);
			this.HIGHLIGHT = null;
			this._highLightedElement = null;
			this.events.emit('GUID.UI.clearHighLighting', {
				element
			});
		}
	}

	onClearHighLighting(callBack) {
		this.events.on('GUID.UI.clearHighLighting', callBack);
	}

	initHighLighting() {
		this.cloudEditorIDE.addEventListener('mouseleave', () => {
			this.clearHighLighting();
		});

		this.fabric_canvas.on('mouse:move', (options) => {
			// TODO : DEFER (?)
			let [x, y] = [options.e.offsetX, options.e.offsetY];

			if (x >= 0 && y > 0) {
				let elementsAtLocation = this.documentEditor.getElementFromPoint({
					x: options.e.offsetX,
					y: options.e.offsetY
				});
				this.highLightElement(elementsAtLocation);
			}
		});

	}

	highLightElement(element) {
		if (this._highLightedElement !== element) {

			if (!element) {
				// console.log(options.e.offsetX, options.e.offsetY);
				return this.clearHighLighting();
			}

			let boundingRect = element.getBoundingClientRect();
			let coords = {};

			this.highLightArea(boundingRect);
			this._highLightedElement = element;

			this.events.emit('GUID.UI.element.highlight', {
				element
			});
		}
	}

	onElementHighLight(callBack) {
		this.events.on('GUID.UI.element.highlight', callBack);
	}

	updateSelectedElementBorder() {
		this.removeSelectedElementBorder();

		if(this.documentEditor.selectedElement){
			let style = this.documentEditor.getSelectedElementComputedStyle();

			let lineColor,
				selectable = true;
			switch (style.position) {
				case 'absolute':
					lineColor = 'green';
					break;
				case 'relative':
					lineColor = 'blue';
					break;
				case 'fixed':
					lineColor = 'orange';
					//selectable = false;
					break;
				case 'static':
					lineColor = 'brown';
					selectable = false;
					break;
				default:
					lineColor = 'yellow';
			}

			let boundingClientRect = this.documentEditor.getselectedElementBoundingClientRect(); // element.getBoundingClientRect();

			let {
				left, top, width, height
			} = boundingClientRect;

			this.rectSelected = new fabric.Rect({
				left: left,
				top: top,
				fill: '',
				stroke: lineColor,
				strokeWidth: 1,
				width: width,
				height: height,
				selectable: selectable
			});

			this.fabric_canvas.add(this.rectSelected);
			this.fabric_canvas.moveTo(this.rectSelected, 0);
		}
	}

	removeSelectedElementBorder() {
		if (this.rectSelected) {
			this.fabric_canvas.remove(this.rectSelected);
		}
	}

	initElementSelection() {
		this.fabric_canvas.on('mouse:up', (options) => {
			this.documentEditor.selectElementByPoint({
				x: options.e.offsetX,
				y: options.e.offsetY
			});
		});

		this.documentEditor.onElementSelected(() => {
			this.updateSelectedElementBorder();
		});

		this.documentEditor.onDocumentScroll(()=>{
			this.updateSelectedElementBorder();
		});

		this.documentEditor.onElementDeselected(() => {
			this.removeSelectedElementBorder();
		});

		this.documentEditor.onDocumentSizeChange(() => {
			this.updateSelectedElementBorder();
		});
		this.documentEditor.onElementTextChange(()=> {
			this.updateSelectedElementBorder();
		});
	}

	highLightArea(coords) {
		let {
			left, top, width, height
		} = coords;

		this.clearHighLighting();

		this.HIGHLIGHT = new fabric.Rect({
			type: 'highlight',
			left: left,
			top: top,
			fill: 'blue',
			opacity: 0.1,
			strokeWidth: 2,
			width: width,
			height: height,
			selectable: false
		});

		this.fabric_canvas.add(this.HIGHLIGHT);
		//TODO sendToBack ?
		this.fabric_canvas.sendToBack(this.HIGHLIGHT);
	}

	subscribeToDocumentEditorEvents() {
		this.documentEditor.onDocumentSizeChange(() => {
			this.resetCanvasDimentions();
		});
		this.documentEditor.onAppendElement(() => {
			this.updateSelectedElementBorder();
		});
		this.documentEditor.onRemoveElement(() => {
			this.updateSelectedElementBorder();
		});
		this.documentEditor.onElementStyleAttributeChange(() => {
			this.updateSelectedElementBorder();
		});
	}
}

export default UserInterface;

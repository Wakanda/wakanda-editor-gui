import MultiEvent from '../../../lib/multi-event-master/src/multi-event-es6.js';

class UserInterface {
	constructor({documentEditor, cloudEditorContainer = document.querySelector('.cloud-ide-editor')}) {
		// let _EventEmitter = require('../../../lib/micro-events.js');
		// this.events = new _EventEmitter();
		this.events = new MultiEvent();

		this.documentEditor = documentEditor;
		this.canvas = document.createElement('canvas');
		this.HIGHLIGHT = null;
		this._highLightedElement = null;

		this.canvas.setAttribute('id', 'user-interface-canvas');
		this.cloudEditorIDE = cloudEditorContainer;
		this.cloudEditorIDE.appendChild(this.canvas);

		let fabric = require('../../../lib/fabric.js');

		this.fabric_canvas = new fabric.Canvas(this.canvas);

		this.resetCanvasDimentions();

		this.initHighLighting();
		this.initElementSelection();
		this.subscribeToDocumentEditorEvents();
	}

	resetCanvasDimentions() {
		let {
			width, height
		} = this.cloudEditorIDE.getBoundingClientRect();
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
		let _this = this;

		this.cloudEditorIDE.addEventListener('mouseleave', function() {
			_this.clearHighLighting();
		});

		this.fabric_canvas.on('mouse:move', function(options) {
			// TODO : DEFER (?)
			let [x, y] = [options.e.offsetX, options.e.offsetY];

			if (x >= 0 && y > 0) {
				let elementsAtLocation = _this.documentEditor.getElementFromPoint({
					x: options.e.offsetX,
					y: options.e.offsetY
				});
				_this.highLightElement(elementsAtLocation);
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

		if (this.rectSelected) {
			this.fabric_canvas.remove(this.rectSelected);
		}

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

	initElementSelection() {
		let _this = this;

		this.fabric_canvas.on('mouse:up', function(options) {
			_this.documentEditor.selectElementByPoint({
				x: options.e.offsetX,
				y: options.e.offsetY
			});
		});

		this.documentEditor.onElementSelected(function() {
			_this.updateSelectedElementBorder();
		});

		this.documentEditor.onDocumentSizeChange(function() {
			_this.updateSelectedElementBorder();
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
		let _this = this;
		this.documentEditor.onDocumentSizeChange(function() {
			_this.resetCanvasDimentions();
		});
		this.documentEditor.onAppendElement(function() {
			_this.updateSelectedElementBorder();
		});
		this.documentEditor.onRemoveElement(function() {
			_this.updateSelectedElementBorder();
		});
	}


}

export default UserInterface;

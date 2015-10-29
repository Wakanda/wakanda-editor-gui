import MultiEvent from '../../../../lib/multi-event-master/src/multi-event-es6.js';
import HighlightManager from './HighlightManager';

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

		let fabric = require('../../../../lib/fabric.js');

		this.fabric_canvas = new fabric.Canvas(this.canvas);
		this.highlightManager = new HighlightManager({
			fabricCanvas: this.fabric_canvas,
			events: this.events
		});

		this.resetCanvasDimentions();

		this.initHighLighting();
		this.initElementSelection();
		this.subscribeToDocumentEditorEvents();

		let keyboardJS = require('../../../../lib/keyboardjs');
		this.initKeyboardWatchers(keyboardJS);
		this.lastPosition = null;
		this.mouseOverCanvas = false;
		this._subscribeToDragulaEvent();
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
		this.highlightManager.clearHighLighting();
	}

	onClearHighLighting(callBack) {
		this.events.on('GUID.UI.clearHighLighting', callBack);
	}

	_elementAtPosition({x, y}) {
		if (x >= 0 && y > 0) {
			return this.documentEditor.getElementFromPoint({
				x,
				y
			});
		}
		else {
			return null;
		}
	}

	_subscribeToDragulaEvent() {
		let dragulaManager = this.documentEditor.dragulaManager;
		this.isDraggingElement = false;

		dragulaManager.onCloned((clone, original) => {
			clone.renderComponent = original.renderComponent;

			//FIXME
      clone.style.border = '1px solid red';
		});

		dragulaManager.onDragStart(() => {
			this.isDraggingElement = true;
		})

		dragulaManager.onDragEnd(() => {
			this.isDraggingElement = false;
		});

		dragulaManager.onDrop((element, target) => {
			if (this.mouseOverCanvas) {
				console.log('position over canvas', this.lastPosition);
				let availableElement = this._elementAtPosition(this.lastPosition);
				if (availableElement) {

					if (availableElement.tagName.toLowerCase() === 'html') {
						availableElement = this.documentEditor.document.body;
					}

					switch (this.dropPosition) {
						case 'inside':
							this.documentEditor.appendElement({
								element: element.renderComponent(),
								parent: availableElement
							});
							break;
						case 'top':
							this.documentEditor.prependElement({
								element: element.renderComponent(),
								elementRef: availableElement
							});
							break;
						case 'bottom':
							this.documentEditor.appendAfterElement({
								element: element.renderComponent(),
								elementRef: availableElement
							});
							break;
						default:
							console.error('Invalid drop position');
					}
				}
			}
		});
	}

	initHighLighting() {
		this.cloudEditorIDE.addEventListener('mouseleave', () => {
			this.clearHighLighting();
			this.mouseOverCanvas = false;
		});

		this.fabric_canvas.on('mouse:move', (options) => {
			this.mouseOverCanvas = true;

			if (this.dragMark) {
				this.fabric_canvas.remove(this.dragMark);
				this.dragMark = null;
			}
			this.dropPosition = 'inside';

			// TODO : DEFER (?)
			let [x, y] = [options.e.offsetX, options.e.offsetY];
			this.lastPosition = {x, y};

			let element = this._elementAtPosition({x, y});
			if (element) {
				this.highLightElement(element);
			}

			let tagName = element ? element.tagName.toLowerCase() : null;
			if(this.isDraggingElement && element && tagName != 'body' && tagName != 'html') {
				let elRect = element.getBoundingClientRect();
				let coef = 0.2;

				if (y >= Math.floor(elRect.top) && y <= Math.ceil(elRect.top + coef * elRect.height)) {
					this.addDragMark({
						position: 'top',
						elementRect: elRect
					});
					this.dropPosition = 'top';
				}
				else if (y <= Math.floor(elRect.bottom) && y >= Math.ceil(elRect.bottom - coef * elRect.height)) {
					this.addDragMark({
						position: 'bottom',
						elementRect: elRect
					});
					this.dropPosition = 'bottom';
				}
				else {
					this.dropPosition = 'inside';
				}
			}
		});
	}

	addDragMark({position, elementRect}) {
		let coords = {x: null, y: null, width: null, height: null};

		switch (position) {
			case 'left':

				break;
			case 'rigth':

				break;
			case 'top':
				coords = {
					x: elementRect.left,
					y: elementRect.top - 1,
					width: elementRect.width,
					height: 1
				};
				break;
			case 'bottom':
				coords = {
					x: elementRect.left,
					y: elementRect.bottom + 1,
					width: elementRect.width,
					height: 1
				};
				break;
			default:
				console.error('addDragMark, position not valid');
		}

		this.dragMark = new fabric.Rect({
			left: coords.x,
			top: coords.y,
			fill: 'blue',
			opacity: 1,
			width: coords.width,
			height: coords.height,
			selectable: false
		});
		this.fabric_canvas.add(this.dragMark);
	}

	highLightElement(element) {
		this.highlightManager.highLightElement({element});
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

	subscribeToDocumentEditorEvents() {
		this.documentEditor.onDocumentSizeChange(() => {
			this.resetCanvasDimentions();
		});
		this.documentEditor.onAppendElement(() => {
			this.resetCanvasDimentions();
			this.updateSelectedElementBorder();
		});
		this.documentEditor.onRemoveElement(() => {
			this.resetCanvasDimentions();
			this.updateSelectedElementBorder();
		});
		this.documentEditor.onElementStyleAttributeChange(() => {
			this.resetCanvasDimentions();
			this.updateSelectedElementBorder();
		});
		this.documentEditor.onElementClassChange(({element, className}) => {
			this.resetCanvasDimentions();
			this.updateSelectedElementBorder();
		});
	}
}

export default UserInterface;

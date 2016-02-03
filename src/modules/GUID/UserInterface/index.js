import MultiEvent from '../../../../lib/multi-event-master/src/multi-event-es6.js';
import HighlightManager from './HighlightManager';

class UserInterface {
	constructor({documentEditor}) {
		// let _EventEmitter = require('../../../lib/micro-events.js');
		// this.events = new _EventEmitter();
		this.events = new MultiEvent();

		this.documentEditor = documentEditor;
		this.canvas = document.createElement('canvas');
		this._highLightedElement = null;

		this.canvas.classList.add('user-interface-canvas');
		this.cloudEditorIDE = document.querySelector('#cloud-ide-editor');;
		this.cloudEditorIDE.appendChild(this.canvas);

		let fabric = require('../../../../lib/fabric.js');

		this.fabric_canvas = new fabric.Canvas(this.canvas);
		this.highlightManager = new HighlightManager({
			fabricCanvas: this.fabric_canvas,
			events: this.events,
			documentEditor: this.documentEditor
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

		//Deselect the selected element if any
		keyboardJS.bind('esc', () => {
			this.documentEditor.deselectElement();
		});

		//Remove the selected element if any
		keyboardJS.bind('del', () => {

			let element = this.documentEditor.selectedElement;
			if (element) {
				let tagName = element.tagName.toLowerCase();
				if (tagName !== 'body' && tagName !== 'html') {
					this.documentEditor.removeElement({element});
				}
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

				if (this.dragMark) {
					this.fabric_canvas.remove(this.dragMark);
					this.dragMark = null;
				}
			}
		});
	}

	initHighLighting() {
		this.cloudEditorIDE.addEventListener('mouseleave', () => {
			this.clearHighLighting();
			this.mouseOverCanvas = false;
		});

		this.fabric_canvas.on('mouse:down', (options) => {
			let element = this._elementAtPosition(this.lastPosition);
			let tagName = element ? element.tagName.toLowerCase() : null;
			this.mouseDownPosition = {x: options.e.offsetX, y: options.e.offsetY};

			if (element && tagName !== 'html' && tagName !== 'body') {
				console.log('fabric:mouse:down on element', element);

				let floatingElement = document.createElement('div');
				floatingElement.innerHTML = element.tagName.toLowerCase();
				floatingElement.style.border = '1px solid red';
				floatingElement.style['z-index'] = '10000';
				floatingElement.style.position = 'absolute';
				floatingElement.style.left = '-1000px';
				floatingElement.style.top = '-1000px';

				document.body.appendChild(floatingElement);

				this.mouseListener = (e) => {
					floatingElement.style.left = (e.clientX + 15) + 'px';
					floatingElement.style.top = (e.clientY + 15) + 'px';
				};

				window.addEventListener('mousemove', this.mouseListener);

				this.isDraggingElement = true;
				this.isDraggingExistingElement = true;
				this.existingElementDragged = element;
				this.movingElementMark = floatingElement;
			}
		});

		this.fabric_canvas.on('mouse:up', (options) => {

			if (this.dragMark) {
				this.fabric_canvas.remove(this.dragMark);
				this.dragMark = null;
			}

			if (this.isDraggingExistingElement) {
				this.isDraggingElement = false;
				this.isDraggingExistingElement = false;

				let availableElement = this._elementAtPosition(this.lastPosition);
				if (availableElement && availableElement !== this.existingElementDragged) {

					if (availableElement.tagName.toLowerCase() === 'html') {
						availableElement = this.documentEditor.document.body;
					}

					switch (this.dropPosition) {
						case 'inside':
							if (!this.existingElementDragged.contains(availableElement)) {
								this.documentEditor.moveInsideElement({
									element: this.existingElementDragged,
									elementRef: availableElement
								});
							}
							break;
						case 'top':
							if (!this.existingElementDragged.contains(availableElement)) {
								this.documentEditor.moveBeforeElement({
									element: this.existingElementDragged,
									elementRef: availableElement
								});
							}
							break;
						case 'bottom':
							if (!this.existingElementDragged.contains(availableElement)) {
								this.documentEditor.moveAfterElement({
									element: this.existingElementDragged,
									elementRef: availableElement
								});
							}
							break;
						default:
							console.error('Invalid drop position');
					}
				}

				document.body.removeChild(this.movingElementMark);
				this.movingElementMark = null;
				window.removeEventListener('mousemove', this.mouseListener);
				this.existingElementDragged = null;
			}

			let mouseUpPosition = {x: options.e.offsetX, y: options.e.offsetY};
			if (mouseUpPosition.x === this.mouseDownPosition.x &&
					mouseUpPosition.y === this.mouseDownPosition.y) {
				this.documentEditor.selectElementByPoint({
					x: options.e.offsetX,
					y: options.e.offsetY
				});
			}
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
		}
	}

	removeSelectedElementBorder() {
		if (this.rectSelected) {
			this.fabric_canvas.remove(this.rectSelected);
		}
	}

	initElementSelection() {

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
			this.clearHighLighting();
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

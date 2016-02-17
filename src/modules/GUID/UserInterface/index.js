import MultiEvent from '../../../../lib/multi-event-master/src/multi-event-es6.js';
import HighlightManager from './HighlightManager';
import DragulaManager from './DragulaManager';

class UserInterface {
	constructor({documentEditor, dndContainerId}) {

		this._events = new MultiEvent();

		this._documentEditor = documentEditor;
		this._highLightedElement = null;

		let canvas = document.createElement('canvas');
		canvas.classList.add('user-interface-canvas');
		this.cloudEditorIDE = document.querySelector('#cloud-ide-editor');
		this.cloudEditorIDE.appendChild(canvas);

		let fabric = require('../../../../lib/fabric.js');

		this._fabric_canvas = new fabric.Canvas(canvas);

		this._highlightManager = new HighlightManager({
			fabricCanvas: this._fabric_canvas,
			events: this._events,
			documentEditor: this._documentEditor
		});

		this._dragulaManager = new DragulaManager({
			documentEditor,
			sourceContainerId: dndContainerId
		});

		this._resetCanvasDimentions();

		this._initHighLighting();
		this._initElementSelection();
		this._subscribeToDocumentEditorEvents();

		let keyboardJS = require('../../../../lib/keyboardjs');
		this._initKeyboardWatchers(keyboardJS);
		this.lastPosition = null;
		this.mouseOverCanvas = false;
		this._subscribeToDragulaEvent();
	}

	clearHighLighting() {
		this._highlightManager.clearHighLighting();
	}

	// TODO: with outline
	highLightElement(element) {
		if(!this._documentEditor.rendering){
			this._highlightManager.highLightElement({element});
		}
	}

	onClearHighLighting(callBack) {
		this._events.on('GUID.UI.clearHighLighting', callBack);
	}

	onElementHighLight(callBack) {
		this._events.on('GUID.UI.element.highlight', callBack);
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
		this._fabric_canvas.add(this.dragMark);
	}

	updateSelectedElementBorder() {
		this.removeSelectedElementBorder();

		if(this._documentEditor.selectedElement){
			let style = this._documentEditor.getSelectedElementComputedStyle();

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

			let boundingClientRect = this._documentEditor.getselectedElementBoundingClientRect(); // element.getBoundingClientRect();

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

			this._fabric_canvas.add(this.rectSelected);
		}
	}

	removeSelectedElementBorder() {
		if (this.rectSelected) {
			this._fabric_canvas.remove(this.rectSelected);
		}
	}

	_initElementSelection() {

		this._documentEditor.onElementSelected(() => {
			this.updateSelectedElementBorder();
		});

		this._documentEditor.onDocumentScroll(()=>{
			this.updateSelectedElementBorder();
		});

		this._documentEditor.onElementDeselected(() => {
			this.removeSelectedElementBorder();
		});

		this._documentEditor.onDocumentSizeChange(() => {
			this.updateSelectedElementBorder();
		});
		this._documentEditor.onElementTextChange(()=> {
			this.updateSelectedElementBorder();
		});
	}

	_subscribeToDocumentEditorEvents() {
		this._documentEditor.onDocumentSizeChange(() => {
			this._resetCanvasDimentions();
		});
		this._documentEditor.onAppendElement(() => {
			this._resetCanvasDimentions();
			// this.updateSelectedElementBorder();
			this.clearHighLighting();
		});
		this._documentEditor.onRemoveElement(() => {
			this._resetCanvasDimentions();
		});
		this._documentEditor.onElementStyleAttributeChange(() => {
			this._resetCanvasDimentions();
			this.updateSelectedElementBorder();
		});
		this._documentEditor.onElementClassChange(({element, className}) => {
			this._resetCanvasDimentions();
			this.updateSelectedElementBorder();
		});
	}

	_elementAtPosition({x, y}) {
		if (x >= 0 && y > 0) {
			return this._documentEditor.getElementFromPoint({ x,	y	});
		}
		else {
			return null;
		}
	}

	_subscribeToDragulaEvent() {
		this.isDraggingElement = false;

		this._dragulaManager.onCloned((clone, original) => {
    console.log('Dragula event : onCloned', clone, original);
			clone.renderComponent = original.renderComponent;

			//FIXME
      clone.style.border = '1px solid red';
		});

		this._dragulaManager.onDragStart(() => {
    console.log('this.isDraggingElement set to true');
			this.isDraggingElement = true;
		})

		this._dragulaManager.onDragEnd(() => {
    console.log('this.isDraggingElement set to false');
			this.isDraggingElement = false;
		});

		this._dragulaManager.onDrop((element, target) => {
    console.log('Dragula event : onDrop');
			if (this.mouseOverCanvas) {
				// console.log('position over canvas', this.lastPosition);
				let availableElement = this._elementAtPosition(this.lastPosition);
				if (availableElement) {

					if (availableElement.tagName.toLowerCase() === 'html') {
						availableElement = this._documentEditor.document.body;
					}

					switch (this.dropPosition) {
						case 'inside':
							this._documentEditor.appendElement({
								element: element.renderComponent(),
								parent: availableElement
							});
							break;
						case 'top':
							this._documentEditor.prependElement({
								element: element.renderComponent(),
								elementRef: availableElement
							});
							break;
						case 'bottom':
							this._documentEditor.appendAfterElement({
								element: element.renderComponent(),
								elementRef: availableElement
							});
							break;
						default:
							console.error('Invalid drop position');
					}
				}

				if (this.dragMark) {
					this._fabric_canvas.remove(this.dragMark);
					this.dragMark = null;
				}
			}
		});
	}

	_initHighLighting() {
		this.cloudEditorIDE.addEventListener('mouseleave', () => {
			this.clearHighLighting();
			this.mouseOverCanvas = false;
		});

		this._fabric_canvas.on('mouse:down', (options) => {
			let element = this._elementAtPosition(this.lastPosition);
			let tagName = element ? element.tagName.toLowerCase() : null;
			this.mouseDownPosition = {x: options.e.offsetX, y: options.e.offsetY};

			if (element && tagName !== 'html' && tagName !== 'body') {
				// console.log('fabric:mouse:down on element', element);

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

		this._fabric_canvas.on('mouse:up', (options) => {

			if (this.dragMark) {
				this._fabric_canvas.remove(this.dragMark);
				this.dragMark = null;
			}

			if (this.isDraggingExistingElement) {
				this.isDraggingElement = false;
				this.isDraggingExistingElement = false;

				let availableElement = this._elementAtPosition(this.lastPosition);
				if (availableElement && availableElement !== this.existingElementDragged) {

					if (availableElement.tagName.toLowerCase() === 'html') {
						availableElement = this._documentEditor.document.body;
					}

					switch (this.dropPosition) {
						case 'inside':
							if (!this.existingElementDragged.contains(availableElement)) {
								this._documentEditor.moveInsideElement({
									element: this.existingElementDragged,
									elementRef: availableElement
								});
							}
							break;
						case 'top':
							if (!this.existingElementDragged.contains(availableElement)) {
								this._documentEditor.moveBeforeElement({
									element: this.existingElementDragged,
									elementRef: availableElement
								});
							}
							break;
						case 'bottom':
							if (!this.existingElementDragged.contains(availableElement)) {
								this._documentEditor.moveAfterElement({
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
				this._documentEditor.selectElementByPoint({
					x: options.e.offsetX,
					y: options.e.offsetY
				});
			}
		});

		this._fabric_canvas.on('mouse:move', (options) => {
			this.mouseOverCanvas = true;

			if (this.dragMark) {
				this._fabric_canvas.remove(this.dragMark);
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

	_initKeyboardWatchers(keyboardJS) {

		//Deselect the selected element if any
		keyboardJS.bind('esc', () => {
			this._documentEditor.deselectElement();
		});

		//Remove the selected element if any
		keyboardJS.bind('del', () => {

			let element = this._documentEditor.selectedElement;
			if (element) {
				let tagName = element.tagName.toLowerCase();
				if (tagName !== 'body' && tagName !== 'html') {
					this._documentEditor.removeElement({element});
				}
			}
		});
	}

	_resetCanvasDimentions() {
		let {	width, height	} = this._documentEditor.dimensions;
		this._fabric_canvas.setDimensions({ width, height });
	}

}

export default UserInterface;

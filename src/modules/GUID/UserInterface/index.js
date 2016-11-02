import MultiEvent from '../../../../lib/multi-event-master/src/multi-event-es6.js';
import HighlightManager from './HighlightManager';
import SelectManager from './SelectManager';
require('./style.scss');

class UserInterface {
	constructor({documentEditor, dndContainerId}) {

		this._events = new MultiEvent();

		this._documentEditor = documentEditor;

		this._whiteBoard = document.createElement('div');
		this._whiteBoard.classList.add('whiteboard');
		this.cloudEditorIDE = document.querySelector('#cloud-ide-editor');
		this.cloudEditorIDE.appendChild(this._whiteBoard);

		this._highlightManager = new HighlightManager({container: this.cloudEditorIDE});
		this._currentHElement = null;
		// this._resetCanvasDimentions();

		this._selectManager = new SelectManager({container: this.cloudEditorIDE});

		this._initDnDEvents();
		this._initHighLighting();
		this._initElementSelection();
		this._subscribeToDocumentEditorEvents();

	}

	_initDnDEvents(){
		this._whiteBoard.addEventListener("dragover", (e)=>{
			// TODO: refactor
			let [x, y] = [e.offsetX, e.offsetY];
			let element = this._documentEditor.getElementFromPoint({x,y});
			this.highLightElement({element});

			// BUG: ??
			//console.log('data from event', e.dataTransfer.getData("infos"));
			e.preventDefault();
		});

		this._whiteBoard.addEventListener("drop", (e)=>{
			// TODO: informations about the component type
			let [x, y] = [e.offsetX, e.offsetY];
			let elementRef = this._documentEditor.getElementFromPoint({x,y});
			let infos = JSON.parse(e.dataTransfer.getData("infos"));
			let coords = infos.coords;

			let draggedFrom = infos.draggedFrom;
			console.log('dragged from', draggedFrom);

			console.log('data from event', e.dataTransfer.getData("infos"));

			coords.x -= this._whiteBoard.getBoundingClientRect().left;
			coords.y -= this._whiteBoard.getBoundingClientRect().top;

			let element = this._documentEditor.getElementFromPoint(coords);

			this._documentEditor.moveInsideElement({
				elementRef,
				element
			})
		});
	}

	clearHighLighting() {
		if(!this._currentHElement){
			return;
		}
		let el = this._currentHElement;
		this._highlightManager.hide();
		this._currentHElement = null;
		this._events.emit('GUID.UI.clearHighLighting', {element: el});
	}

	_getCoords({element}){
		let rawCoords = this._documentEditor.getBoundingClientRect({element});
		let coords = {
			x				: rawCoords.left,
			y				: rawCoords.top,
			width		: rawCoords.width,
			height	: rawCoords.height
		};
		return coords;
	}

	highLightElement({element}) {
		this._highlightManager.coords = this._getCoords({element});
		this._currentHElement = element;
		this._events.emit('GUID.UI.element.highlight', {element});
	}

	onClearHighLighting(callBack) {
		this._events.on('GUID.UI.clearHighLighting', callBack);
	}

	onElementHighLight(callBack) {
		this._events.on('GUID.UI.element.highlight', callBack);
	}
/**
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

		this._dragMark = new fabric.Rect({
			left: coords.x,
			top: coords.y,
			fill: 'blue',
			opacity: 1,
			width: coords.width,
			height: coords.height,
			selectable: false
		});
		this._fabric_canvas.add(this._dragMark);
	}
/**/

	_updateSelectedElementBorder({element = this._currentSElement}) {
		this._currentSElement = element;
		if(element){
			this._selectManager.coords = this._getCoords({element});
		}
		/**
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
		/**/
	}

	removeSelectedElementBorder() {
		if (this.rectSelected) {
			this._selectManager.hide();
			this._currentSElement = null;
		}
	}

	_initElementSelection() {

		this._whiteBoard.addEventListener("click", e => {
				let [x, y] = [e.offsetX, e.offsetY];
				this._documentEditor.selectElementByPoint({x, y});
		});

		this._documentEditor.onElementSelected(({element}) => {
			this._updateSelectedElementBorder({element});
		});

		this._documentEditor.onDocumentScroll(()=>{
			this.clearHighLighting();
			this._updateSelectedElementBorder();
		});

		this._documentEditor.onElementDeselected(() => {
			this.removeSelectedElementBorder();
		});

		this._documentEditor.onDocumentSizeChange(() => {
			this._updateSelectedElementBorder();
		});
		this._documentEditor.onElementTextChange(()=> {
			this._updateSelectedElementBorder();
		});
	}

	_subscribeToDocumentEditorEvents() {
		this._documentEditor.onDocumentSizeChange(() => {
			// this._resetCanvasDimentions();
		});
		this._documentEditor.onAppendElement(() => {
			// this._resetCanvasDimentions();
			// this._updateSelectedElementBorder();
			this.clearHighLighting();
		});
		this._documentEditor.onRemoveElement(() => {
			// this._resetCanvasDimentions();
		});
		this._documentEditor.onElementStyleAttributeChange(() => {
			// this._resetCanvasDimentions();
			this._updateSelectedElementBorder();
		});
		this._documentEditor.onElementClassChange(({element, className}) => {
			// this._resetCanvasDimentions();
			this._updateSelectedElementBorder();
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

	// _subscribeToDragulaEvent() {
	// 	this.isDraggingElement = false;
	//
	// 	this._dragulaManager.onCloned((clone, original) => {
  //   console.log('Dragula event : onCloned', clone, original);
	// 		clone.getComponent = original.getComponent;
	//
	// 		//FIXME
  //     clone.style.border = '1px solid red';
	// 	});
	//
	// 	this._dragulaManager.onDragStart(() => {
  //   console.log('this.isDraggingElement set to true');
	// 		this.isDraggingElement = true;
	// 	})
	//
	// 	this._dragulaManager.onDragEnd(() => {
  //   console.log('this.isDraggingElement set to false');
	// 		this.isDraggingElement = false;
	// 	});
	//
	// 	this._dragulaManager.onDrop((element, target) => {
  //   console.log('Dragula event : onDrop');
	// 		if (this._mouseOverCanvas) {
	// 			// console.log('position over canvas', this._lastPosition);
	// 			let availableElement = this._elementAtPosition(this._lastPosition);
	// 			if (availableElement) {
	//
	// 				if (availableElement.tagName.toLowerCase() === 'html') {
	// 					availableElement = this._documentEditor.document.body;
	// 				}
	//
	// 				let componentToInsert = element.getComponent();
	// 				let insertCommand = null;
	//
	// 				switch (this.dropPosition) {
	// 					case 'inside':
	// 						insertCommand = this._documentEditor.appendElement({
	// 							element: componentToInsert.createElement(),
	// 							parent: availableElement,
	// 							justReturnCommand : true
	// 						});
	// 						break;
	// 					case 'top':
	// 						insertCommand = this._documentEditor.prependElement({
	// 							element: componentToInsert.createElement(),
	// 							elementRef: availableElement,
	// 							justReturnCommand : true
	// 						});
	// 						break;
	// 					case 'bottom':
	// 						insertCommand = this._documentEditor.appendAfterElement({
	// 							element: componentToInsert.createElement(),
	// 							elementRef: availableElement,
	// 							justReturnCommand : true
	// 						});
	// 						break;
	// 					default:
	// 						console.error('Invalid drop position');
	// 				}
	//
	// 				if(insertCommand){
	// 					// TODO: temporary before adding script manager
	// 					componentToInsert.jsDependencies
	// 						.map((scriptUrl)=>{
	// 							return `<script src="${scriptUrl}"></script>`;
	// 						})
	// 						.forEach((scriptTag)=>{
	// 							// NOTE: tempo
	// 							if(this._documentEditor._scriptTags.indexOf(scriptTag) === -1){
	// 								this._documentEditor._scriptTags.push(scriptTag);
	// 							}
	// 						});
	//
	// 					if(componentToInsert._angularApplicationName || componentToInsert._directiveBody){
	// 						let appDependencies = '';
	// 						if(componentToInsert._angularApplicationName){
	// 							appDependencies = `'${componentToInsert._angularApplicationName}'`;
	// 						}
	// 						let angularAppDeclaration = `angular.module('app', [${appDependencies}]);`;
	// 						let angularApplicationScript = `<script type="text/javascript">${angularAppDeclaration}</script>`;
	//
	// 						// NOTE: tempo
	// 						if(this._documentEditor._scriptTags.indexOf(angularApplicationScript) === -1){
	// 							this._documentEditor._scriptTags.splice(2, 0, angularApplicationScript);
	// 						}
	//
	// 						if(componentToInsert._directiveBody){
	// 							let directiveScript = `angular.module('app')
	// 							.directive('${componentToInsert._directiveName}', ${componentToInsert._directiveBody});`;
	// 							let directiveScriptTag = `<script type="text/javascript">${directiveScript}</script>`;
	// 							// NOTE: tempo
	// 							if(this._documentEditor._scriptTags.indexOf(directiveScriptTag) === -1){
	// 								this._documentEditor._scriptTags.push(directiveScriptTag);
	// 							}
	// 						}
	// 					}
	//
	// 					insertCommand.exec();
	//
	// 				}
	// 			}
	//
	// 			if (this._dragMark) {
	// 				this._fabric_canvas.remove(this._dragMark);
	// 				this._dragMark = null;
	// 			}
	// 		}
	// 	});
	// }

	_initHighLighting() {
		this._whiteBoard.addEventListener("mousemove", e => {
				let [x, y] = [e.offsetX, e.offsetY];
				let element = this._documentEditor.getElementFromPoint({x,y});
				this.highLightElement({element});
		});

		this._whiteBoard.addEventListener('mouseleave', () => {
			this.clearHighLighting();
		});

		return;

		this._fabric_canvas.on('mouse:down', (options) => {
			let element = this._elementAtPosition(this._lastPosition);
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

			if (this._dragMark) {
				this._fabric_canvas.remove(this._dragMark);
				this._dragMark = null;
			}

			if (this.isDraggingExistingElement) {
				this.isDraggingElement = false;
				this.isDraggingExistingElement = false;

				let availableElement = this._elementAtPosition(this._lastPosition);
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
			this._mouseOverCanvas = true;

			if (this._dragMark) {
				this._fabric_canvas.remove(this._dragMark);
				this._dragMark = null;
			}
			this.dropPosition = 'inside';

			// TODO : DEFER (?)
			let [x, y] = [options.e.offsetX, options.e.offsetY];
			this._lastPosition = {x, y};

			let element = this._elementAtPosition({x, y});
			if (element) {
				this.highLightElement({element});
			}

			let tagName = element ? element.tagName.toLowerCase() : null;
			if(this.isDraggingElement && element && tagName != 'body' && tagName != 'html') {
				let elRect = this._documentEditor.getBoundingClientRect({element});
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


	// _resetCanvasDimentions() {
	// 	let {	width, height	} = this._documentEditor.dimensions;
	// 	this._fabric_canvas.setDimensions({ width, height });
	// }

}

export default UserInterface;

class DragulaManager {
  constructor({documentEditor, sourceContainerId}) {
    this.documentEditor = documentEditor;
    this.documentEditor.dragulaManager = this;
    this.drake = null;

    this._init({sourceContainerId});
  }

  _init({sourceContainerId}) {
    let dragula = require('dragula');

    let sourceContainer = document.getElementById(sourceContainerId);

		this.drake = dragula({
			containers: [sourceContainer],
      copy: (element, source) => {
        return source === sourceContainer;
      },
      accepts: (element, target) => {
        return target && target !== sourceContainer;
      }
		});

    // this.drake.on('drag', (element, source) => {
		// 	console.log('[dragula] starting to drag element', element);
		// });
    //
		// this.drake.on('dragend', (element) => {
		// 	console.log('[dragula] drag ended', element);
		// });

		this.drake.on('drop', (element, target, source, sibling) => {
			console.log('[dragula] drop element, target, sibling', element, target, sibling);
		});

		this.drake.on('cloned', (clone, original, type) => {
			console.log('[dragula] cloned element clone, original', clone, original);
      clone.style.border = '1px solid red';
		});
  }

  //element, source
  onDragStart(callback) {
    this.drake.on('drag', callback);
  }

  //element
  onDragEnd(callback) {
    this.drake.on('dragend');
  }

  //element, target, source, sibling
  onDrop(callback) {
    this.drake.on('drop', callback);
  }

  //clone, original, type
  onCloned(callback) {
    this.drake.on('cloned', callback);
  }

  addContainer({container}) {
    console.log('dragulaManager: adding container', container);
    this.drake.containers.push(container);
  }

  removeContainer({container}) {
    let index = this.drake.containers.indexOf(container);
    if (index > -1) {
      this.drake.containers.splice(index, 1);
    }
  }
}

export default DragulaManager;

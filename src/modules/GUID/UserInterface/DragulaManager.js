class DragulaManager {
  constructor({sourceContainerId}) {
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
  }

  //element, source
  onDragStart(callback) {
    this.drake.on('drag', callback);
  }

  //element
  onDragEnd(callback) {
    this.drake.on('dragend', callback);
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

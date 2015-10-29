class HighlightManager {
  constructor({fabricCanvas, events}) {
    this.fabricCanvas = fabricCanvas;
    this.events = events;

    this._highLightedElement = null;
    this.HIGHLIGHT = null;
  }

  highLightElement({element}) {
    if (this._highLightedElement !== element) {
      if (!element) {
        return this.clearHighLighting();
      }

      let boundingRect = element.getBoundingClientRect();

      this.highLightArea({
        coords: boundingRect
      });
      this._highLightedElement = element;

      this.events.emit('GUID.UI.element.highlight', {
        element
      });
    }
  }

  highLightArea({coords}) {
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

    this.fabricCanvas.add(this.HIGHLIGHT);
    //TODO sendToBack ?
    this.fabricCanvas.sendToBack(this.HIGHLIGHT);
  }

  clearHighLighting() {
    let a = this.HIGHLIGHT == null;
    let b = this._highLightedElement == null;
    if (a != b) {
      console.log(this);
    }
    if (this.HIGHLIGHT) {
      let element = this._highLightedElement;
      this.fabricCanvas.remove(this.HIGHLIGHT);
      this.HIGHLIGHT = null;
      this._highLightedElement = null;
      this.events.emit('GUID.UI.clearHighLighting', {
        element
      });
    }
  }
}

export default HighlightManager;

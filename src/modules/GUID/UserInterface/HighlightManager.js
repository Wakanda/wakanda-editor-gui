class HighlightManager {
  constructor({fabricCanvas, events, documentEditor}) {
    this.fabricCanvas = fabricCanvas;
    this.events = events;
    this.documentEditor = documentEditor;

    this.highlitedElement = null;
    this.HIGHLIGHT = null;

    //This object contains all highlight rects
    this.currentHighlights = {
      element: null,
      margin: {
        top: null,
        bottom: null,
        left: null,
        right: null
      }
    };
  }

  highLightElement({element}) {
    this.clearHighLighting();
    if (this.highlitedElement !== element) {
      if (!element) {
        return;
      }

      let boundingRect = element.getBoundingClientRect();

      let elementRect = this._highLightArea({
        coords: boundingRect,
        color: 'blue',
        opacity: 0.1
      });
      this.currentHighlights.element = elementRect;
      this.highlitedElement = element;

      //Margin rects
      let marginPositions = {};
      let getMarginValue = (position) => {
        if (!marginPositions[position]) {
          let value = this.documentEditor.getElementStyleAttribute({
            element,
            attribute: 'margin-' + position
          });
          marginPositions[position] = parseInt(value.replace('px', ''));
        }
        return marginPositions[position];
      };

      let positions = ['top', 'right', 'bottom', 'left']; //clock-wise. order MATTERS
      for (var i = 0; i < 4; i++) {
        let position = positions[i];
        let nextPosition = positions [(i + 1) % 4];
        let marginPosition = getMarginValue(position);
        let marginNextPosition = getMarginValue(nextPosition);

        let coords;
        if (position === 'top') {
          coords = {
            left: boundingRect.left,
            top: boundingRect.top - marginPosition,
            width: boundingRect.width + marginNextPosition,
            height: marginPosition
          };
        }
        else if (position === 'right') {
          coords = {
            left: boundingRect.left + boundingRect.width,
            top: boundingRect.top,
            width: marginPosition,
            height: boundingRect.height + marginNextPosition
          };
        }
        else if (position === 'bottom') {
          coords = {
            left: boundingRect.left - marginNextPosition,
            top: boundingRect.top + boundingRect.height,
            width: boundingRect.width + marginNextPosition,
            height: marginPosition
          };
        }
        else if (position === 'left') {
          coords = {
            left: boundingRect.left - marginPosition,
            top: boundingRect.top - marginNextPosition,
            width: marginPosition,
            height: boundingRect.height + marginPosition
          };
        }

        let rect = this._highLightArea({
          coords,
          color: 'green',
          opacity: 0.3
        });
        this.currentHighlights.margin[position] = rect;
      }

      // this.events.emit('GUID.UI.element.highlight', {
      //   element
      // });
    }
  }

  //Return the created rect
  _highLightArea({coords, color, opacity}) {
    let {
      left, top, width, height
    } = coords;

    // this.clearHighLighting();

    let rect = new fabric.Rect({
      type: 'highlight',
      left: left,
      top: top,
      fill: color,
      opacity: opacity,
      strokeWidth: 2,
      width: width,
      height: height,
      selectable: false
    });

    this.fabricCanvas.add(rect);
    //TODO sendToBack ?
    this.fabricCanvas.sendToBack(rect);
    return rect;
  }

  clearHighLighting() {

    if (this.highlitedElement) {
      let element = this.highlitedElement;

      let elRect = this.currentHighlights.element;
      let {top, bottom, left, right} = this.currentHighlights.margin;

      for (let rect of [elRect, top, bottom, left, right]) {
        if (rect) {
          this.fabricCanvas.remove(rect);
        }
      }

      this.highlitedElement = null;
      this.events.emit('GUID.UI.clearHighLighting', {
        element
      });
    }

    this.currentHighlights = {
      element: null,
      margin: {
        top: null,
        bottom: null,
        left: null,
        right: null
      }
    };
  }
}

export default HighlightManager;

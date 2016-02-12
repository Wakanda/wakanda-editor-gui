class HighlightManager {
  constructor({fabricCanvas, events, documentEditor}) {
    this._fabricCanvas = fabricCanvas;
    this._events = events;
    this._documentEditor = documentEditor;

    this._highlitedElement = null;
    this.HIGHLIGHT = null;

    //This object contains all highlight rects
    this.currentHighlights = {
      element: null,
      margin: {
        top: null,
        bottom: null,
        left: null,
        right: null
      },
      padding: {
        top: null,
        bottom: null,
        left: null,
        right: null
      }
    };
  }

  highLightElement({element}) {

    if (this._highlitedElement !== element) {
      if (!element) {
        return;
      }

      this.clearHighLighting();

      // let boundingRect = element.getBoundingClientRect();
      let boundingRect = this._documentEditor.getBoundingClientRect({element})
      this._highlitedElement = element;

      this._highlightMargins({element, boundingRect});
      let paddingPositions = this._highlightPaddings({element, boundingRect});
      this._highlightElement({element, boundingRect, paddingPositions});

      this._events.emit('GUID.UI.element.highlight', {
        element
      });
    }
  }

  _highlightElement({element, boundingRect, paddingPositions}) {
    let elementRect = this._highLightArea({
      coords: {
        left: boundingRect.left + paddingPositions.left,
        top: boundingRect.top + paddingPositions.top,
        width: boundingRect.width - paddingPositions.left - paddingPositions.right,
        height: boundingRect.height - paddingPositions.top - paddingPositions.bottom
      },
      color: 'blue',
      opacity: 0.15
    });
    this.currentHighlights.element = elementRect;
  }

  //Return padding positions object to process element rect later
  _highlightPaddings({element, boundingRect}) {
    let paddingPositions = {};
    let getPaddingValue = (position) => {
      if (!(typeof paddingPositions[position] === 'number')) {
        let value = this._documentEditor.getElementStyleAttribute({
          element,
          attribute: 'padding-' + position
        });

        paddingPositions[position] = value === '' ? 0 : parseInt(value.replace('px', ''));
      }
      return paddingPositions[position];
    }

    let positions = ['top', 'left', 'bottom', 'right']; //counter clock-wise. order *MATTERS*
    for (var i = 0; i < 4; i++) {
      let position = positions[i];
      let nextPosition = positions[(i + 1) % 4];
      let paddingPosition = getPaddingValue(position);
      let paddingNextPosition = getPaddingValue(nextPosition);

      let coords;
      if (position === 'top') {
        coords = {
          left: boundingRect.left + paddingNextPosition,
          top: boundingRect.top,
          width: boundingRect.width - paddingNextPosition,
          height: paddingPosition
        };
      }
      else if (position === 'left') {
        coords = {
          left: boundingRect.left,
          top: boundingRect.top,
          width: paddingPosition,
          height: boundingRect.height - paddingNextPosition
        };
      }
      else if (position === 'bottom') {
        coords = {
          left: boundingRect.left,
          top: boundingRect.top + boundingRect.height - paddingPosition,
          width: boundingRect.width - paddingNextPosition,
          height: paddingPosition
        };
      }
      else if (position === 'right') {
        coords = {
          left: boundingRect.left + boundingRect.width - paddingPosition,
          top: boundingRect.top + paddingNextPosition,
          width: paddingPosition,
          height: boundingRect.height - paddingNextPosition
        };
      }

      let rect = this._highLightArea({
        coords,
        color: 'green',
        opacity: 0.4
      });
      this.currentHighlights.padding[position] = rect;
    }

    return paddingPositions;
  }

  _highlightMargins({element, boundingRect}) {
    let marginPositions = {};
    let getMarginValue = (position) => {
      if (!(typeof marginPositions[position] === 'number')) {
        let value = this._documentEditor.getElementStyleAttribute({
          element,
          attribute: 'margin-' + position
        });

        marginPositions[position] = value === '' ? 0 : parseInt(value.replace('px', ''));
      }
      return marginPositions[position];
    };

    let positions = ['top', 'right', 'bottom', 'left']; //clock-wise. order *MATTERS*
    for (var i = 0; i < 4; i++) {
      let position = positions[i];
      let nextPosition = positions[(i + 1) % 4];
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
          height: boundingRect.height + marginNextPosition
        };
      }

      let rect = this._highLightArea({
        coords,
        color: 'orange',
        opacity: 0.4
      });
      this.currentHighlights.margin[position] = rect;
    }
  }

  //Return the created rect
  _highLightArea({coords, color, opacity}) {
    let {
      left, top, width, height
    } = coords;

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

    this._fabricCanvas.add(rect);
    this._fabricCanvas.sendToBack(rect);
    return rect;
  }

  clearHighLighting() {

    if (this._highlitedElement) {
      let element = this._highlitedElement;

      let elRect = this.currentHighlights.element;
      let {top: mtop, bottom: mbottom, left: mleft, right: mright} = this.currentHighlights.margin;
      let {top: rtop, bottom: rbottom, left: rleft, right: rright} = this.currentHighlights.padding;

      for (let rect of [elRect, mtop, mbottom, mleft, mright, rtop, rbottom, rleft, rright]) {
        if (rect) {
          this._fabricCanvas.remove(rect);
        }
      }

      this._highlitedElement = null;
      this._events.emit('GUID.UI.clearHighLighting', {
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
      },
      padding: {
        top: null,
        bottom: null,
        left: null,
        right: null
      }
    };
  }
}

export default HighlightManager;

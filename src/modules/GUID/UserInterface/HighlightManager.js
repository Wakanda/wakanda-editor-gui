import AreaManager from './AreaManager';

class HighlightManager extends AreaManager {
  constructor({container}) {
    super({container, className: 'highlight'});
  }

}

export default HighlightManager;

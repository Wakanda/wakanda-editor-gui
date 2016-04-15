
// TODO: add packages dependencies for each
import MultiEvent from '../../lib/multi-event-master/src/multi-event-es6.js';
import ResponsiveDevices from './ResponsiveSelector/ResponsiveDevices';
/**
/*  portViews
/*  portViewsNames
/*  setPortView
/*  mapDocumentSizeObservable
**/
class PortViewService {
  constructor({responsiveSelector}) {
    this._responsiveSelector = responsiveSelector;
    this._events = new MultiEvent();
    // NOTE: trying to use observables
    // let tmp = mapDocumentSizeObservable = (documentDimObservable) => {
    //   return documentDimObservable.map((dim)=>{
    //     // FIXME:
    //     let deviceName = 'sm'
    //     for(device of ResponsiveDevices){
    //       let wi = parseInt(device.minWidth || device.width);
    //       if(dim.width > wi){
    //         deviceName = device.name;
    //       }else{
    //         break;
    //       }
    //     }
    //
    //     return deviceName;
    //   }).distinctUntilChanged();
    // };

  }

  setPortView( { deviceName } ){
      let button = this._responsiveSelector._getButtonFromDevice({deviceName});
      let device = ResponsiveDevices.filter( device=> device.name == deviceName)[0];
      this._responsiveSelector._toggleButton({button});
      this._responsiveSelector._valueChange({
        width: device.width,
        minWidth: device.minWidth,
        deviceName: device.name
      });
      this._events.emit('change', {deviceName});
  }

  get portViews(){
    return ResponsiveDevices;
  }

  onPortViexChange(callBack){
    this._events.on('change', callBack);
  }

}

export default PortViewService;

'use strict'

import aliasExampleLogger from "alias-example-logger";
import universalLogger from "./logger/lib/console.js";
import geoLocalizator from "./geoloc/geoloc.js";

export default {
	logger: aliasExampleLogger,
	universalLogger: function(){
		universalLogger('whatever mode').call({},'Hello inception !'); 
	},
	geoloc: function(ip){
		geoLocalizator(ip).then(function(data){ console.log(data) }).catch(function(err){ console.error(err) });
	}
}
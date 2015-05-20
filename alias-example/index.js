'use strict'

import aliasExampleLogger from "alias-example-logger";
import universalLogger from "./logger/lib/console.js";

export default {
	logger: aliasExampleLogger,
	universalLogger: function(){
		universalLogger('whatever mode').call({},'Hello inception !');
  }
}
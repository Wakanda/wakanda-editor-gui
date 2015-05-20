'use strict';

import universalLogger from './lib/console';

export default function(){
	return universalLogger('test').apply({},arguments);
}
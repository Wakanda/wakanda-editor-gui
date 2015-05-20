'use strict';

import universalLogger from './lib/console';

export default function(){
	return universalLogger('development').apply({},arguments);
}
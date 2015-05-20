'use strict';

export default function(mode){
	return function(){
		console.log.apply(console, Array.prototype.concat(mode, Array.prototype.slice.call(arguments)));
	}
}
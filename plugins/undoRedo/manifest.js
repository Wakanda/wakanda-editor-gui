export default {
  "toolbar": [
		{
	    name: "undo",
	    type: "button",
	    action: "undo"
	  },
		{
	    name: "redo",
	    type: "button",
	    action: "redo"
	  }
	],
  dependencies: {
    coreModules : [
      'GUID',
      'toolbar'
    ],
    plugins:[

    ]
  }
}

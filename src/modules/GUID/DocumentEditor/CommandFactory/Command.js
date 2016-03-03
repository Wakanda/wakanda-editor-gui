// TODO: !important : change afterUndo when appending commands

class Command {
	constructor({commands, afterExecute, afterUndo, thisArg, broker}) {
		this._commands = commands;
		this._broker = broker;

		//optional
		this._thisArg = thisArg;
		this._afterExecute = [];
		if(afterExecute){
			this._afterExecute.push(afterExecute);
		}
		this._afterUndo = [];
		if(afterUndo){
			this._afterUndo.push(afterUndo);
		}
	}

	get broker(){
		return this._broker;
	}
	// execute via broker
	exec(){
		this._broker.createCommand(this)
			.executeNextCommand();
	}

	execute() {
		for(let command of this._commands) {
			command.execute();
		}
		this._callAfterExec();
	}

	undo() {
		for(let i = this._commands.length-1; i >= 0; i--){
			let command = this._commands[i];
			command.undo();
		}
		this._callAfterUndo();
	}

	_callAfterExec(){
		this._afterExecute.forEach((clbck)=>{
			clbck.call(this._thisArg);
		});
	}

	_callAfterUndo(){
		this._afterUndo.forEach((clbck)=>{
			clbck.call(this._thisArg);
		});
	}

	set afterExecute(afterExecute) {
		this._afterExecute.push(afterExecute);
	}
	set afterUndo(afterUndo) {
		this._afterUndo.push(afterUndo);
	}

	appendCommand({command}){
		this._commands.push(command);
		return this;
	}
	appendCommands({commands}){// commands is an array of commands
		Array.prototype.push.apply(this._commands, commands);
		return this;
	}
}

export default Command;

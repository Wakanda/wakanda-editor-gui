import Command from "./Command";

class AtomicCommand extends Command {
	constructor({execute, undo, thisArg, afterExecute, afterUndo, broker}) {
		super({commands: [], afterExecute, afterUndo, thisArg, broker});

		this._execute = execute;
		this._undo = undo;
	}

	execute() {
		this._execute.call(this._thisArg);
		this._callAfterExec();
	}

	undo() {
		this._undo.call(this._thisArg);
		this._callAfterUndo();
	}

	// NOTE: this method retruns a new command that contains 'this' and the command (this) is not changed
	appendCommand({command}){
		return new Command({
			commands : [this, command]
		});
	}

	// NOTE: this method retruns a new command that contains 'this' and the commands (this) is not changed
	appendCommands({commands}){
		return new Command({
			commands : [this, ...commands]
		});
	}
}

export default AtomicCommand;

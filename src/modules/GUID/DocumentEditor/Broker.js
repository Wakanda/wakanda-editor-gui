//implementing a chaining pattern
// this class manage history of changes, it need more traitement, for example to concatenate n commandes one one commande ... (it will be needed for onkeyup changes ...)
class Broker {
	constructor(...args) {
		this.onChanges = [];

		this.history = [];
		this.currentState = 0;
	}

	createCommand(command) {
		if(command){
			this.history.splice(this.currentState, Number.MAX_VALUE, command);
		}else{
			console.error('the given command is null');
		}

		return this;
	}

	executeNextCommand() {
		if (this.history[this.currentState]) {
			this.history[this.currentState].execute();
			this.currentState++;

			this.emitChange();
		}

		return this;
	}

	// same as executeNextCommand
	redo() {
		return this.executeNextCommand();
	}

	undo() {
		if (this.history[this.currentState - 1]) {
			this.currentState--;
			this.history[this.currentState].undo();

			this.emitChange();
		}

		return this;
	}

	onChange(callback) {
		this.onChanges.push(callback);

		return this;
	}

	get canUndo(){
		return this.currentState > 0;
	}

	get canRedo(){
		return this.currentState < this.history.length;
	}

	emitChange() {
		let changeInfos = {
			canUndo: this.canUndo,
			canRedo: this.canRedo
		};

		for (let changeCallBack of this.onChanges) {
			changeCallBack(changeInfos);
		}

		return this;
	}

}

export default Broker;

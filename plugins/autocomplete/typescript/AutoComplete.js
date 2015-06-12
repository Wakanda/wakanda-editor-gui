var ts = (function webpackWorkAround(){
	/**
	 * The file typescriptServices.js can't be loaded directly by webpack 'cause of a
	 * require() inside trying to load node.js module.
	 * We have to do a workaround to make things work.
	 *
	 * Note: webpack.exclude doesn't work correctly.
	 */

	var _r = require; // just in case.
	var content = require("raw!./typescriptServices.js");
	var script = {};
	var func = new Function("a", content + "; a.ts = ts;")(script);
	return script.ts;
})();

var __extends = window.__extends || function (d, b) {
	for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	function __() { this.constructor = d; }
	__.prototype = b.prototype;
	d.prototype = new __();
};

var MyLanguageServiceHost = (function () {
	function MyLanguageServiceHost() {
		var _this = this;
		this.files = {};
		this.log = function (_) {};
		this.trace = function (_) {};
		this.error = function (_) {};
		this.getCompilationSettings = ts.getDefaultCompilerOptions;
		this.getScriptIsOpen = function (_) { return true; };
		this.getCurrentDirectory = function () { return ""; };
		this.getDefaultLibFilename = function (_) { return "lib"; };
		this.getScriptVersion = function (fileName) { return _this.files[fileName].ver.toString(); };
		this.getScriptSnapshot = function (fileName) { return _this.files[fileName].file; };
	}

	MyLanguageServiceHost.prototype.getScriptFileNames = function () {
		var names = [];
		for (var name in this.files) {
			if (this.files.hasOwnProperty(name)) {
				names.push(name);
			}
		}
		return names;
		//return Object.keys(this.files);
	};

	MyLanguageServiceHost.prototype.addFile = function (fileName, body) {
		var snap = ts.ScriptSnapshot.fromString(body);
		snap.getChangeRange = function (_) { return undefined; };
		var existing = this.files[fileName];
		if (existing) {
			this.files[fileName].ver++;
			this.files[fileName].file = snap;
		}
		else {
			this.files[fileName] = { ver: 1, file: snap };
		}
	};

	return MyLanguageServiceHost;
})();


var MyCompilerHost = (function (_super) {
	__extends(MyCompilerHost, _super);
	function MyCompilerHost() {
		_super.apply(this, arguments);
		this.getCanonicalFileName = function (fileName) { return fileName; };
		this.useCaseSensitiveFileNames = function () { return true; };
		this.getNewLine = function () { return "\n"; };
	}

	MyCompilerHost.prototype.getSourceFile = function (filename, languageVersion, onError) {
		var f = this.files[filename];
		if (!f)
			return null;
		return ts.createSourceFile(filename, f.file.getText(0, f.file.getLength()), 1 /* ES5 */, f.ver.toString(), true);
	};

	MyCompilerHost.prototype.writeFile = function (filename, data, writeByteOrderMark, onError) {};

	return MyCompilerHost;
})(MyLanguageServiceHost);

export default class AutoComplete {
	constructor() {
		this.host = new MyCompilerHost();
		this.languageService = ts.createLanguageService(this.host, ts.createDocumentRegistry());

		this.addFileContent("lib.d.ts",    require('raw!./lib.d.ts'));
		this.addFileContent("jquery.d.ts", require('raw!./jquery.d.ts'));
	}

	addFileContent(path, content) {
		this.host.addFile(path.replace('.js', '.ts'), content);
	}

	getCompletionsFromPosition(_filename, _filecontent, _position) {
		this.addFileContent(_filename, _filecontent);

		return this.languageService.getCompletionsAtPosition(_filename.replace('.js', '.ts'), _position).entries.map(function(element) {
			return element.name;
		});
	}

	getCompletionsFromLineCharacter(_filename, _filecontent, _line, _character) {
		this.addFileContent(_filename, _filecontent);

		var position = ts.getPositionFromLineAndCharacter(ts.computeLineStarts(_filecontent), _line, _character);

		return this.languageService.getCompletionsAtPosition(_filename.replace('.js', '.ts'), position).entries.map(function(element) {
			return element.name;
		});
	}
}
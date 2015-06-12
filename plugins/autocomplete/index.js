import AutoComplete from "./typescript/AutoComplete";

var IDE = window.IDE;

export default {

    activate() {
        IDE.editor.onCursorPositionChange(this.onCursorPositionChange.bind(this));
        IDE.editor.onChange(this.onChange.bind(this));

        this.autocomplete = new AutoComplete();
    },

    onChange(event) {
        this.autocomplete.addFileContent(IDE.qParams.path, IDE.editor.getContent());
    },

    onCursorPositionChange(event) {
        var matches, filter, result;
        var editor, content;
        var row, column;

        editor  = IDE.editor;
        content = editor.getContent();
        row     = event.params[1].selectionAnchor.row;
        column  = event.params[1].selectionAnchor.column;

        matches = content.split('\n')[row].substr(0, column).match(/\.([a-z0-9_-]+)?$/i);
        if (matches && matches.length) {
            filter = matches[0].substr(1);
            result = this.autocomplete.getCompletionsFromLineCharacter(IDE.qParams.path, content, row+1, column + 1 - filter.length);

            // Filter only methods starting with the same word
            result = result.filter(function(value){
                return value.indexOf(filter) === 0;
            });

            console.debug('result', result);
        }
    }
}
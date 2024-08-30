import CodeMirror from 'codemirror';
import { debounce } from 'lodash';

// import './codemirror-copilot.scss';

function createSuggestionWidget(suggestion) {
    const widget = document.createElement('div');
    widget.textContent = suggestion;
    widget.className = 'inline-suggestion-widget';
    return widget;
}

// ---- NEW WORK BELOW -----
class InlineSuggestionWidget {
    private suggestion: string;

    public constructor(suggestion: string) {
        this.suggestion = suggestion;
    }

    public toDOM() {
        const span = document.createElement('span');
        span.style.opacity = '0.4';
        span.style.color = 'gray';
        span.className = 'cm-inline-suggestion';
        span.textContent = this.suggestion;
        return span;
    }
}
function getPrefixAndSuffix(editor: CodeMirror.Editor) {
    const cursor = editor.getCursor();
    const doc = editor.getDoc();
    const text = doc.getValue();

    const prefix = text.slice(0, doc.indexFromPos(cursor));
    const suffix = text.slice(doc.indexFromPos(cursor));

    return { prefix, suffix };
}

function showInlineSuggestion(editor, suggestion) {
    const cursor = editor.getCursor();
    const widget = new InlineSuggestionWidget(suggestion).toDOM();
    editor.addWidget(cursor, widget, true);

    // Remove existing widget if it exists
    // if (editor.state.inlineSuggestionWidget) {
    //     editor.state.inlineSuggestionWidget.clear();
    //     editor.state.inlineSuggestionWidget = null;
    // }
    editor.state.inlineSuggestionWidget = widget;
}

CodeMirror.defineExtension('queryAISuggestions', function () {
    this.on('keyup', async (editor: CodeMirror.Editor, event) => {
        if (event.code === 'Space') {
            const { prefix, suffix } = getPrefixAndSuffix(editor);
            console.log('PREFIX', prefix);
            console.log('SUFFIX', suffix);
            const suggestion = 'test suggestion'; // await fetchSuggestionFromBackend(prefix, suffix);
            showInlineSuggestion(editor, suggestion);
        }
    });

    this.on('keydown', (editor, event) => {
        if (event.code === 'Tab' && editor.state.inlineSuggestionWidget) {
            // Accept the suggestion
            const cursor = editor.getCursor();
            const suggestionText = suggestion;

            // Replace the text at the cursor position with the suggestion
            editor.replaceRange(suggestionText, cursor, cursor);

            // Move the cursor to the end of the suggestion
            editor.setCursor({
                line: cursor.line,
                ch: cursor.ch + suggestionText.length,
            });

            // Remove the suggestion marker
            editor.state.inlineSuggestionWidget.clear();
            editor.state.inlineSuggestionWidget = null;

            // Prevent the default Tab behavior
            event.preventDefault();
        } else if (
            event.code !== 'Tab' &&
            editor.state.inlineSuggestionWidget
        ) {
            editor.state.inlineSuggestionWidget.clear();
            editor.state.inlineSuggestionWidget = null;
        }
    });

    this.on('mousedown', (editor, event) => {
        if (editor.state.inlineSuggestionWidget) {
            // Accept the suggestion
            const cursor = editor.getCursor();
            const suggestionText = suggestion;

            // Replace the text at the cursor position with the suggestion
            editor.replaceRange(suggestionText, cursor, cursor);

            // Move the cursor to the end of the suggestion
            editor.setCursor({
                line: cursor.line,
                ch: cursor.ch + suggestionText.length,
            });

            // Remove the suggestion marker
            editor.state.inlineSuggestionWidget.clear();
            editor.state.inlineSuggestionWidget = null;
        }
    });
});

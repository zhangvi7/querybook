import CodeMirror from 'codemirror';
import { debounce } from 'lodash';

import './codemirror-copilot.scss';

function createSuggestionWidget(suggestion) {
    const widget = document.createElement('div');
    widget.textContent = suggestion;
    widget.className = 'inline-suggestion-widget';
    return widget;
}

// Fetch and display suggestions based on user input
async function fetchAndShowSuggestions(
    editor,
    emitToWebSocket,
    inlineSuggestion
) {
    emitToWebSocket();

    const cursor = editor.getCursor();
    const widget = createSuggestionWidget(inlineSuggestion);

    if (editor.inlineSuggestionWidget) {
        editor.inlineSuggestionWidget.remove();
    }
    editor.inlineSuggestionWidget = widget;

    const cursorCoords = editor.cursorCoords(cursor, 'page');
    const editorRect = editor.getWrapperElement().getBoundingClientRect();
    const widgetPosition = cursorCoords.left + widget.offsetWidth;

    if (widgetPosition > editorRect.right) {
        return;
    } else {
        const nextLine = editor.getLine(cursor.line + 1);
        if (nextLine && nextLine.trim().length > 0) {
            return;
        }

        widget.style.position = 'absolute';
        widget.style.left = `${cursorCoords.left}px`;
        widget.style.top = `${cursorCoords.bottom}px`;
        widget.style.display = '';

        editor.addWidget(cursor, widget, false);
    }
}

const debouncedFetchAndShowSuggestions = debounce(fetchAndShowSuggestions, 800);

// Define CodeMirror extension for copilot suggestions
CodeMirror.defineExtension(
    'copilotSuggestion',
    function (sendData, suggestion) {
        this.on('keyup', async (editor, event) => {
            if (event.code === 'Space') {
                await debouncedFetchAndShowSuggestions(
                    editor,
                    sendData,
                    suggestion
                );
            }
        });

        this.on('keydown', (editor, event) => {
            if (
                event.key === 'Tab' &&
                editor.inlineSuggestionWidget &&
                editor.inlineSuggestionWidget.textContent &&
                editor.inlineSuggestionWidget.style.display !== 'none'
            ) {
                const cursor = editor.getCursor();
                const suggestion = editor.inlineSuggestionWidget.textContent;
                editor.replaceRange(suggestion, cursor);
                editor.setCursor({
                    line: cursor.line,
                    ch: cursor.ch + suggestion.length,
                });
                event.preventDefault();
            }

            if (editor.inlineSuggestionWidget) {
                editor.inlineSuggestionWidget.remove();
                editor.inlineSuggestionWidget = null;
            }
        });
    }
);

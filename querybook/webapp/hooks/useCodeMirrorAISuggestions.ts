import CodeMirror from 'codemirror';
import { useCallback, useEffect, useState } from 'react';

import { AICommandType } from 'const/aiAssistant';

import { useAISocket } from './useAISocket';

export function useCodeMirrorAISuggestions(
    editorRef: React.RefObject<CodeMirror.Editor>,
    queryEngineId: number
) {
    const [inlineSuggestion, setInlineSuggestion] = useState<string>('');

    const onDataReceived = useCallback(({ data }) => {
        setInlineSuggestion(data.suggestion);
    }, []);

    const socket = useAISocket(AICommandType.SQL_AUTOCOMPLETE, onDataReceived);

    const emitToWebSocket = useCallback(() => {
        if (editorRef.current) {
            socket.emit({
                query: editorRef.current.getDoc().getValue(),
                query_engine_id: queryEngineId,
            });
        }
    }, [queryEngineId, socket, editorRef]);

    useEffect(() => {
        if (editorRef.current) {
            setTimeout(() => {
                editorRef.current.copilotSuggestion(
                    emitToWebSocket,
                    inlineSuggestion
                );
            }, 1000); // Delay to ensure editor is fully loaded
        }
    }, [emitToWebSocket, inlineSuggestion, editorRef]);

    // Return the emit function and the current inline suggestion for potential further use
    return { emitToWebSocket, inlineSuggestion };
}

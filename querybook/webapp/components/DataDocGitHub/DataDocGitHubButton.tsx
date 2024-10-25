import React, { useCallback, useState } from 'react';

import { IconButton } from 'ui/Button/IconButton';

import { GitHubWizard } from './GitHubWizard';

interface IProps {
    docId: number;
}

export const DataDocGitHubButton: React.FunctionComponent<IProps> = ({
    docId,
}) => {
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const handleOpenWizard = useCallback(() => {
        setIsWizardOpen(true);
    }, []);

    const handleCloseWizard = useCallback(() => {
        setIsWizardOpen(false);
    }, []);

    return (
        <>
            <IconButton
                icon="Github"
                onClick={handleOpenWizard}
                tooltip="Connect to GitHub"
                tooltipPos="left"
                title="GitHub"
            />
            {isWizardOpen && (
                <GitHubWizard docId={docId} onClose={handleCloseWizard} />
            )}
        </>
    );
};

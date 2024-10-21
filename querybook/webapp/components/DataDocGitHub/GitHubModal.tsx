import React, { useCallback, useEffect, useState } from 'react';

import { ComponentType, ElementType } from 'const/analytics';
import { trackClick } from 'lib/analytics';
import { GitHubResource, IGitHubAuthResponse } from 'resource/github';
import { Button } from 'ui/Button/Button';
import { Message } from 'ui/Message/Message';
import { Modal } from 'ui/Modal/Modal';

import { GitHubAuth } from './GitHubAuth';
import { GitHubFeatures } from './GitHubFeatures';
import { GitHubRepoLink } from './GitHubRepoLink';

interface IProps {
    docId: number;
    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    onClose: () => void;
}

export const GitHubModal: React.FunctionComponent<IProps> = ({
    docId,
    isAuthenticated,
    setIsAuthenticated,
    onClose,
}) => {
    const [errorMessage, setErrorMessage] = useState<string>(null);
    const [isRepoLinked, setIsRepoLinked] = useState<boolean>(false);

    useEffect(() => {
        const checkRepoLink = async () => {
            try {
                const { data } = await GitHubResource.isRepoLinked(docId);
                setIsRepoLinked(data.is_linked);
            } catch (error) {
                console.error(
                    'Failed to check GitHub repo link status:',
                    error
                );
                setErrorMessage(
                    'Failed to check GitHub repo link status. Please try again.'
                );
            }
        };

        if (isAuthenticated) {
            checkRepoLink();
        }
    }, [docId, isAuthenticated]);

    const handleAuthenticateGitHub = useCallback(async () => {
        trackClick({
            component: ComponentType.DATADOC_PAGE,
            element: ElementType.GITHUB_CONNECT_BUTTON,
        });

        try {
            const { data }: { data: IGitHubAuthResponse } =
                await GitHubResource.authenticateGitHub();
            const url = data.url;
            if (!url) {
                throw new Error('Failed to get GitHub authentication URL');
            }
            const authWindow = window.open(url);

            const receiveMessage = () => {
                authWindow.close();
                delete window.receiveChildMessage;
                window.removeEventListener('message', receiveMessage, false);
                setIsAuthenticated(true);
                alert('GitHub authentication successful');
            };
            window.receiveChildMessage = receiveMessage;

            // If the user closes the authentication window manually, clean up
            const timer = setInterval(() => {
                if (authWindow.closed) {
                    clearInterval(timer);
                    window.removeEventListener(
                        'message',
                        receiveMessage,
                        false
                    );
                    setErrorMessage(
                        'Authentication process failed. Please try again.'
                    );
                    alert('GitHub authentication failed');
                }
            }, 1000);
        } catch (error) {
            console.error('GitHub authentication failed:', error);
            setErrorMessage('GitHub authentication failed. Please try again.');
            alert('GitHub authentication failed');
        }
    }, [setIsAuthenticated]);

    const handleRepoLink = useCallback(
        async (values: {
            repoUrl: string;
            branch: string;
            filePath: string;
        }) => {
            console.log('LINK VALS', values);
            try {
                await GitHubResource.linkRepo(
                    docId,
                    values.repoUrl,
                    values.branch,
                    values.filePath
                );
                setIsRepoLinked(true);
                alert('Repository linked successfully');
            } catch (error) {
                console.error('Failed to link GitHub repository:', error);
                setErrorMessage(
                    'Failed to link GitHub repository. Please try again.'
                );
                alert('Failed to link GitHub repository');
            }
        },
        [docId]
    );

    const handleUnlinkRepo = useCallback(async () => {
        try {
            await GitHubResource.unlinkRepo(docId);
            setIsRepoLinked(false);
            alert('Repository unlinked successfully');
        } catch (error) {
            console.error('Failed to unlink GitHub repository:', error);
            setErrorMessage(
                'Failed to unlink GitHub repository. Please try again.'
            );
            alert('Failed to unlink GitHub repository');
        }
    }, [docId]);

    const authDOM = !isAuthenticated && (
        <GitHubAuth onAuthenticate={handleAuthenticateGitHub} />
    );

    const repoLinkDOM = isAuthenticated && !isRepoLinked && (
        <GitHubRepoLink onRepoLink={handleRepoLink} />
    );

    const featuresDOM = isAuthenticated && isRepoLinked && (
        <GitHubFeatures docId={docId} onUnlinkRepo={handleUnlinkRepo} />
    );

    const errorMessageDOM = errorMessage && (
        <Message message={errorMessage} type="error" />
    );

    return (
        <Modal onHide={onClose} title="GitHub Integration">
            <div className="GitHubModal-content">
                {authDOM}
                {repoLinkDOM}
                {featuresDOM}
                {errorMessageDOM}
                <Button onClick={onClose} title="Close" color="cancel" />
            </div>
        </Modal>
    );
};

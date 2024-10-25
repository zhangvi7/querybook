import React, { useCallback, useEffect, useState } from 'react';

import { ComponentType, ElementType } from 'const/analytics';
import { trackClick } from 'lib/analytics';
import { GitHubResource, IGitHubAuthResponse } from 'resource/github';
import { Button } from 'ui/Button/Button';
import { Loading } from 'ui/Loading/Loading';
import { Message } from 'ui/Message/Message';
import { Modal } from 'ui/Modal/Modal';
import { StepsBar } from 'ui/StepsBar/StepsBar';

import { GitHubAuth } from './GitHubAuth';
import { GitHubDirectorySelection } from './GitHubDirectorySelection';
import { GitHubFeatures } from './GitHubFeatures';

interface IProps {
    docId: number;
    onClose: () => void;
}

const steps = [
    'GitHub Authentication',
    'Directory Selection',
    'GitHub Features',
];

export const GitHubWizard: React.FC<IProps> = ({ docId, onClose }) => {
    const [step, setStep] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRepoLinked, setIsRepoLinked] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const authResponse = await GitHubResource.isAuthenticated();
                setIsAuthenticated(authResponse.data.is_authenticated);

                if (authResponse.data.is_authenticated) {
                    const repoLinkResponse =
                        await GitHubResource.isGitHubLinked(docId);
                    setIsRepoLinked(repoLinkResponse.data.is_linked);

                    if (repoLinkResponse.data.is_linked) {
                        setStep(2); // Skip to GitHub Features step
                    } else {
                        setStep(1); // Skip to Directory Selection step
                    }
                }
            } catch (error) {
                console.error('Failed to check GitHub status:', error);
                setErrorMessage(
                    'Failed to check GitHub status. Please try again.'
                );
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [docId]);

    const handleNextStep = () => setStep((prevStep) => prevStep + 1);
    const handlePrevStep = () => setStep((prevStep) => prevStep - 1);

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
                handleNextStep();
            };
            window.receiveChildMessage = receiveMessage;

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
    }, []);

    const handleDirectorySelection = useCallback(
        async (directory: string) => {
            try {
                await GitHubResource.linkGitHub(docId, directory);
                setIsRepoLinked(true);
                alert('Directory linked successfully');
                handleNextStep();
            } catch (error) {
                console.error('Failed to link GitHub directory:', error);
                setErrorMessage(
                    'Failed to link GitHub directory. Please try again.'
                );
                alert('Failed to link GitHub directory');
            }
        },
        [docId]
    );

    const handleUnlinkRepo = useCallback(async () => {
        try {
            await GitHubResource.unlinkGitHub(docId);
            setIsRepoLinked(false);
            alert('Repository unlinked successfully');
            setStep(1); // Go back to Directory Selection step
        } catch (error) {
            console.error('Failed to unlink GitHub repository:', error);
            setErrorMessage(
                'Failed to unlink GitHub repository. Please try again.'
            );
            alert('Failed to unlink GitHub repository');
        }
    }, [docId]);

    const renderStepContent = () => {
        if (isLoading) {
            return <Loading fullHeight text="Loading, please wait..." />;
        }

        switch (step) {
            case 0:
                return <GitHubAuth onAuthenticate={handleAuthenticateGitHub} />;
            case 1:
                return (
                    <GitHubDirectorySelection
                        docId={docId}
                        onDirectorySelect={handleDirectorySelection}
                    />
                );
            case 2:
                return (
                    <GitHubFeatures
                        docId={docId}
                        onUnlinkRepo={handleUnlinkRepo}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Modal onHide={onClose} title="GitHub Integration">
            <StepsBar steps={steps} activeStep={step} />
            {errorMessage && <Message message={errorMessage} type="error" />}
            <div className="GitHubWizard-content">{renderStepContent()}</div>
            <div className="GitHubWizard-footer">
                {step > 0 && (
                    <Button onClick={handlePrevStep} title="Previous" />
                )}
                {step < steps.length - 1 && (
                    <Button
                        onClick={handleNextStep}
                        title="Next"
                        disabled={!isAuthenticated && step === 0}
                    />
                )}
                {step === steps.length - 1 && (
                    <Button onClick={onClose} title="Finish" />
                )}
            </div>
        </Modal>
    );
};

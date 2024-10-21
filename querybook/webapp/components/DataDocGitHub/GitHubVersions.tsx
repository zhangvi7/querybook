import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { usePaginatedResource } from 'hooks/usePaginatedResource';
import { restoreDataDocVersion } from 'redux/dataDoc/action';
import { GitHubResource, ICommit } from 'resource/github';
import { AsyncButton } from 'ui/AsyncButton/AsyncButton';
import { ErrorPage } from 'ui/ErrorPage/ErrorPage';
import { Link } from 'ui/Link/Link';
import { Loading } from 'ui/Loading/Loading';
import { Message } from 'ui/Message/Message';
import { AccentText } from 'ui/StyledText/StyledText';

import './GitHub.scss';

interface IProps {
    docId: number;
}

export const GitHubVersions: React.FunctionComponent<IProps> = ({ docId }) => {
    const dispatch = useDispatch();
    const {
        data: commitVersions,
        isLoading,
        isError,
        fetchMore,
        hasMore,
    } = usePaginatedResource<ICommit>(
        useCallback(
            (limit, offset) =>
                GitHubResource.getDataDocVersions(docId, limit, offset),
            [docId]
        ),
        { batchSize: 10 }
    );

    const handleRestore = async (commitSha: string, commitMessage: string) => {
        try {
            await dispatch(restoreDataDocVersion(docId, commitSha));
            alert(`Version restored successfully:\n\n${commitMessage}`);
        } catch (error) {
            console.error('Failed to restore version:', error);
            alert('Failed to restore version');
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Loading />
                <div className="loading-message">Loading versions...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <ErrorPage
                errorTitle="Failed to Load Versions"
                errorMessage="There was an error loading the versions. Please try again later."
            />
        );
    }

    if (commitVersions.length === 0) {
        return (
            <div className="no-versions">
                <Message
                    message="No previous versions found for this DataDoc."
                    type="info"
                />
            </div>
        );
    }

    return (
        <div className="GitHubVersions">
            <ul className="commit-list">
                {commitVersions.map((version) => (
                    <li key={version.sha} className="commit-item">
                        <Message
                            title={version.commit.message}
                            message={
                                <>
                                    <div>
                                        <strong>Author:</strong>{' '}
                                        {version.commit.author.name}
                                    </div>
                                    <div>
                                        <strong>Date:</strong>{' '}
                                        {new Date(
                                            version.commit.author.date
                                        ).toLocaleString()}
                                    </div>
                                    <div className="commit-actions">
                                        <Link
                                            href={version.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on GitHub
                                        </Link>
                                        <AsyncButton
                                            onClick={() =>
                                                handleRestore(
                                                    version.sha,
                                                    version.commit.message
                                                )
                                            }
                                        >
                                            Restore Version
                                        </AsyncButton>
                                    </div>
                                </>
                            }
                            type="info"
                        />
                    </li>
                ))}
            </ul>
            {hasMore && (
                <AsyncButton onClick={fetchMore}>Load More</AsyncButton>
            )}
        </div>
    );
};

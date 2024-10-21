import React, { useState } from 'react';

import { Button } from 'ui/Button/Button';
import { Tabs } from 'ui/Tabs/Tabs';

import { GitHubPush } from './GitHubPush';
import { GitHubVersions } from './GitHubVersions';

interface IProps {
    docId: number;
    onUnlinkRepo: () => void;
}

const GITHUB_TABS = [
    { key: 'push', name: 'Push to GitHub' },
    { key: 'versions', name: 'GitHub Versions' },
];

type GitHubTabKey = 'push' | 'versions';

export const GitHubFeatures: React.FunctionComponent<IProps> = ({
    docId,
    onUnlinkRepo,
}) => {
    const [activeTab, setActiveTab] = useState<GitHubTabKey>('push');

    return (
        <div className="GitHubFeatures">
            <Tabs
                selectedTabKey={activeTab}
                items={GITHUB_TABS}
                onSelect={(key: GitHubTabKey) => {
                    setActiveTab(key);
                }}
            />
            {activeTab === 'push' && <GitHubPush docId={docId} />}
            {activeTab === 'versions' && <GitHubVersions docId={docId} />}
            <div className="mt16">
                <Button
                    onClick={onUnlinkRepo}
                    title="Unlink Repository"
                    color="default"
                />
            </div>
        </div>
    );
};

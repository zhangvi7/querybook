import React, { useState } from 'react';

import { TooltipDirection } from 'const/tooltip';
import { Button } from 'ui/Button/Button';
import { AllLucideIconNames } from 'ui/Icon/LucideIcons';
import { Tabs } from 'ui/Tabs/Tabs';

import { GitHubPush } from './GitHubPush';
import { GitHubVersions } from './GitHubVersions';

interface IProps {
    docId: number;
    onUnlinkRepo: () => void;
}

const GITHUB_TABS = [
    {
        key: 'push',
        name: 'Push to GitHub',
        icon: 'GitPullRequest' as AllLucideIconNames,
        tooltip: 'Push your changes to GitHub',
        tooltipPos: 'up' as TooltipDirection,
    },
    {
        key: 'versions',
        name: 'GitHub Versions',
        icon: 'History' as AllLucideIconNames,
        tooltip: 'View and manage previous versions',
        tooltipPos: 'up' as TooltipDirection,
    },
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
                pills
                wide
                size="large"
                selectColor
                className="github-tab-item"
            />
            {activeTab === 'push' && <GitHubPush docId={docId} />}
            {activeTab === 'versions' && <GitHubVersions docId={docId} />}
        </div>
    );
};

import React from 'react';

import { AsyncButton } from 'ui/AsyncButton/AsyncButton';
import { Icon } from 'ui/Icon/Icon';
import { Message } from 'ui/Message/Message';

import './GitHub.scss';

interface IProps {
    onAuthenticate: () => Promise<void>;
}

export const GitHubAuth: React.FunctionComponent<IProps> = ({
    onAuthenticate,
}) => (
    <div className="GitHubAuth">
        <Icon name="Github" size={64} className="GitHubAuth-icon" />
        <Message
            title="Connect to GitHub"
            message="We need your permission to access your GitHub repositories. Please authenticate to enable GitHub features on Querybook."
            type="info"
            iconSize={32}
        />
        <AsyncButton
            onClick={onAuthenticate}
            title="Connect Now"
            color="accent"
            theme="fill"
        />
    </div>
);

import ds from 'lib/datasource';

export interface IGitHubAuthResponse {
    url: string;
}

export interface ICommitAuthor {
    date: string;
    email: string;
    name: string;
}

export interface ICommitData {
    author: ICommitAuthor;
    message: string;
}

export interface ICommit {
    html_url: string;
    commit: ICommitData;
    sha: string;
}

export const GitHubResource = {
    authenticateGitHub: () => ds.fetch<IGitHubAuthResponse>('/github/auth/'),
    isAuthenticated: () =>
        ds.fetch<{ is_authenticated: boolean }>('/github/is_authenticated/'),
    linkGitHub: (docId: number, directory: string) =>
        ds.save(`/github/datadocs/${docId}/link/`, {
            directory,
        }),
    unlinkGitHub: (docId: number) =>
        ds.delete(`/github/datadocs/${docId}/unlink/`),
    isGitHubLinked: (docId: number) =>
        ds.fetch<{ is_linked: boolean }>(
            `/github/datadocs/${docId}/is_linked/`
        ),
    getDirectories: (docId: number) =>
        ds.fetch<{ directories: string[] }>(
            `/github/datadocs/${docId}/directories/`
        ),
    commitDataDoc: (docId: number, commitMessage: string) =>
        ds.save(`/github/datadocs/${docId}/commit/`, {
            commit_message: commitMessage,
        }),
    getDataDocVersions: (docId: number, limit: number, offset: number) =>
        ds.fetch<ICommit[]>(`/github/datadocs/${docId}/versions/`, {
            limit,
            offset,
        }),
};

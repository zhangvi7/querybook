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
    linkRepo: (
        docId: number,
        repoUrl: string,
        branch?: string,
        filePath?: string
    ) =>
        ds.save(`/github/datadocs/${docId}/link/`, {
            repo_url: repoUrl,
            branch,
            file_path: filePath,
        }),
    unlinkRepo: (docId: number) => ds.save(`/github/datadocs/${docId}/unlink/`),
    isRepoLinked: (docId: number) =>
        ds.fetch<{ is_linked: boolean }>(
            `/github/datadocs/${docId}/is_linked/`
        ),
    commitDataDoc: (docId: number, commitMessage: string, forcePush: boolean) =>
        ds.save(`/github/datadocs/${docId}/commit/`, {
            commit_message: commitMessage,
            force_push: forcePush,
        }),
    getDataDocVersions: (docId: number, limit: number, offset: number) =>
        ds.fetch<ICommit[]>(`/github/datadocs/${docId}/versions/`),
    restoreDataDocVersion: (docId: number, commitSha: string) =>
        ds.save(`/github/datadocs/${docId}/restore/`, {
            commit_sha: commitSha,
        }),
};

from flask import session as flask_session
from github import Github, GithubException, Auth
from typing import List, Dict, Optional

from lib.github_integration.serializers import (
    deserialize_datadoc_from_markdown,
    serialize_datadoc_to_markdown,
)
from lib.logger import get_logger
from models.datadoc import DataDoc
from models.github import GitHubLink

LOG = get_logger(__file__)


class GitHubClient:
    def __init__(self, github_link: GitHubLink):
        """
        Initialize the GitHub client with an access token from the session.
        Raises an exception if the token is not found.
        """
        access_token = flask_session.get("github_access_token")
        if not access_token:
            raise Exception("GitHub OAuth token not found in session")
        auth = Auth.Token(access_token)
        self.client = Github(auth=auth)
        self.user = self.client.get_user()
        self.github_link = github_link
        self.repo = self.client.get_repo(github_link.repo_url)

    def commit_datadoc(
        self,
        datadoc: DataDoc,
        commit_message: Optional[str] = None,
        force_push: bool = False,
    ):
        """
        Commit a DataDoc to the repository.
        Args:
            datadoc (DataDoc): The DataDoc object to commit.
            commit_message (Optional[str]): Custom commit message. Defaults to a standard message.
        Raises:
            Exception: If committing the DataDoc fails.
        """
        file_path = self.github_link.file_path
        content = serialize_datadoc_to_markdown(datadoc)
        if commit_message is None:
            commit_message = f"Update DataDoc {datadoc.id}: {datadoc.title}"

        try:
            contents = self.repo.get_contents(file_path, ref=self.github_link.branch)
            # Update file
            self.repo.update_file(
                path=contents.path,
                message=commit_message,
                content=content,
                sha=contents.sha,
                branch=self.github_link.branch,
            )
            LOG.info(f"Updated file {file_path} in repository.")
        except GithubException as e:
            if e.status == 404:
                # Create new file
                self.repo.create_file(
                    path=file_path,
                    message=commit_message,
                    content=content,
                    branch=self.github_link.branch,
                )
                LOG.info(f"Created file {file_path} in repository.")
            else:
                LOG.error(f"GitHubException: {e}")
                raise Exception(f"Failed to commit DataDoc: {e}")

    def get_datadoc_versions(self, datadoc: DataDoc) -> List[Dict]:
        """
        Get the versions of a DataDoc.
        Args:
            datadoc (DataDoc): The DataDoc object.
        Returns:
            List[Dict]: A list of commit dictionaries.
        """
        file_path = self.github_link.file_path
        try:
            commits = self.repo.get_commits(path=file_path, sha=self.github_link.branch)
            return [commit.raw_data for commit in commits]
        except GithubException as e:
            if e.status == 404:
                LOG.warning(f"No versions found for file {file_path}")
            else:
                LOG.error(f"GitHubException: {e}")
            return []

    def get_datadoc_at_commit(self, datadoc_id: int, commit_sha: str) -> DataDoc:
        """
        Get a DataDoc at a specific commit.
        Args:
            datadoc_id (int): The DataDoc ID.
            commit_sha (str): The commit SHA.
        Returns:
            DataDoc: The DataDoc object at the specified commit.
        Raises:
            Exception: If getting the DataDoc at the commit fails.
        """
        file_path = self.github_link.file_path
        try:
            file_contents = self.repo.get_contents(path=file_path, ref=commit_sha)
            markdown_content = file_contents.decoded_content.decode("utf-8")
            return deserialize_datadoc_from_markdown(markdown_content)
        except GithubException as e:
            LOG.error(f"GitHubException: {e}")
            raise Exception(f"Failed to get DataDoc at commit {commit_sha}: {e}")

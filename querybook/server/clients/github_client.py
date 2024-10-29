from github import Github, GithubException, Auth
from typing import List, Dict, Optional

from lib.github.serializers import (
    deserialize_datadoc_from_markdown,
    serialize_datadoc_to_markdown,
)
from lib.logger import get_logger
from models.datadoc import DataDoc
from models.github import GitHubLink
from env import QuerybookSettings

LOG = get_logger(__name__)


class GitHubClient:
    def __init__(self, access_token: str, github_link: Optional[GitHubLink] = None):
        """
        Initialize the GitHub client with an access token.
        Args:
            access_token (str): The GitHub access token.
            github_link (Optional[GitHubLink]): The GitHub link object.
        """
        self.github_link = github_link
        auth = Auth.Token(access_token)
        self.client = Github(auth=auth, per_page=5)
        self.user = self.client.get_user()
        self.repo = self._get_repository()
        self.branch = QuerybookSettings.GITHUB_BRANCH
        self.file_path = self._build_file_path() if github_link else None

    def _get_repository(self):
        repo_name = QuerybookSettings.GITHUB_REPO_NAME
        if not repo_name:
            LOG.error("GITHUB_REPO_NAME is not configured")
            raise Exception("GITHUB_REPO_NAME is not configured")
        return self.client.get_repo(repo_name)

    def _build_file_path(self) -> str:
        directory = self.github_link.directory
        file_name = f"datadoc_{self.github_link.datadoc.id}.md"
        return f"{directory}/{file_name}"

    def commit_datadoc(self, commit_message: Optional[str] = None) -> None:
        """
        Commit a DataDoc to the repository.
        Args:
            commit_message (Optional[str]): Commit message. Defaults to a standard message.
        Raises:
            Exception: If committing the DataDoc fails.
        """
        if not self.github_link:
            raise Exception("GitHub link is required for this operation")

        datadoc = self.github_link.datadoc
        content = serialize_datadoc_to_markdown(datadoc)
        if not commit_message:
            commit_message = (
                f"Update DataDoc {datadoc.id}: {datadoc.title or 'Untitled'}"
            )

        try:
            contents = self.repo.get_contents(self.file_path, ref=self.branch)
            # Update file
            self.repo.update_file(
                path=contents.path,
                message=commit_message,
                content=content,
                sha=contents.sha,
                branch=self.branch,
            )
            LOG.info(f"Updated file {self.file_path} in repository.")
        except GithubException as e:
            if e.status == 404:
                # Create new file
                self.repo.create_file(
                    path=self.file_path,
                    message=commit_message,
                    content=content,
                    branch=self.branch,
                )
                LOG.info(f"Created file {self.file_path} in repository.")
            else:
                LOG.error(f"GitHubException during commit: {e}")
                raise Exception(f"Failed to commit DataDoc: {e}")

    def get_datadoc_versions(self, page: int = 1) -> List[Dict]:
        """
        Get the versions of a DataDoc with pagination.
        Args:
            page (int): Page number.
        Returns:
            List[Dict]: A list of commit dictionaries.
        """
        if not self.github_link:
            raise Exception("GitHub link is required for this operation")

        try:
            commits = self.repo.get_commits(
                path=self.file_path,
                sha=self.branch,
            ).get_page(page - 1)
            return [commit.raw_data for commit in commits]
        except GithubException as e:
            LOG.error(f"GitHubException during get_datadoc_versions: {e}")
            return []

    def get_datadoc_at_commit(self, commit_sha: str) -> DataDoc:
        """
        Get a DataDoc at a specific commit.
        Args:
            commit_sha (str): The commit SHA.
        Returns:
            DataDoc: The DataDoc object at the specified commit.
        Raises:
            Exception: If getting the DataDoc at the commit fails.
        """
        if not self.github_link:
            raise Exception("GitHub link is required for this operation")

        try:
            file_contents = self.repo.get_contents(path=self.file_path, ref=commit_sha)
            content = file_contents.decoded_content.decode("utf-8")
            return deserialize_datadoc_from_markdown(content)
        except GithubException as e:
            LOG.error(f"GitHubException during get_datadoc_at_commit: {e}")
            raise Exception(f"Failed to get DataDoc at commit {commit_sha}: {e}")

    def get_repo_directories(self) -> List[str]:
        """
        Get all directories in the repository.
        Returns:
            List[str]: A list of directory names.
        """
        try:
            contents = self.repo.get_contents("")
            directories = [
                content.path for content in contents if content.type == "dir"
            ]
            return directories
        except GithubException as e:
            LOG.error(f"GitHubException during get_directories: {e}")
            return []

import pytest
from unittest.mock import MagicMock
from clients.github_client import GitHubClient

# from models.datadoc import DataDoc
from models.github import GitHubLink
from github import GithubException


@pytest.fixture
def mock_github(monkeypatch):
    mock_github = MagicMock()
    monkeypatch.setattr("clients.github_client.Github", mock_github)
    return mock_github


@pytest.fixture
def mock_github_link():
    return GitHubLink(
        datadoc_id=1,
        user_id=1,
        directory="datadocs",
    )


@pytest.fixture
def mock_repo():
    return MagicMock()


def test_initialization(mock_github, mock_github_link, mock_repo):
    access_token = "fake_token"
    mock_github_instance = mock_github.return_value
    mock_github_instance.get_repo.return_value = mock_repo
    client = GitHubClient(mock_github_link, access_token)
    assert client.client is not None
    assert client.user is not None
    assert client.repo is not None


def test_initialization_no_token(mock_github_link):
    with pytest.raises(Exception) as excinfo:
        GitHubClient(mock_github_link, "")
    assert "GitHub OAuth token not found in session" in str(excinfo.value)


def test_commit_datadoc_update(mock_github, mock_github_link, mock_repo):
    access_token = "fake_token"
    mock_github_instance = mock_github.return_value
    mock_github_instance.get_repo.return_value = mock_repo
    mock_repo.get_contents.return_value = MagicMock(sha="fake_sha")
    client = GitHubClient(mock_github_link, access_token)
    # datadoc = DataDoc(id=1, title="Test Doc")
    client.commit_datadoc()
    mock_repo.update_file.assert_called_once()


def test_commit_datadoc_create(mock_github, mock_github_link, mock_repo):
    access_token = "fake_token"
    mock_github_instance = mock_github.return_value
    mock_github_instance.get_repo.return_value = mock_repo
    mock_repo.get_contents.side_effect = GithubException(404, "Not Found", None)
    client = GitHubClient(mock_github_link, access_token)
    # datadoc = DataDoc(id=1, title="Test Doc")
    client.commit_datadoc()
    mock_repo.create_file.assert_called_once()


def test_get_datadoc_versions(mock_github, mock_github_link, mock_repo):
    access_token = "fake_token"
    mock_github_instance = mock_github.return_value
    mock_github_instance.get_repo.return_value = mock_repo
    mock_commit = MagicMock()
    mock_commit.raw_data = {"sha": "123"}
    mock_repo.get_commits.return_value = [mock_commit]
    client = GitHubClient(mock_github_link, access_token)
    versions = client.get_datadoc_versions()
    assert len(versions) == 1
    assert versions[0]["sha"] == "123"

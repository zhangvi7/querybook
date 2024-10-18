from typing import Optional
from app.db import with_session
from models.github import GitHubLink
from models.datadoc import DataDoc


@with_session
def create_repo_link(
    datadoc_id: int,
    user_id: int,
    repo_url: str,
    branch: str,
    file_path: str,
    commit=True,
    session=None,
):
    datadoc = DataDoc.get(id=datadoc_id, session=session)
    assert datadoc is not None, f"DataDoc with id {datadoc_id} not found"

    github_link = GitHubLink.get(datadoc_id=datadoc_id, session=session)
    assert (
        github_link is None
    ), f"GitHub link for DataDoc with id {datadoc_id} already exists"

    github_link = GitHubLink.create(
        {
            "datadoc_id": datadoc_id,
            "user_id": user_id,
            "repo_url": repo_url,
            "branch": branch,
            "file_path": file_path,
        },
        commit=commit,
        session=session,
    )
    return github_link


@with_session
def get_repo_link(datadoc_id: int, session=None) -> Optional[GitHubLink]:
    return GitHubLink.get(datadoc_id=datadoc_id, session=session)


@with_session
def delete_repo_link(datadoc_id: int, commit=True, session=None):
    github_link = get_repo_link(datadoc_id=datadoc_id, session=session)
    GitHubLink.delete(id=github_link.id, commit=commit, session=session)

from app.datasource import register, api_assert
from app.db import DBSession
from lib.github_integration.github_integration import get_github_manager
from clients.github_client import GitHubClient
from functools import wraps
from typing import List, Dict
from logic import datadoc as datadoc_logic
from logic import github as logic
from const.datasources import RESOURCE_NOT_FOUND_STATUS_CODE
from logic.datadoc_permission import assert_can_read, assert_can_write
from app.auth.permission import verify_data_doc_permission
from flask_login import current_user


def with_github_client(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        datadoc_id = kwargs.get("datadoc_id")
        github_link = logic.get_repo_link(datadoc_id)
        github_client = GitHubClient(github_link)
        return f(github_client, *args, **kwargs)

    return decorated_function


@register("/github/auth/", methods=["GET"])
def connect_github() -> Dict[str, str]:
    github_manager = get_github_manager()
    return github_manager.initiate_github_integration()


@register("/github/is_authenticated/", methods=["GET"])
def is_github_authenticated() -> str:
    github_manager = get_github_manager()
    is_authenticated = github_manager.get_github_token() is not None
    return {"is_authenticated": is_authenticated}


@register("/github/datadocs/<int:datadoc_id>/link/", methods=["POST"])
def link_datadoc_to_github(
    datadoc_id: int,
    repo_url: str,
    branch: str,
    file_path: str,
) -> Dict:
    return logic.create_repo_link(
        datadoc_id=datadoc_id,
        user_id=current_user.id,
        repo_url=repo_url,
        branch=branch,
        file_path=file_path,
    )


@register("/github/datadocs/<int:datadoc_id>/commit/", methods=["POST"])
@with_github_client
def commit_datadoc(
    github_client: GitHubClient,
    datadoc_id: int,
) -> Dict:
    with DBSession() as session:
        datadoc = datadoc_logic.get_data_doc_by_id(datadoc_id, session=session)
        api_assert(
            datadoc is not None,
            "DataDoc not found",
            status_code=RESOURCE_NOT_FOUND_STATUS_CODE,
        )
        assert_can_write(datadoc_id, session=session)
        verify_data_doc_permission(datadoc_id, session=session)
        github_client.commit_datadoc(datadoc)
        return {"message": "DataDoc committed successfully"}


@register("/github/datadocs/<int:datadoc_id>/versions/", methods=["GET"])
@with_github_client
def get_datadoc_versions(github_client: GitHubClient, datadoc_id: int) -> List[Dict]:
    datadoc = datadoc_logic.get_data_doc_by_id(datadoc_id)
    api_assert(
        datadoc is not None,
        "DataDoc not found",
        status_code=RESOURCE_NOT_FOUND_STATUS_CODE,
    )
    assert_can_read(datadoc_id)
    verify_data_doc_permission(datadoc_id)
    versions = github_client.get_datadoc_versions(datadoc)
    return versions


@register("/github/datadocs/<int:datadoc_id>/restore/", methods=["POST"])
@with_github_client
def restore_datadoc_version(
    github_client: GitHubClient, datadoc_id: int, commit_sha: str
) -> Dict:
    datadoc = datadoc_logic.get_data_doc_by_id(datadoc_id)
    api_assert(
        datadoc is not None,
        "DataDoc not found",
        status_code=RESOURCE_NOT_FOUND_STATUS_CODE,
    )
    assert_can_write(datadoc_id)
    verify_data_doc_permission(datadoc_id)
    restored_datadoc = github_client.get_datadoc_at_commit(datadoc.id, commit_sha)
    saved_datadoc = datadoc_logic.restore_data_doc(restored_datadoc)
    return saved_datadoc.to_dict(with_cells=True)

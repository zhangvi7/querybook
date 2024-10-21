import yaml
from models.datadoc import DataDoc, DataCell
from const.data_doc import DataCellType
from typing import List
import re


def serialize_metadata(metadata: dict) -> str:
    return yaml.dump(metadata, default_flow_style=False)


def deserialize_metadata(metadata_str: str) -> dict:
    return yaml.safe_load(metadata_str)


def serialize_datadoc_metadata(datadoc: DataDoc) -> str:
    metadata = {
        "id": datadoc.id,
        "environment_id": datadoc.environment_id,
        "public": datadoc.public,
        "archived": datadoc.archived,
        "owner_uid": datadoc.owner_uid,
        "created_at": datadoc.created_at,
        "updated_at": datadoc.updated_at,
        "meta": datadoc.meta,
        "title": datadoc.title,
    }
    return serialize_metadata(metadata)


def serialize_datadoc_content(cells: List[DataCell]) -> str:
    content = []
    for cell in cells:
        cell_metadata = {
            "id": cell.id,
            "cell_type": cell.cell_type.name,
            "created_at": cell.created_at,
            "updated_at": cell.updated_at,
            "meta": cell.meta,
        }
        cell_content = cell.context
        content.append(
            f"---\n{serialize_metadata(cell_metadata)}---\n```{cell.cell_type.name.lower()}\n{cell_content}\n```"
        )
    return "\n\n".join(content)


def serialize_datadoc_to_markdown(datadoc: DataDoc) -> str:
    metadata = serialize_datadoc_metadata(datadoc)
    content = serialize_datadoc_content(datadoc.cells)
    return f"---\n{metadata}---\n\n# {datadoc.title}\n\n{content}"


def deserialize_datadoc_metadata(metadata_str: str) -> DataDoc:
    metadata = deserialize_metadata(metadata_str)
    datadoc = DataDoc(
        id=metadata.get("id"),
        environment_id=metadata.get("environment_id"),
        public=metadata.get("public", True),
        archived=metadata.get("archived", False),
        owner_uid=metadata.get("owner_uid"),
        created_at=metadata.get("created_at"),
        updated_at=metadata.get("updated_at"),
        title=metadata.get("title", ""),
    )
    datadoc.meta = metadata.get("meta", {})
    return datadoc


def deserialize_datadoc_content(content_str: str) -> List[DataCell]:
    cells = []
    # Regular expression to match metadata and content blocks
    pattern = re.compile(r"---\n(.*?)\n---\n```(.*?)\n(.*?)\n```", re.DOTALL)
    matches = pattern.findall(content_str)

    for metadata_str, cell_type, context in matches:
        metadata_str = metadata_str.strip()
        metadata = deserialize_metadata(metadata_str)
        if metadata is None:
            raise ValueError(f"Failed to deserialize metadata: {metadata_str}")
        cell = DataCell(
            id=metadata["id"],
            cell_type=DataCellType[cell_type],
            context=context.strip(),
            created_at=metadata["created_at"],
            updated_at=metadata["updated_at"],
            meta=metadata["meta"],
        )
        cells.append(cell)

    return cells


def deserialize_datadoc_from_markdown(markdown_str: str) -> DataDoc:
    try:
        metadata_str, content_str = markdown_str.split("---\n\n", 1)
        metadata_str = metadata_str.strip("---\n")
        datadoc = deserialize_datadoc_metadata(metadata_str)
        datadoc.cells = deserialize_datadoc_content(content_str)
        return datadoc
    except Exception as e:
        raise ValueError(f"Failed to deserialize DataDoc from markdown: {e}")

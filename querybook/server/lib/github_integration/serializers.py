import json
from models.datadoc import DataDoc, DataCell
from const.data_doc import DataCellType


def serialize_datadoc(datadoc: DataDoc) -> str:
    datadoc_dict = datadoc.to_dict(with_cells=True)
    return json.dumps(datadoc_dict, indent=4, default=str)


def deserialize_datadoc(json_content: str) -> DataDoc:
    datadoc_dict = json.loads(json_content)
    datadoc = DataDoc(
        id=datadoc_dict.get("id"),
        environment_id=datadoc_dict.get("environment_id"),
        public=datadoc_dict.get("public", True),
        archived=datadoc_dict.get("archived", False),
        owner_uid=datadoc_dict.get("owner_uid"),
        created_at=datadoc_dict.get("created_at"),
        updated_at=datadoc_dict.get("updated_at"),
        title=datadoc_dict.get("title", ""),
    )

    # Need to set the meta attribute directly
    datadoc.meta = datadoc_dict.get("meta")

    # Deserialize cells
    cells_data = datadoc_dict.get("cells", [])
    cells = []
    for cell_dict in cells_data:
        cell = DataCell(
            id=cell_dict.get("id"),
            cell_type=DataCellType[cell_dict.get("cell_type")],
            context=cell_dict.get("context"),
            meta=cell_dict.get("meta"),
            created_at=cell_dict.get("created_at"),
            updated_at=cell_dict.get("updated_at"),
        )
        cells.append(cell)
    datadoc.cells = cells
    return datadoc

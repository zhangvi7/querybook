import pytest
import json
from const.data_doc import DataCellType
from lib.github_integration.serializers import serialize_datadoc, deserialize_datadoc
from models.datadoc import DataCell, DataDoc


@pytest.fixture
def mock_datadoc():
    cells = [
        DataCell(
            id=1,
            cell_type=DataCellType.query,
            context="SELECT * FROM table;",
            created_at="2023-01-01T00:00:00Z",
            updated_at="2023-01-01T00:00:00Z",
        ),
        DataCell(
            id=2,
            cell_type=DataCellType.text,
            context="This is a text cell.",
            created_at="2023-01-01T00:00:00Z",
            updated_at="2023-01-01T00:00:00Z",
        ),
    ]
    datadoc = DataDoc(
        id=1,
        environment_id=1,
        public=True,
        archived=False,
        owner_uid="user1",
        created_at="2023-01-01T00:00:00Z",
        updated_at="2023-01-01T00:00:00Z",
        title="Test DataDoc",
        cells=cells,
    )
    return datadoc


def test_serialize_datadoc(mock_datadoc):
    serialized = serialize_datadoc(mock_datadoc)
    datadoc_dict = mock_datadoc.to_dict(with_cells=True)
    expected_serialized = json.dumps(datadoc_dict, indent=4, default=str)
    assert serialized == expected_serialized


def test_deserialize_datadoc(mock_datadoc):
    datadoc_dict = mock_datadoc.to_dict(with_cells=True)
    json_content = json.dumps(datadoc_dict, indent=4, default=str)
    deserialized = deserialize_datadoc(json_content)

    assert deserialized.id == mock_datadoc.id
    assert deserialized.environment_id == mock_datadoc.environment_id
    assert deserialized.public == mock_datadoc.public
    assert deserialized.archived == mock_datadoc.archived
    assert deserialized.owner_uid == mock_datadoc.owner_uid
    assert deserialized.created_at == mock_datadoc.created_at
    assert deserialized.updated_at == mock_datadoc.updated_at
    assert deserialized.title == mock_datadoc.title
    assert deserialized.meta == mock_datadoc.meta
    assert len(deserialized.cells) == len(mock_datadoc.cells)
    for d_cell, m_cell in zip(deserialized.cells, mock_datadoc.cells):
        assert d_cell.id == m_cell.id
        assert d_cell.cell_type == m_cell.cell_type
        assert d_cell.context == m_cell.context
        assert d_cell.meta == m_cell.meta
        assert d_cell.created_at == m_cell.created_at
        assert d_cell.updated_at == m_cell.updated_at

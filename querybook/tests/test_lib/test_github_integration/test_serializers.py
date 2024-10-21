import pytest
import yaml
from const.data_doc import DataCellType
from lib.github_integration.serializers import (
    serialize_datadoc_to_markdown,
    deserialize_datadoc_from_markdown,
)
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
            meta={"variables": [{"name": "var1", "value": "value1", "type": "string"}]},
        ),
        DataCell(
            id=2,
            cell_type=DataCellType.text,
            context="This is a text cell.",
            created_at="2023-01-01T00:00:00Z",
            updated_at="2023-01-01T00:00:00Z",
            meta={"variables": [{"name": "var2", "value": True, "type": "boolean"}]},
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
    datadoc.meta = {"variables": [{"name": "doc_var", "value": 123, "type": "number"}]}
    return datadoc


class TestSerializers:
    def test_serialize_datadoc_to_markdown(self, mock_datadoc):
        serialized = serialize_datadoc_to_markdown(mock_datadoc)
        expected_serialized = (
            "---\n"
            "archived: false\n"
            "created_at: '2023-01-01T00:00:00Z'\n"
            "environment_id: 1\n"
            "id: 1\n"
            "meta:\n"
            "  variables:\n"
            "  - name: doc_var\n"
            "    type: number\n"
            "    value: 123\n"
            "owner_uid: user1\n"
            "public: true\n"
            "title: Test DataDoc\n"
            "updated_at: '2023-01-01T00:00:00Z'\n"
            "---\n\n"
            "# Test DataDoc\n\n"
            "---\n"
            "id: 1\n"
            "cell_type: query\n"
            "created_at: '2023-01-01T00:00:00Z'\n"
            "updated_at: '2023-01-01T00:00:00Z'\n"
            "meta:\n"
            "  variables:\n"
            "  - name: var1\n"
            "    type: string\n"
            "    value: value1\n"
            "---\n"
            "```query\n"
            "SELECT * FROM table;\n"
            "```\n\n"
            "---\n"
            "id: 2\n"
            "cell_type: text\n"
            "created_at: '2023-01-01T00:00:00Z'\n"
            "updated_at: '2023-01-01T00:00:00Z'\n"
            "meta:\n"
            "  variables:\n"
            "  - name: var2\n"
            "    type: boolean\n"
            "    value: true\n"
            "---\n"
            "```text\n"
            "This is a text cell.\n"
            "```"
        )

        # Keys in dicts are not ordered, need to split and parse into yaml dict for ordering
        serialized_parts = serialized.split("---\n")
        expected_parts = expected_serialized.split("---\n")

        # Parse metadata into dict
        serialized_metadata = yaml.safe_load(serialized_parts[1].strip())
        expected_metadata = yaml.safe_load(expected_parts[1].strip())
        assert serialized_metadata == expected_metadata

        # Parse content into dict
        serialized_content_1 = yaml.safe_load(serialized_parts[3].strip())
        expected_content_1 = yaml.safe_load(expected_parts[3].strip())
        serialized_content_2 = yaml.safe_load(serialized_parts[5].strip())
        expected_content_2 = yaml.safe_load(expected_parts[5].strip())
        assert serialized_content_1 == expected_content_1
        assert serialized_content_2 == expected_content_2

    def test_deserialize_datadoc_from_markdown(self, mock_datadoc):
        markdown_content = (
            "---\n"
            "archived: false\n"
            "created_at: '2023-01-01T00:00:00Z'\n"
            "environment_id: 1\n"
            "id: 1\n"
            "meta:\n"
            "  variables:\n"
            "  - name: doc_var\n"
            "    type: number\n"
            "    value: 123\n"
            "owner_uid: user1\n"
            "public: true\n"
            "title: Test DataDoc\n"
            "updated_at: '2023-01-01T00:00:00Z'\n"
            "---\n\n"
            "# Test DataDoc\n\n"
            "---\n"
            "created_at: '2023-01-01T00:00:00Z'\n"
            "id: 1\n"
            "meta:\n"
            "  variables:\n"
            "  - name: var1\n"
            "    type: string\n"
            "    value: value1\n"
            "cell_type: query\n"
            "updated_at: '2023-01-01T00:00:00Z'\n"
            "---\n"
            "```query\n"
            "SELECT * FROM table;\n"
            "```\n\n"
            "---\n"
            "created_at: '2023-01-01T00:00:00Z'\n"
            "id: 2\n"
            "meta:\n"
            "  variables:\n"
            "  - name: var2\n"
            "    type: boolean\n"
            "    value: true\n"
            "cell_type: text\n"
            "updated_at: '2023-01-01T00:00:00Z'\n"
            "---\n"
            "```text\n"
            "This is a text cell.\n"
            "```"
        )
        deserialized = deserialize_datadoc_from_markdown(markdown_content)

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

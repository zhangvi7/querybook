from opensearchpy import OpenSearch
from langchain_community.vectorstores.opensearch_vector_search import (
    OpenSearchVectorSearch,
)

from querybook.server.lib.vector_store import get_embeddings

# Define the OpenSearch connection details
opensearch_url = "http://localhost:9200"
index_name = "vector_index_v1"

# Create an OpenSearch client
client = OpenSearch(hosts=[{"host": "localhost", "port": 9200}])

sql = "SELECT * FROM users"
embedder = get_embeddings()
vector_field = embedder.embed_query(sql)
# print("Embeddings:", vector_field)
# print("Length:", len(vector_field))

document = {
    "text": sql,
    "vector_field": vector_field,  # Convert numpy array to list
    "metadata": {"type": "sql"},
}
client.index(index="vector_index_v1", body=document)

client.indices.refresh(index="vector_index_v1")


# Define a query to retrieve all documents
query = {
    "query": {"bool": {"must": [{"match_all": {}}, {"term": {"metadata.type": "sql"}}]}}
}

# Execute the search query
response = client.search(index=index_name, body=query)
# Assuming response is a string or can be converted to a string
response_str = str(response)

# Specify the file path
file_path = "response_output.txt"

# Write the response to the file
with open(file_path, "w") as file:
    file.write(response_str)

# Optionally, print a confirmation message
print(f"Response saved to {file_path}")
# Print the retrieved documents

print(len(response["hits"]["hits"]))
for hit in response["hits"]["hits"]:
    print(hit.keys())


print("DONE")


# Create an instance of OpenSearchVectorSearch
vector_search = OpenSearchVectorSearch(
    client=client,
    index_name=index_name,
    opensearch_url=opensearch_url,
    embedding_function=get_embeddings(),
)

results = vector_search.similarity_search("SELECT *")

# print("Results:", results)


print("DONE 2")


# embedder = get_embeddings()
# x = embedder.embed_query("hello")
# print(len(x))

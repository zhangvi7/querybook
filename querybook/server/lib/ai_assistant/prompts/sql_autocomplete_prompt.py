from langchain.prompts import PromptTemplate

prompt_template = """You are a {dialect} expert. Given a partial {dialect} query, the current context, and similar past queries, provide the most relevant, syntactically correct, and contextually appropriate continuation for the query. Ensure your suggestion helps the user build a complete and functional query.

Guidelines:
1. Use the columns and tables listed in the provided table schema.
2. Use the most relevant table(s) and format the query properly before responding.
3. Respond with a valid JSON object as specified below.
4. Generate only the {dialect} code that directly follows the current partial query without overlapping or repeating existing content.

Current Partial Query:
{current_partial_query}

Similar Past Queries:
{similar_queries}

Response Format:
{{
    "suggestion": "The most relevant continuation of the query as a string fragment."
}}
"""

SQL_AUTOCOMPLETE_PROMPT = PromptTemplate.from_template(prompt_template)

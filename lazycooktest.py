import lazycook
import asyncio

# You can select any model of your choice as input along with the API key
config = lazycook.create_assistant("your-api-key", conversation_limit=9, document_limit=1, model_name="gemma-3-27b-it")

# Run CLI
asyncio.run(config.run_cli())
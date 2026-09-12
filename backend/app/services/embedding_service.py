import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from app.core.config import settings

# Initialize ChromaDB Client
chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)

# Get or create collections
internship_collection = chroma_client.get_or_create_collection(name="internships")
document_collection = chroma_client.get_or_create_collection(name="documents")

# Initialize Embedding Model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

def get_embedding(text: str) -> list[float]:
    """Generates embedding for given text"""
    # model.encode returns a numpy array, we convert to list of floats
    return embedding_model.encode(text).tolist()

def index_internship(internship_id: str, text: str, metadata: dict):
    embedding = get_embedding(text)
    internship_collection.add(
        ids=[str(internship_id)],
        embeddings=[embedding],
        metadatas=[metadata],
        documents=[text]
    )

def search_internships(query_text: str, n_results: int = 5):
    query_embedding = get_embedding(query_text)
    results = internship_collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    return results

def index_document_chunk(chunk_id: str, text: str, metadata: dict):
    embedding = get_embedding(text)
    document_collection.add(
        ids=[chunk_id],
        embeddings=[embedding],
        metadatas=[metadata],
        documents=[text]
    )

def search_documents(query_text: str, user_id: str, n_results: int = 3):
    query_embedding = get_embedding(query_text)
    results = document_collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where={"user_id": user_id} # Isolate by user
    )
    return results

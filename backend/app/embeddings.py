class LazyEmbeddingModel:
    """Load the sentence model only when an embedding operation is requested."""

    _model = None

    def _get_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        return self._model

    def encode(self, *args, **kwargs):
        return self._get_model().encode(*args, **kwargs)


model = LazyEmbeddingModel()


def generate_embedding(text):
    return model.encode(text)

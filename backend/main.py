from fastapi import FastAPI,UploadFile,File

from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import  PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from fastapi import Query
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import uuid
import shutil

load_dotenv()
app=FastAPI()

# allow react app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"    
    ],
     allow_credentials=True,#here incase login to allow for credentia
    allow_methods=["*"],#here allow all methods like get put delete post ,*=>means all methods and tokens
    allow_headers=["*"]#incae=se tokkent can pass in header like bearer token mern stack concept 
)

UPLOAD_FOLDER="uploads"
CHROMA_FOLDER="chroma_db"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CHROMA_FOLDER, exist_ok=True)

llm = ChatOpenAI(
    model="cohere/north-mini-code:free",
    api_key = os.getenv("OPENAI_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
      
)
embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


@app.get("/")
def home():
    return{
        "message":"This is rag chatbot"
    }

@app.post("/upload")
async def upload_pdf(file:UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"Error":"please upload a PDF file"}
    
    file_id = str(uuid.uuid4())

    pdf_path = os.path.join(
        UPLOAD_FOLDER,
        f"{file_id}.pdf"
    )

    with open(pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    loader = PyPDFLoader(pdf_path)

    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=200,
        chunk_overlap=50
    )

    chunks = splitter.split_documents(documents)

    vector_store = Chroma.from_documents(
        documents= chunks,
        embedding = embedding,
        persist_directory=os.path.join(
            CHROMA_FOLDER,
            file_id
        )
    )   

    return{
        "message":"PDF uploded successfully",
        "file_id":file_id,
        "chunks":len(chunks)
    }

@app.get("/chat")
def chat(
    file_id: str = Query(...),
    question: str = Query(...)
):

    chroma_path = os.path.join(
        CHROMA_FOLDER,
        file_id
    )

    vector_store = Chroma(
        persist_directory=chroma_path,
        embedding_function=embedding
    )

    retriever = vector_store.as_retriever(
        search_kwargs={"k": 4}
    )

    results = retriever.invoke(question)

    context = "\n\n".join(
        document.page_content
        for document in results
    )

    prompt = f"""
You are a helpful AI assistant.

Answer the question only using the provided context.

If the answer is not present in the context,
say "I don't know."

Context:
{context}

Question:
{question}
"""

    response = llm.invoke(prompt)

    return {
        "file_id": file_id,
        "question": question,
        "answer": response.content
    }




















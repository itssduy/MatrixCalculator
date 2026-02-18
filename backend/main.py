from fastapi import FastAPI
from pydantic import BaseModel
import psycopg
from uuid import UUID, uuid4
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

load_dotenv()

db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_port = os.getenv("DB_PORT")

class Matrix(BaseModel):
    elements: list[list[int]]

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

connectionString = f"postgresql://{db_user}:{db_pass}@localhost:{db_port}/{db_name}"

@app.get("/matrices/")
async def read_matrices():
    with psycopg.connect(connectionString) as conn: 
        with conn.cursor() as cur:
            records = cur.execute("SELECT * FROM matrix ORDER BY created_at ASC").fetchall()           
            return records

@app.get("/matrices/{matrix_id}")
async def read_matrix(matrix_id):
    with psycopg.connect(connectionString) as conn: 
        with conn.cursor() as cur:
            record = cur.execute("SELECT * FROM matrix WHERE id=%s", (matrix_id)).fetchone()
            return record

@app.post("/matrix")
async def create_matrix(matrix: Matrix):
    matrix_id = uuid4()
    with psycopg.connect(connectionString) as conn: 
        with conn.cursor() as cur:
            record = cur.execute("INSERT INTO matrix (id, elements, created_at) VALUES (%s, %s, %s) RETURNING *", (matrix_id, matrix.elements, datetime.now())).fetchone()            
            conn.commit()
            return record

@app.put("/matrix/{matrix_id}")
async def update_matrix(matrix_id: str, matrix: Matrix):
    with psycopg.connect(connectionString) as conn:
        with conn.cursor() as cur:
            record = cur.execute("UPDATE matrix SET elements=%s WHERE id=%s RETURNING *", (matrix.elements, matrix_id)).fetchone()
            conn.commit()
            return record
        
@app.delete("/matrix/{matrix_id}")
async def delete_matrix(matrix_id: str):
    with psycopg.connect(connectionString) as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM matrix WHERE id=%s", (matrix_id,))
            conn.commit()
            return {"msg": "good"}
from fastapi import FastAPI
from pydantic import BaseModel
import psycopg
from uuid import UUID, uuid4

class Matrix(BaseModel):
    elements: list[list[int]]

app = FastAPI()

connectionString = "postgresql://duy:@localhost:6432/matrix_calculator"


@app.get("/matrices/")
async def read_matrices():
    with psycopg.connect(connectionString) as conn: 
        with conn.cursor() as cur:
            records = cur.execute("SELECT * FROM matrix").fetchall()
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
            record = cur.execute("INSERT INTO matrix (id, elements) VALUES (%s, %s) RETURNING *", (matrix_id, matrix.elements)).fetchone()
            return record

@app.put("/matrix/{matrix_id}")
async def update_matrix(matrix_id: str, matrix: Matrix):
    with psycopg.connect(connectionString) as conn:
        with conn.cursor() as cur:
            record = cur.execute("UPDATE matrix SET elements=%s WHERE id=%s RETURNING *", (matrix.elements, matrix_id)).fetchone()
            return record
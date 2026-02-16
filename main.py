from fastapi import FastAPI
from pydantic import BaseModel

class matrix(BaseModel):
    rows: list[int]
    cols: list[int]

app = FastAPI()

@app.get("/matrices/")
async def read_matrices():
    return {"matrices": []}

@app.get("/matrices/{matrix_id}")
async def read_matrix(matrix_id):
    return {"matrix_id": matrix_id}

@app.post("/matrix")
async def create_matrix(matrix: Matrix):
    return {"matrix": matrix} 

@app.put("/matrix/{matrix_id}")
async def update_matrix(matrix: Matrix):
    reutnr {"matrix": matrix}

import { useState, useEffect } from "react"
import { Fragment } from "react";
const Calculator = ()=>{
    const [getMatrices, setMatrices] = useState([]);

    useEffect(()=>{
        const apiUrl = `${import.meta.env.VITE_API_URL}/matrices`;

        (async ()=>{
            const apiUrl = `${import.meta.env.VITE_API_URL}/matrices`;

            const matrices = await fetch(apiUrl, {mode: "cors"})
            const data = await matrices.json()
            setMatrices(data)
        })();
        

    }, [])

    const reloadMatrices = async ()=>{
        const apiUrl = `${import.meta.env.VITE_API_URL}/matrices`;

        const matrices = await fetch(apiUrl, {mode: "cors"})
        const data = await matrices.json()
        setMatrices(data)
    }

    const createMatrix = async (e)=>{
        e.preventDefault()
        let rows = e.target.rows.value
        let cols = e.target.cols.value
        let matrix = []
    
        for (let i = 0; i < rows; i++){
            matrix.push([])
            for (let j = 0; j < cols; j++){
                matrix[i].push(0)
            }
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/matrix`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                elements: matrix
            }) 
        })

        const data = await res.json()

        reloadMatrices()
    }
    
    const deleteMatrix = async (e, matrixId)=>{
        e.preventDefault();
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/matrix/${matrixId}`, {
            mode: "cors",
            method: "DELETE"
        })
        
        const data = await res.json()
        reloadMatrices()

    }

    const updateMatrix = async (e, matrixId) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const entries = Array.from(formData.entries());
        const entiresData = entries[entries.length - 1][0].split("-");
        const rows = parseInt(entiresData[0]) + 1
        const cols = parseInt(entiresData[1]) + 1

        let matrix = [];

        for (let i = 0; i < rows; i++) {
            matrix.push([]);

            for (let j = 0; j < cols; j++) {
                const value = formData.get(`${i}-${j}`);
                matrix[i].push(Number(value));
            }
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/matrix/${matrixId}`, {
            method: "PUT",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                elements: matrix
            }) 
        })

        const data = await res.json()
        console.log(data)
        reloadMatrices()

    }

    return (
        <>
            <h2>Add Matrix</h2>
            <form onSubmit={createMatrix}>
                <label htmlFor="rows"></label>
                <input id="rows" type="number" min="1" defaultValue="1"></input>
                <label htmlFor="cols"></label>
                <input id="cols" type="number" min="1" defaultValue="1"></input>
                <button>Add</button>
            </form>

            {getMatrices.map((matrix)=>(
                <form onSubmit={(e)=>{updateMatrix(e,matrix[0])}} key={`${matrix[0]}-f`}>
                    <table key={matrix[0]}>
                    <tbody key={`${matrix[0]}-body`}>
                        {matrix[1].map((row, i)=>(
                            <tr key={`${matrix[0]}-${i}`}>
                                {row.map((col, j)=>(
                                    <td key={`${matrix[0]}-${i}-${j}`}>
                                        <input type="number" name={`${i}-${j}`} defaultValue={col}/>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    </table>
                    <button type="submit">Edit</button>
                    <button type="button" onClick={(e)=>{deleteMatrix(e,matrix[0])}} key={`${matrix[0]}-btn`}>X</button>
                </form>
            ))}    
        </>
    )
}


export default Calculator
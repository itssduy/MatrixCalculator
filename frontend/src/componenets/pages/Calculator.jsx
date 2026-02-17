import { useState, useEffect } from "react"

const Calculator = ()=>{
    const [getMatrices, setMatrices] = useState([]);

    useEffect(()=>{
        const apiUrl = `${import.meta.env.VITE_API_URL}/matrices`;

        (async ()=>{
            const matrices = await fetch(apiUrl, {mode: "cors"})
            const data = await matrices.json()
            //console.log(data)
            setMatrices(data)
            // data.map((x)=>{
            //     console.log(x[1])
            // })
        })();
        

    }, [])

    const createMatrix = (e)=>{
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
        if(getMatrices == undefined) {
            //setMatrices([matrix])
        } else {
            //setMatrices([...getMatrices, matrix])
        }
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
                    <table key={matrix[0]}>
                    <tbody>
                        {matrix[1].map((row)=>(
                            <tr key={`${matrix[0]}-r${row}`}>
                                {row.map((col)=>(
                                    <td key={`${matrix[0]}-r${row}-${col}`}>{col}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                    </table>
                ))}    
        </>
    )
}


export default Calculator
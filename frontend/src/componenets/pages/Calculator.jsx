import { useState, useEffect } from "react";

import '../../styles/Calculator.css'
const Calculator = () => {
    const [getMatrices, setMatrices] = useState([]);
    const [operation, setOperation] = useState(null);
    const [selectedA, setSelectedA] = useState(null);
    const [selectedB, setSelectedB] = useState(null);

    useEffect(() => {
        (async () => {
            const apiUrl = `${import.meta.env.VITE_API_URL}/matrices`;
            const matrices = await fetch(apiUrl, { mode: "cors" });
            const data = await matrices.json();
            setMatrices(data);
        })();
    }, []);

    const reloadMatrices = async () => {
        const apiUrl = `${import.meta.env.VITE_API_URL}/matrices`;
        const matrices = await fetch(apiUrl, { mode: "cors" });
        const data = await matrices.json();
        setMatrices(data);
    };

    const createMatrix = async (e) => {
        e.preventDefault();
        let rows = e.target.rows.value;
        let cols = e.target.cols.value;
        let matrix = [];

        for (let i = 0; i < rows; i++) {
            matrix.push([]);
            for (let j = 0; j < cols; j++) {
                matrix[i].push(0);
            }
        }
        await fetch(`${import.meta.env.VITE_API_URL}/matrix`, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elements: matrix }),
        });
        reloadMatrices();
    };

    const deleteMatrix = async (e, matrixId) => {
        e.preventDefault();
        await fetch(`${import.meta.env.VITE_API_URL}/matrix/${matrixId}`, {
            mode: "cors",
            method: "DELETE",
        });
        if (selectedA === matrixId) setSelectedA(null);
        if (selectedB === matrixId) setSelectedB(null);
        reloadMatrices();
    };

    const updateMatrix = async (e, matrixId) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const entries = Array.from(formData.entries());
        const entriesData = entries[entries.length - 1][0].split("-");
        const rows = parseInt(entriesData[0]) + 1;
        const cols = parseInt(entriesData[1]) + 1;

        let matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix.push([]);
            for (let j = 0; j < cols; j++) {
                const value = formData.get(`${i}-${j}`);
                matrix[i].push(Number(value));
            }
        }

        await fetch(`${import.meta.env.VITE_API_URL}/matrix/${matrixId}`, {
            method: "PUT",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elements: matrix }),
        });

        reloadMatrices();
    };

    const addMatrices = (A, B) => {
        // Check dimensions
        if (
            !A || !B ||
            A.length !== B.length ||
            A.some((row, i) => row.length !== B[i].length)
        ) {
            alert("Matrices must be same dimensions to add.");
            return null;
        }

        // Add
        return A.map((row, i) =>
            row.map((val, j) =>
                Number(val) + Number(B[i][j])
            )
        );
    };


    const subtractMatrices = (A, B) => {
        if (A.length !== B.length || A[0].length !== B[0].length) {
            alert("Matrices must be same dimensions to subtract.");
            return null;
        }
        return A.map((row, i) => row.map((val, j) => val - B[i][j]));
    };

    const multiplyMatrices = (A, B) => {
        if (A[0].length !== B.length) {
            alert("Number of columns in A must equal number of rows in B.");
            return null;
        }
        const result = [];
        for (let i = 0; i < A.length; i++) {
            result.push([]);
            for (let j = 0; j < B[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < A[0].length; k++) {
                    sum += A[i][k] * B[k][j];
                }
                result[i].push(sum);
            }
        }
        return result;
    };

    const calculate = async () => {
        if (!operation) {
            alert("Please select an operation first!");
            return;
        }
        if (!selectedA) {
            alert("Please select matrix A (click a matrix to select it).");
            return;
        }

        const matrixA = getMatrices.find((m) => m[0] === selectedA);
        const matrixB = getMatrices.find((m) => m[0] === selectedB);

        const A = matrixA?.[1];
        const B = matrixB?.[1];

        if (!A) {
            alert("Matrix A not found.");
            return;
        }

        let result;

        switch (operation) {
            case "add":
                if (!B) return alert("Please select matrix B to add.");
                result = addMatrices(A, B);
                break;
            case "subtract":
                if (!B) return alert("Please select matrix B to subtract.");
                result = subtractMatrices(A, B);
                break;
            case "multiply":
                if (!B) return alert("Please select matrix B to multiply.");
                result = multiplyMatrices(A, B);
                break;
            default:
                return;
        }

        if (!result) return;

        await fetch(`${import.meta.env.VITE_API_URL}/matrix`, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ elements: result }),
        });

        reloadMatrices();
        setOperation(null);
        setSelectedA(null);
        setSelectedB(null);
    };

    // Click a matrix card to assign it as A, then B
    const handleSelectMatrix = (matrixId) => {

        if (selectedA === matrixId) {
            setSelectedA(null);
            return;
        }
        if (selectedB === matrixId) {
            setSelectedB(null);
            return;
        }
        if (!selectedA) {
            setSelectedA(matrixId);
        } else {
            setSelectedB(matrixId);
        }
    };

    return (
        <>
            <h2>Add Matrix</h2>
            <form onSubmit={createMatrix}>
                <label htmlFor="rows">Rows: </label>
                <input id="rows" type="number" min="1" defaultValue="2" />
                <label htmlFor="cols"> Cols: </label>
                <input id="cols" type="number" min="1" defaultValue="2" />
                <button>Add</button>
            </form>

            <hr />

            <p>
                <strong>Click a matrix</strong> to select it as A (blue), click another for B (red).
                Then pick an operation and press =.
            </p>
            <p>
                A = {selectedA ?? "none"} &nbsp;|&nbsp;
                B = {selectedB ?? "none"} &nbsp;|&nbsp;
                Op = {operation ?? "none"}
            </p>

            <ul style={{ listStyle: "none", display: "flex", gap: 8, padding: 0 }}>
                <li>
                    <button
                        type="button"
                        style={{ fontWeight: operation === "add" ? "bold" : "normal" }}
                        onClick={() => setOperation("add")}
                    >
                        +
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        style={{ fontWeight: operation === "subtract" ? "bold" : "normal" }}
                        onClick={() => setOperation("subtract")}
                    >
                        −
                    </button>
                </li>
                <li>
                    <button
                        type="button"
                        style={{ fontWeight: operation === "multiply" ? "bold" : "normal" }}
                        onClick={() => setOperation("multiply")}
                    >
                        ×
                    </button>
                </li>
                <li>
                    <button type="button" onClick={calculate}>
                        =
                    </button>
                </li>
            </ul>


            <hr />

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                {getMatrices.map((matrix) => (
                    <div
                        key={`${matrix[0]}-wrapper`}
                        onClick={() => handleSelectMatrix(matrix[0])}
                        className={`matrix ${selectedA == matrix[0] ? "matrixA" : selectedB == matrix[0] ? "matrixB" : "none"}`}
                    >
                        <form
                            onSubmit={(e) => {
                                e.stopPropagation();
                                updateMatrix(e, matrix[0]);
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <table>
                                <tbody>
                                    {matrix[1].map((row, i) => (
                                        <tr key={`${matrix[0]}-${i}`}>
                                            {row.map((col, j) => (
                                                <td key={`${matrix[0]}-${i}-${j}`}>
                                                    <input
                                                        type="number"
                                                        name={`${i}-${j}`}
                                                        defaultValue={col}
                                                        style={{ width: 50 }}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                                <button type="submit">Save</button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteMatrix(e, matrix[0]);
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </form>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Calculator;
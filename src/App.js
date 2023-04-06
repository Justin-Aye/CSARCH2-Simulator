import React from "react";
import { useState } from "react";

export default function App() {
    const [dividend, setDividend] = useState("")
    const [divisor, setDivisor] = useState("")
    const [negDivisor, setNegDivisor] = useState("")
    const [ init_A, setInit_A] = useState("")

    const [steps, setSteps] = useState([])
    const [isBin, setBin] = useState(true)

    const [ viewSteps, setViewSteps ] = useState()
    const [answer, setAnswer] = useState()

    function ifBinary() {
        for (let i = 0; i < dividend.length; i++) {
            if (dividend[i] !== "1" && dividend[i] !== "0") {
                setBin(false);
                return false
            }
        }
        setBin(true);
        return true
    }

    function restorativeDivision() {
        setSteps([])
        var A = []
        for (let i = 0; i < dividend.length + 1; i++) 
            A.push("0")

        A = A.join("")
        setInit_A(A)

        var Q = dividend;
        var M_pos = divisor;
        var M_neg = negateBin(M_pos, A.length)
        setNegDivisor(M_neg)

        for (let n = 0; n < dividend.length; n++) {

            let step = {}
            step.initial_A = A
            step.initial_Q = Q

            //SHIFT
            let split_A = A.split("");
            split_A.shift();
            split_A.push(Q.charAt(0));
            A = split_A.join("");

            let split_Q = Q.split("");
            split_Q.shift();

            step.shifted_A = A
            step.shifted_Q = split_Q.join("") + "_"

            //SUBTRACT
            A = binAddition(A, M_neg);
            step.A_sub_M = A


            //If negative, add M
            if (A.charAt(0) === "1") {
                A = binAddition(A, M_pos);
                split_Q.push("0");
            } else {
                split_Q.push("1");
            }
            Q = split_Q.join("");

            step.final_A = A
            step.final_Q = Q

            // Add to steps
            setSteps((steps) => [...steps, step]);
        }

        setViewSteps(false)
        setAnswer({remainder: parseInt(A, 2), quotient: parseInt(Q, 2)})
    }

    function negateBin(string, size) {
        var temp = "";

        while(string.length < size){
            let temp = string.split("")
            temp.unshift("0")
            string = temp.join("")
        }

        let i = string.length - 1;
        while (i >= 0) {
            if (string[i] === "1") {
                temp = string[i--] + temp;

                while (i >= 0) {
                    if (string[i--] === "1") temp = "0" + temp;
                    else temp = "1" + temp;
                }
            } else temp = string[i--] + temp;
        }
        return temp;
    }

    function binAddition(binary_1, binary_2) {
        let i = binary_1.length - 1;
        let j = binary_2.length - 1;

        let carry = 0;
        let sum = 0;
        let result = "";

        while (i >= 0 || j >= 0 || carry === 1) {
            sum = carry;

            if (i >= 0)
                sum =
                    sum + binary_1.charAt(i).charCodeAt(0) - "0".charCodeAt(0);

            if (j >= 0)
                sum =
                    sum + binary_2.charAt(j).charCodeAt(0) - "0".charCodeAt(0);

            let temp = (sum % 2) + "0".charCodeAt(0);

            result = String.fromCharCode(temp) + result;

            carry = sum / 2;
            i--;
            j--;
        }

        while (result.length < binary_1.length) {
            let temp = result.split("");
            temp.unshift(result.charAt(0));
            result = temp.join("");
        }

        while (result.length > binary_1.length) {
            let temp = result.split("");
            temp.shift();
            result = temp.join("");
        }

        return result;
    }

    return (
        <div className="flex flex-col p-10 font-mono h-[100vh] bg-slate-100 overflow-auto">
            <p className="text-[40px] text-center mb-10">
                Unsigned Binary Division (Restoring Method)
            </p>

            <div className="flex gap-10">

                <div className="w-1/2 rounded-xl shadow-lg p-10 bg-white">
                    {!isBin && (
                        <p className="text-red-400 mb-5">Either Divisor or Dividend is not in binary format</p>
                    )}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if(ifBinary())
                                restorativeDivision();
                        }}
                        className="flex flex-col"
                    >
                        <label htmlFor="input" className="mb-2 font-bold">
                            Enter Dividend
                        </label>
                        <input
                            type="text"
                            placeholder="Dividend..."
                            className="w-full border border-black py-2 px-5 mb-5 rounded-xl"
                            name="input"
                            onChange={(e) => setDividend(e.target.value)}
                        />

                        <label htmlFor="input" className="mb-2 font-bold">
                            Enter Divisor
                        </label>
                        <input
                            type="text"
                            placeholder="Divisor..."
                            className="w-full border border-black py-2 px-5 mb-5 rounded-xl"
                            name="input"
                            onChange={(e) => setDivisor(e.target.value)}
                        />
                        <button
                            className="border border-black w-1/4 px-5 rounded-xl hover:transition duration-500 hover:bg-gray-200"
                            type="submit"
                        >
                            Submit
                        </button>
                    </form>
                </div>

                <p className="bg-white"></p>

                <div className={`flex flex-col w-1/2 rounded-xl shadow-lg p-10 bg-white h-fit ${steps.length > 0 ? 'visible' : 'invisible' }`}>
                    {
                        !viewSteps && steps.length > 0 &&
                        <>
                            <button
                                className="border border-black w-1/4 px-5 rounded-lg hover:transition duration-500 hover:bg-gray-200"
                                onClick={() => setViewSteps(!viewSteps) }
                            >
                                View Steps
                            </button>
                        </>
                    }

                    {
                        steps.length > 0 && viewSteps && answer &&
                        <>
                            <p className="font-bold mb-5">STEPS:</p>
                            <p className="font-bold">Initialize:</p>
                            <div className="flex flex-col mb-10">
                                <p>A: {init_A}, Q: {dividend}</p>
                                <p>M: {divisor}, -M: {negDivisor}</p>
                            </div>
                            
                            {
                                steps.map((val, index) => {
                                    return (
                                        <div key={index} className="flex flex-col mb-5">
                                            <p className="font-bold">{index === steps.length - 1 ? "Final Iteration" : "Iteration"
                                            
                                            } {index + 1}</p>

                                            <div className="flex flex-col ml-5">
                                                <p>A: {val.initial_A}, Q: {val.initial_Q}</p>
                                                <p>Shifted A: {val.shifted_A}, Shifted Q: {val.shifted_Q}</p>
                                                <p>A - M: {val.A_sub_M}</p>
                                                <p>Final A: { val.final_A }, Final Q: { val.final_Q }</p>
                                            </div>

                                        </div>
                                    );
                                })
                            }
                            
                            <p className="font-bold">Question: {parseInt(dividend,2)}/{parseInt(divisor,2)}</p>
                            <p className="font-bold mb-5">Quotient: {answer.quotient}, Remainder: {answer.remainder}</p>

                            <div className="flex gap-5">
                                <button 
                                    className="border border-black w-1/4 px-5 rounded-lg hover:transition duration-500 hover:bg-gray-200"
                                    onClick={() => {
                                        setSteps([])
                                        setViewSteps(false)
                                    }}
                                >
                                    Clear
                                </button>

                                <button 
                                    className="border border-black w-1/4 px-5 rounded-lg hover:transition duration-500 hover:bg-gray-200"
                                    onClick={() => {
                                        setViewSteps(false)
                                    }}
                                >
                                    Hide Steps
                                </button>
                            </div>
                            
                        </> 
                    }
                </div>
            </div>
        </div>
    );
}

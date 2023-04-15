import React, { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function App() {
    const [submitted, setSubmitted] = useState({});
    useEffect(()=>{
        console.log("submitted",submitted);
    },[submitted]);
    
    const [steps, setSteps] = useState(Array(0));
    useEffect(()=>{
        console.log("steps",steps);
    },[steps]);

    const [numStep, setNumStep] = useState(1);
    useEffect(()=>{
        console.log("numStep", numStep);
    },[numStep]);

    const [ viewSteps, setViewSteps ] = useState(false);
    const handleViewSteps = (boolean) => {
        setViewSteps(boolean);
        setNumStep(1);
    }
    const [answer, setAnswer] = useState();
    const [initialized, setInitializations] = useState({});

    const {
		register,
		watch,
        clearErrors,
        resetField,
		handleSubmit,
		formState: { errors },
	} = useForm({
        defaultValues: {
            dataType: "decimal",
            dividend: "",
            divisor:""
        },
        criteriaMode: "all"
    });


    const handleError = (errors, e) => {
        console.log(errors);
    }

    const handleSave = (data, e) => {
        e.preventDefault();
        if(data.dataType === "decimal"){
            data.dividend = parseInt(data.dividend).toString(2);
            data.divisor = parseInt(data.divisor).toString(2);
        }

        setSubmitted(data);
        setSteps([]);
        
        //initialize Q, M, and -M
        var Q = data.dividend;
        var M_pos = data.divisor;

        //sign extend operand with lesser bits
        if(Q.length > M_pos.length)
            M_pos = Array((Q.length - M_pos.length) + 1).join('0') + M_pos;
        else if (Q.length < M_pos.length)
            Q = Array((M_pos.length - Q.length) + 1).join('0') + Q;

        //sign extend if MSb value of Q or M is 1
        M_pos = (M_pos.charAt(0) === "1") ? "0" + M_pos: M_pos;

        //initialize A
        var A = []
        for (let i = 0; i < Q.length + 1; i++) 
            A.push("0")

        A = A.join("") //make A array into string

        //sign extend to match A
        if(A.length > M_pos.length)
            M_pos = Array((A.length - M_pos.length) + 1).join('0') + M_pos;

        var M_neg = negateBin(M_pos, A.length)


        setInitializations({
            A: A,
            M_neg: M_neg,
            M: M_pos,
            Q: Q,
            Q_0: "0"
        })

        //actual iteration
        for (let n = 0; n < Q.length; n++) {

            /* 
            step includes:
                initial_A: string --> A to shift --> display on get values 
                initial_Q: string --> Q to Shift --> display on get values  
                shifted_A: string --> shifted A --> display on shift 
                shifted_Q: string --> shifted Q --> display on shift, A <- A-M
                final_A: string --> (A+M) if A_sub_M==1 --> display on condition command
                final_Q: string --> value with pushed "0" or 1 --> display on condition command
                A_sub_M: string --> string value of (A-M)   --> display on A <- A-M
                Q_0: string --> string value of Q_0 --> display on condition command
            */

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
                step.Q_0 = "0";
            } else step.Q_0 = "1";

            split_Q.push(step.Q_0);
            Q = split_Q.join("");

            step.final_A = A
            step.final_Q = Q

            console.log(step);
            // Add to steps
            setSteps((steps) => [...steps, step]);
        }

        handleViewSteps(true);
        setAnswer({remainder: parseInt(A, 2), quotient: parseInt(Q, 2)});
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

    const downloadSolution = () => {
        console.log("Downloading file...")

        // text content
        var text="Restoring Unsigned Division Simulator\n=====================================\n\n"
        if(submitted.dataType === "decimal") 
            text+="Decimal input\nDividend: "+parseInt(submitted.dividend,2)+"\nDivisor : "+parseInt(submitted.divisor,2)+"\n\n"
        else text+="Binary input\nDividend: "+submitted.dividend+"\nDivisor : "+submitted.divisor+"\n\n"

        text+="Initializations:\nA : "+initialized.A+"\nQ : "+initialized.Q+"\nM : "+initialized.M+"\n-M: "+initialized.M_neg+"\nQ₀: 0\n\n"
        if (steps[0].Q_0 === '0')
            console.log("q0 = 0, yes")
        else console.log("q0 = 1, no")
        
        let n = ((steps.length+2)/2)+1 
        text+="  Iteration  |         Command         |"+" ".repeat(n)+"A"+" ".repeat(n)+"|"+" ".repeat(n)+"Q"+" ".repeat(n)+"|  Q₀  \n"
        text+="-------------|-------------------------|"+"-".repeat(n)+"-"+"-".repeat(n)+"|"+"-".repeat(n)+"-"+"-".repeat(n)+"|------\n"

       // STEPS
        for (let i = 0; i < steps.length; i++){
            // Get Values
            text += "     "
            if (i<9) text+=" "
            text+=i+1+"      |        Get Values       |"
            if (steps.length%2===0) text+="  " //if length is even
            else text+=" "
            text+=steps[i].initial_A+"  |  "+steps[i].initial_Q
            if (steps.length%2===1) text+="  " //if length is odd
            else text+="   "
            text+="|   "
            // Shift
            text+="\n             |          Shift          |"
            if (steps.length%2===0) text+="  " //if length is even
            else text+=" "
            text+=steps[i].shifted_A+"  |  "+steps[i].shifted_Q
            if (steps.length%2===1) text+="  " //if length is odd
            else text+="   "
            text+="|"
            // A ← A - M
            text+="\n             |        A ← A - M        |"
            if (steps.length%2===0) text+="  " //if length is even
            else text+=" "
            text+=steps[i].A_sub_M+"  |  "+steps[i].shifted_Q
            if (steps.length%2===1) text+="  " //if length is odd
            else text+="   "
            text+="|"
            // Is MSb of A == 1 ? Yes/No,
            text+="\n             | Is MSb of A == 1 ? "
            if (steps[i].Q_0 === '0') text+="Yes, |"
            else text+="No.  |"
            if (steps.length%2===0) text+="  " //if length is even
            else text+=" "
            text+=steps[i].final_A+"  |  "+steps[i].final_Q
            if (steps.length%2===1) text+="  " //if length is odd
            else text+="   "
            text+="|  "+steps[i].Q_0
            if (steps[i].Q_0 === '0') text+="\n             |        A ← A + M        |"+" ".repeat(n)+" "+" ".repeat(n)+"|"+" ".repeat(n)+" "+" ".repeat(n)+"|"
            text+="\n-------------|-------------------------|"+"-".repeat(n)+"-"+"-".repeat(n)+"|"+"-".repeat(n)+"-"+"-".repeat(n)+"|------\n"
        }
        
        text+="\nQuotient : "+answer.quotient+"\nRemainder: "+answer.remainder

       // file object
        const file = new Blob([text], {type: 'text/plain'});
    
       // anchor link
        const element = document.createElement("a");
        element.href = URL.createObjectURL(file);
        if(submitted.dataType === "decimal") 
            element.download = parseInt(submitted.dividend,2) + "_" + parseInt(submitted.divisor,2) + ".txt"; 
        else element.download = submitted.dividend + "_" + submitted.divisor + ".txt"; 
    
        // simulate link click
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
    }

    return (
        <>
        <div className="p-3 font-mont lg:p-5">

            {/*Header*/}
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="flex flex-row items-center">
                    <p className="text-5xl">group<span className="font-bold">six</span></p>
                    <div className="ml-2 grid grid-row-4 text-[11px] lg:text-xs">
                        <p>Ayuyao, Justin</p>
                        <p>Fausto, Lorane Bernadeth</p>
                        <p>Nadela, Cymon Radjh</p>
                        <p>Oliva, Irah Faye</p>
                    </div>
                </div>
                <div className="flex items-center justify-center md:justify-end">
                <p className="mt-5 text-xl text-center md:text-end md:text-3xl md:m-0 font-bold">Restoring Unsigned Division Simulator</p>
                </div>
            </div>

            {/*Body*/}
            <div className="mt-5 w-full grid grid-cols-1 space-y-5 lg:flex lg:flex-row lg:space-x-5 lg:space-y-0">
                <div  className="lg:w-2/5">
                    <form onSubmit={handleSubmit(handleSave, handleError)}>
                        <div className="border border-gray-300 text-md md:text-lg shadow rounded-md p-3 lg:p-5">
                            <p className="italic font-semibold text-green-800">What is the data type of your inputs?</p>
                            <div className="mt-2 flex flex-row space-x-10">
                                <div className="flex items-center">
                                    <input id="decimal" className="accent-green-600" type="radio" value="decimal" {...register("dataType", {required: true, onChange: () => {clearErrors(["dividend", "divisor"]); handleViewSteps(false);}})}
                                        onClick={()=>{resetField("dividend", {keepError: false}); resetField("divisor", {keepError: false})}}
                                    />
                                    <label for="decimal" className="ml-2">Decimal</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="binary" name="dataType" className="accent-green-600" type="radio" value="binary" {...register("dataType", {required: true, onChange: () => {clearErrors(["dividend", "divisor"]); handleViewSteps(false);}})}
                                        onClick={()=>{resetField("dividend", {keepError: false}); resetField("divisor", {keepError: false})}}
                                    />
                                    <label for="binary" className="ml-2">Binary</label>
                                </div>
                            </div>

                            {errors.dataType?.type === "required" && (<div className="mb-2 text-sm font-medium text-left text-red-500">Error: Please select a data type.</div>)}

                            <p className="mt-5 italic font-semibold text-green-800">Please enter your inputs:</p>
                            <div className="w-full mt-3 flex justify-center items-center">
                                <div className="">
                                    <input type="text" placeholder="unsigned dividend" className="text-xl text-center font-mono font-semibold focus: outline-none placeholder:italic placeholder:font-normal"
                                        {...register("dividend", {required: true, 
                                            pattern: watch("dataType") === "binary" ? new RegExp("^[0-1]{1,}$") : new RegExp("^[0-9]*$"),
                                            validate: {
                                                greater: (value) =>  parseInt("0"+value, (watch("dataType") === "decimal" ? 10:2) ) >= 0,
                                                lesser: (value) =>  parseInt("0"+value, (watch("dataType") === "decimal" ? 10:2) ) < 65536
                                            },
                                            onChange: () => {handleViewSteps(false);}
                                        })}
                                        />
                                    <hr className="border border-gray-400"/>
                                    <input type="text" placeholder="unsigned divisor" className="text-xl text-center font-mono font-semibold focus: outline-none placeholder:italic placeholder:font-normal"
                                        {...register("divisor", {required: true, 
                                            pattern: watch("dataType") === "binary" ? new RegExp("^[0-1]{1,}$") : new RegExp("^[0-9]*$"),
                                            validate: {
                                                greater: (value) =>  parseInt("0"+value, (watch("dataType") === "decimal" ? 10:2) ) > 0,
                                                lesser: (value) =>  parseInt("0"+value, (watch("dataType") === "decimal" ? 10:2) ) < 65536
                                            },
                                            onChange: () => {handleViewSteps(false);}
                                        })}/>
                                </div>
                            </div>

                            {(errors != null) && (<>
                                <div className="mt-2">
                                    {/*Errors for Dividend*/}
                                    {errors.dividend?.type === "required" && (<div className="text-md md:text-lg font-medium text-left text-red-500">Error: Please input a Dividend.</div>)}
                                    {errors.dividend?.type === "pattern" && (<div className="text-md md:text-lg font-medium text-left text-red-500">Error: Wrong input for data type in Dividend.</div>)}
                                    {errors.dividend?.type === "greater" && (<div className="text-md md:text-lg font-medium text-left text-red-500">Error: Your dividend must be greater than or equal to {watch("dataType") === "decimal" ? "0": "0x00000 (in bits)"}.</div>)}
                                    {errors.dividend?.type === "lesser" && (<div className="text-md md:text-lg font-medium text-left text-red-500">Error: Your dividend must be less than {watch("dataType") === "decimal" ? "65536": "0x10000 (in bits)"}.</div>)}

                                    {/*Errors for Divisor*/}
                                    {errors.divisor?.type === "required" && (<div className="text-md md:text-lg font-medium text-left text-red-500">Error: Please input a Divisor.</div>)}
                                    {errors.divisor?.type === "pattern" && (<div className="text-md md:text-lg font-medium text-left text-red-500">Error: Wrong input for data type in Divisor.</div>)}
                                    {errors.divisor?.type === "greater" && (<div className="text-md md:text-lg font-medium text-left text-red-500">Error: Your divisor must be greater than {watch("dataType") === "decimal" ? "0": "0x00000 (in bits)"}.</div>)}
                                    {errors.divisor?.type === "lesser" && (<div className="text-md md:text-lg font-medium text-left text-red-500">Error: Your divisor must be less than {watch("dataType") === "decimal" ? "65536": "0x10000 (in bits)"}.</div>)}
                                </div>
                            </>)}

                            <button 
                                type="submit"
                                className="mt-10 py-3 w-full text-center text-white text-xl font-semibold bg-emerald-700 border rounded-lg hover:bg-emerald-600"
                            >
                                Calculate
                            </button>

                            {viewSteps && 
                                <button 
                                    type="button"
                                    id="exportBtn"
                                    onClick={downloadSolution}
                                    className="mt-2 py-3 w-full text-center text-white text-xl font-semibold bg-sky-900 border rounded-lg hover:bg-sky-700"
                                >
                                    Download Solution
                                </button>
                            }
                            
                        </div>
                    </form>
                </div>
                
                {
                    viewSteps && (<>
                        <div className="w-full lg:w-3/5">
                            <div className="border border-gray-300 text-md md:text-lg shadow rounded-md p-3 lg:p-5">
                                <p className="w-full text-center font-bold text-xl lg:text-2xl">Steps to Achieve Your Answer</p>
                                
                                {/*Initializations*/}
                                <div className="flex flex-col">
                                    <div className="my-5 flex flex-row place-items-start space-x-4">
                                        <p className="font-bold text-lg lg:text-xl">Initializations:</p>
                                        
                                        <div className="flex flex-row space-x-10 self-center">
                                            <div className="flex flex-col text-end">
                                                <p className="font-mont font-bold">Q:</p>
                                                <p className="font-mont font-bold">M:</p>
                                                <p className="font-mont font-bold">-M:</p>
                                                <p className="font-mont font-bold">A:</p>
                                                <p className="font-mont font-bold">Q<sub>0</sub>:</p>
                                            </div>

                                            <div className="flex flex-col text-start">
                                                <p className="font-mono">{initialized.Q}</p>
                                                <p className="font-mono">{initialized.M}</p>
                                                <p className="font-mono">{initialized.M_neg}</p>
                                                <p className="font-mono">{initialized.A}</p>
                                                <p className="font-mono">{initialized.Q_0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                

                                

                                <div className="mt-5 w-full grid grid-cols-5 gap-2 text-center break-all"> 
                                    {/*Header*/}
                                    <p className="text-xl font-bold">Iteration</p>
                                    <p className="text-xl font-bold">Command</p>
                                    <p className="text-xl font-bold">A</p>
                                    <p className="text-xl font-bold">Q</p>
                                    <p className="text-xl font-bold">Q<sub>0</sub></p>

                                    {
                                        steps.slice(0, numStep).map((item, index) => {
                                            return (<>
                                                {/*Iteration*/}
                                                <div class="row-span-4 font-bold">{index + 1}</div>
                                                    
                                                {/*Get Values Row*/}
                                                <div class="">Get Values</div>
                                                <div class="font-mono">{item.initial_A}</div>
                                                <div class="font-mono">{item.initial_Q}</div>
                                                <div></div>

                                                {/*Shift Row*/}
                                                <div class="">Shift</div>
                                                <div class="font-mono">{item.shifted_A}</div>
                                                <div class="font-mono">{item.shifted_Q}</div>
                                                <div></div>

                                                {/*A ← A - M Row*/}
                                                <div class="">A ← A - M</div>
                                                <div class="font-mono">{item.A_sub_M}</div>
                                                <div class="font-mono">{item.shifted_Q}</div>
                                                <div></div>

                                                {/*Condition Row*/}
                                                <div class="mb-4">
                                                    <p>Is MSb of A == 1 ? {(item.Q_0 === "0") ? "Yes, ":"No."}</p>
                                                    {(item.Q_0 === "0") && <p>A ← A + M</p>}
                                                </div>
                                                <div class="mb-4 font-mono">{item.final_A}</div>
                                                <div class="mb-4 font-mono">{item.final_Q}</div>
                                                <div class="mb-4 font-mono">{item.Q_0}</div>
                                            </>)
                                        })
                                    }
                                </div>
            
                                <div className="grid grid-cols-2 w-full mt-5 italic">
                                    {(numStep > 1) ?  
                                        (<div className="flex justify-start">
                                            <button 
                                                className="text-sky-600 text-sm font-semibold underline hover:text-sky-800"
                                                onClick={()=>{setNumStep(numStep - 1)}}
                                                
                                            >Hide Previous Step...</button>
                                        </div>): (<div> </div>)
                                    }

                                    {(numStep < steps.length) &&
                                        <div className="flex justify-end">
                                            <button 
                                                className="text-sky-600 text-sm font-semibold underline hover:text-sky-800"
                                                onClick={()=>{setNumStep(numStep + 1)}}
                                                
                                            >Show Next Step...</button>
                                        </div>
                                    }   
                                </div> 

                                <div className="mt-8 space-y-2">
                                    {(numStep < steps.length) && 
                                        <button 
                                            type="button"
                                            className="py-3 w-full text-center text-white text-xl font-semibold bg-emerald-700 border rounded-lg hover:bg-emerald-600"
                                            onClick={()=>{setNumStep(steps.length + 1)}}
                                        >
                                            Show All Steps
                                        </button>
                                    }

                                    {(numStep > 1) && 
                                        <button 
                                            type="button"
                                            className="py-3 w-full text-center text-white text-xl font-semibold bg-rose-900 border rounded-lg hover:bg-rose-700"
                                            onClick={()=>{setNumStep(1)}}
                                        >
                                            Hide All Steps
                                        </button>
                                    
                                    }
                                </div>
                                
                                <hr className="mt-5"/>
                                <div className="mt-10 grid grid-rows-2 grid-flow-col px-5 ">
                                    <p className="font-bold text-xl">Quotient</p>
                                    <p className="font-bold text-xl">Remainder</p>

                                    <p className="font-bold text-xl text-end font-mono">{answer.quotient}</p>
                                    <p className="font-bold text-xl text-end font-mono">{answer.remainder}</p>
                                </div>
                            </div>
                        </div>       
                    </>)
                }
                
                
                
            </div>
        </div> 
        </>
               
   
        
    );
}


/**
 * 
 * <div className="flex flex-col p-10 font-mono h-[100vh] bg-slate-100 overflow-auto">
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
 */
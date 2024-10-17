import React, { useState } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { loginUser } from "../Hooks/customHooks"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify styles


export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errEmail, setErrEmail] = useState("");
    const [errPassword, setErrPassword] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const handleEmail = (e) => {
        setEmail(e.target.value);
        setErrEmail("");
    };
    const handlePassword = (e) => {
        setPassword(e.target.value);
        setErrPassword("");
    };
    const handleSignUp =  async(e) => {
        e.preventDefault();

        if (!email) {
            setErrEmail("Enter your email");
        }

        if (!password) {
            setErrPassword("Enter your password");
        }
        if (email && password) {

            const data = await loginUser({email, password})

            if (data.success) {
                toast.success("Login Succesfully")
                localStorage.setItem("token", data.token)

                navigate('/')
            }
            else{
                toast.error("Credentials Failed")
            }
           
        }
    };
    return (
        <div className="w-full  h-[85vh] lg:h-screen flex items-center justify-center">
            <div className="w-1/2 hidden lg:inline-flex h-full bg-black text-white">
                <div className="w-[450px] h-full bg-primeColor py-6 px-10 flex flex-col gap-6 justify-center">
                    <div className="flex flex-col gap-1 -mt-1">
                        <h1 className="font-titleFont text-xl font-medium">
                            Stay sign in for more
                        </h1>
                        <p className="text-base">When you sign in, you are with us!</p>
                    </div>
                    <div className="w-[300px] flex items-start gap-3">
                        <span className="text-green-500 mt-1">
                            <BsCheckCircleFill />
                        </span>
                        <p className="text-base text-gray-300">
                            <span className="text-white font-semibold font-titleFont">
                                Lorem ipsum dolor sit, amet consectetur adipisicing.
                            </span>
                            <br />
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Omnis perferendis voluptate quos ipsam neque reprehenderit provident porro nam incidunt eius?
                        </p>
                    </div>
                    <div className="w-[300px] flex items-start gap-3">
                        <span className="text-green-500 mt-1">
                            <BsCheckCircleFill />
                        </span>
                        <p className="text-base text-gray-300">
                            <span className="text-white font-semibold font-titleFont">
                                Lorem ipsum dolor sit amet.
                            </span>
                            <br />
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum doloremque minus quas nesciunt, itaque sunt qui voluptas doloribus. Tempora aliquam eligendi voluptatum excepturi libero accusantium, amet repellat pariatur maiores quibusdam?
                        </p>
                    </div>

                </div>
            </div>
            <div className="w-full lgl:w-1/2 h-full">
                {successMsg ? (
                    <div className="w-[80%] lg:w-full h-full flex flex-col justify-center items-center lg:px-16">
                        <p className="w-full px-4 py-10 text-green-500 font-medium font-titleFont">
                            {successMsg}
                        </p>
                        <button
                            className="w-full h-10 bg-[#262626] text-gray-200 rounded-md text-base font-titleFont font-semibold px-3
             tracking-wide hover:bg-black hover:text-white duration-300"
                        >
                            Check Your MailBox
                        </button>
                    </div>
                ) : (
                    <>
                        <form className="w-full flex-col lgl:w-[450px] h-screen flex items-center justify-center">

                            <div className="px-6 py-4 w-full h-[85%] flex flex-col justify-center items-center">
                                <h1 className="font-titleFont underline underline-offset-4 decoration-[1px] font-semibold text-3xl mdl:text-4xl mb-4">
                                    Sign in
                                </h1>
                                <div className="flex w-[80%] flex-col gap-3">
                                    <div className="flex flex-col gap-.5">
                                        <p className="font-titleFont text-base font-semibold text-gray-600">
                                            Email
                                        </p>
                                        <input
                                            onChange={handleEmail}
                                            value={email}
                                            className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                                            type="email"
                                            placeholder="john@mail.com"
                                        />
                                        {errEmail && (
                                            <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                                                <span className="font-bold italic mr-1">!</span>
                                                {errEmail}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div className="flex flex-col gap-.5">
                                        <p className="font-titleFont text-base font-semibold text-gray-600">
                                            Password
                                        </p>
                                        <input
                                            onChange={handlePassword}
                                            value={password}
                                            className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                                            type="password"
                                            placeholder="Enter password"
                                        />
                                        {errPassword && (
                                            <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                                                <span className="font-bold italic mr-1">!</span>
                                                {errPassword}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleSignUp}
                                        className="bg-[#262626] hover:bg-black text-gray-200 hover:text-white cursor-pointer w-full text-base font-medium h-10 rounded-md  duration-300"
                                    >
                                        Sign In
                                    </button>
                                    <p className="text-sm text-center font-titleFont font-medium">
                                        Don't have an Account?{" "}
                                        <Link to="/signup">
                                            <span className="hover:text-blue-600 duration-300">
                                                Sign up
                                            </span>
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </form>
                    </>

                )}
            </div>
        </div>
    );
};


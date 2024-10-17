import React, { useState } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { Link } from "react-router-dom";
import { SignupUser } from "../Hooks/customHooks";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Import react-toastify styles



export default function Signup() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errEmail, setErrEmail] = useState("");
    const [errName, setErrName] = useState("");
    const [errPassword, setErrPassword] = useState("");
    const [errConfirmPassword, setErrConfirmPassword] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleEmail = (e) => {
        setEmail(e.target.value);
        setErrEmail("");
    };

    const handleName = (e) => {
        setName(e.target.value);
        setErrName("");
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
        setErrPassword("");
    };

    const handleConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
        setErrConfirmPassword("");
    };

    const handleSignUp = async(e) => {
        e.preventDefault();

        // Validation
        if (!email) setErrEmail("Enter your email");
        if (!name) setErrName("Enter your name");
        if (!password) setErrPassword("Create a password");
        if (!confirmPassword) setErrConfirmPassword("Confirm your password");

        if (password !== confirmPassword) {
            setErrConfirmPassword("Passwords do not match");
        }


        if (email && name && password && password === confirmPassword) {
            const response = await SignupUser({email, name, password, role:'teamMember'})

            if(response.success){
                setSuccessMsg(
                    `Thank you for signing up, ${name}. We are processing your registration and will send further instructions to ${email}.`
                );
                setEmail("");
                setName("");
                setPassword("");
                setConfirmPassword("");
            }
            else{
                toast.error('Signup failed. Please try again.'); // Error toast
            }
        }
    };

    return (
        <div className="w-full h-[85vh] lg:h-screen flex items-center justify-center">
            <div className="w-1/2 hidden lg:inline-flex h-full bg-black text-white">
                <div className="w-[450px] h-full bg-primeColor py-6 px-10 flex flex-col gap-6 justify-center">
                    {/* Left side content */}
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
                                Lorem ipsum dolor sit amet consectetur adipisicing.
                            </span>
                            <br />
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis, voluptate accusantium assumenda minus commodi molestias. Voluptatibus ab dolorum facilis! Debitis quam consequuntur sapiente nam molestiae eligendi ex reiciendis eius cumque.
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
                           Lorem ipsum dolor sit, amet consectetur adipisicing elit. Delectus numquam consectetur distinctio recusandae odio ullam libero dolor accusamus ratione sed.
                        </p>
                    </div>
                </div>
            </div>

            <div className="w-full lgl:w-1/2 h-full">
                {successMsg ? (
                    <div className="w-full lg:w-full h-full flex flex-col justify-center lg:px-16">
                        <p className="w-full px-4 py-10 text-green-500 font-medium font-titleFont">
                            {successMsg}
                        </p>
                        <Link to="/signup">
                            <button
                                className="w-full h-10 bg-[#262626] text-gray-200 rounded-md text-base font-titleFont font-semibold 
             tracking-wide hover:bg-black hover:text-white duration-300"
                            >
                                Check Your MailBox
                            </button>
                        </Link>
                    </div>
                ) : (
                    <form className="w-full flex-col lgl:w-[450px] h-screen flex items-center justify-center">
                        <div className="px-6 py-4 w-full h-[90%] flex flex-col justify-center items-center">

                            <h1 className="font-titleFont underline underline-offset-4 decoration-[1px] font-semibold text-3xl mdl:text-4xl mb-4">
                                Sign up
                            </h1>
                            <div className="flex w-[80%] flex-col gap-3">
                                {/* Email */}
                                <div className="flex flex-col gap-1">
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
                                            {errEmail}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col lg:flex-row w-full gap-2" >
                                    <div className="flex flex-col gap-1 w-full">
                                        <p className="font-titleFont text-base font-semibold text-gray-600">
                                            Name
                                        </p>
                                        <input
                                            onChange={handleName}
                                            value={name}
                                            className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                                            type="text"
                                            placeholder="John Doe"
                                        />
                                        {errName && (
                                            <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                                                {errName}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="flex flex-col gap-1">
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
                                            {errPassword}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="flex flex-col gap-1">
                                    <p className="font-titleFont text-base font-semibold text-gray-600">
                                        Confirm Password
                                    </p>
                                    <input
                                        onChange={handleConfirmPassword}
                                        value={confirmPassword}
                                        className="w-full h-8 placeholder:text-sm placeholder:tracking-wide px-4 text-base font-medium placeholder:font-normal rounded-md border-[1px] border-gray-400 outline-none"
                                        type="password"
                                        placeholder="Confirm your password"
                                    />
                                    {errConfirmPassword && (
                                        <p className="text-sm text-red-500 font-titleFont font-semibold px-4">
                                            {errConfirmPassword}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={handleSignUp}
                                    className="bg-[#262626] hover:bg-black text-gray-200 hover:text-white cursor-pointer w-full text-base font-medium h-10 rounded-md  duration-300"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

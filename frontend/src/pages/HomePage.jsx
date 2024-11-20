import React from 'react'

const HomePage = () => {
    return(
        <>
            <header className="flex justify-between p-6">
                <div className="container mx-auto flex justify-around  items-center">
                    {/* <h1 className="text-white text-3xl font-bold">TeamSync</h1> */}
                    <div className="flex"></div>
                    <div className="flex"></div>
                    <div className="flex"></div>
                    <div className="flex"></div>
                    {/* This pushes the button to the right */}
                    <div className="flex text-white ">
                        <Link
                        to="/register"
                        className="ml-auto px-6 py-3 bg-[#7157FE] text-white font-semibold rounded-sm hover:bg-blue-700"
                        >
                        SignUp
                        </Link>
                    </div>
                </div>
            </header>

        </>
    );
};

export default HomePage;
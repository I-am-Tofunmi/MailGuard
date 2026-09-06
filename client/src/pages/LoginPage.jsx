import { FcGoogle } from "react-icons/fc"
import { ArrowRight, ShieldCheck } from "lucide-react"
import Footer from "../components/Footer"
function LoginPage () {
    return ( 
        <>
        <header className="flex flex-col gap-2 w-full bg-gradient-to-b from-emerald-100 to-emerald-50 px-6 py-4">
            <h2 className="text-2xl font-bold text-emerald-700 flex items-center self-start"><ShieldCheck className="w-6 h-6" /> MailGuard</h2>
            <p className="bg-emerald-100 text-emerald-700 text-sm px-4 py-2 rounded-full flex items-center gap-2 self-center"><ShieldCheck className="w-4 h-4" /> Your secure gateway is ready!</p>
        </header>

        <section className="flex flex-col gap-4 items-center justify-center min-h-screen bg-gradient-to-b from-emerald-50 to-white">
            <div>
                <form className="flex flex-col gap-4 bg-white border border-gray-200 p-8 rounded-2xl shadow-md w-110">
                    <h1 className="text-4xl text-center justify-center">Welcome back.</h1>
                    <p className="text-center justify-between font-light">Let's make sure your emails keep reaching your customers.</p>
                    <label className="font-light">Email Address</label>
                    <input className="border border-gray-300 p-2 rounded-md" type="email" placeholder="name@company.com" />
                    <div className="flex justify-between items-center">
                    <label className="font-light">Password</label>
                    <a href="#" className="text-emerald-700 text-sm font-medium">Forgot?</a>
                    </div>
                    <input className="border border-gray-300 p-2 rounded-md" type="password" placeholder="••••••••" />
                    <button className="bg-emerald-700 text-white p-2 rounded-2xl hover:bg-emerald-600 flex items-center justify-center gap-2 cursor-pointer" type="submit">Sign In<ArrowRight className="w-4 h-4" /></button>
                    <div className="flex items-center gap-2">
                        <hr className="flex-1 border-gray-300" />
                        <span className="text-center font-mono">OR CONTINUE WITH</span>
                        <hr className="flex-1 border-gray-300" />
                    </div>
                    <div className="flex gap-5 justify-center">
                    <button className="border border-gray-300 py-2 px-6 rounded-md flex items-center gap-2 cursor-pointer hover:bg-gray-50" type="button"><FcGoogle className="w-5 h-5" /> Google</button>
                    <button className="border border-gray-300 py-2 px-6 rounded-md flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 23 23">
                            <rect x="0" y="0" width="10.5" height="10.5" fill="#f25022"/>
                            <rect x="12.5" y="0" width="10.5" height="10.5" fill="#7fba00"/>
                            <rect x="0" y="12.5" width="10.5" height="10.5" fill="#00a4ef"/>
                            <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#ffb900"/>
                        </svg>
                        Microsoft
                    </button>                    
                    </div>
                </form>
            </div>
            <p className="text-sm text-gray-500 text-center">
                New to MailGuard? <a href="/register" className="text-emerald-700 font-medium">Create an account</a>
            </p>

        </section>

        <footer className="flex flex-row justify-between p-6 px-16 bg-emerald-150 border-t border-gray-200">
                <p>@ 2026 MailGuard Security. Assisted Clarity for Email.</p>
                <ul className="flex gap-4 list-none ml-auto">
                    <li><a href="">Privacy Policy</a></li>
                    <li><a href="">Support</a></li>
                </ul>
                <div className=""></div>
        </footer>
        </>

            )
}

export default LoginPage
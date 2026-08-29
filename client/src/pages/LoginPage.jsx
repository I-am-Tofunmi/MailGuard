import { ArrowRight, ShieldCheck } from "lucide-react"
import Footer from "../components/Footer"
function LoginPage () {
    return ( 
        <>
        <header className="flex flex-col gap-2 w-full bg-emerald-50 px-6 py-4">
            <h2 className="text-2xl font-bold text-emerald-700 flex items-center self-start"><ShieldCheck className="w-6 h-6" /> MailGuard</h2>
            <p className="bg-emerald-100 text-emerald-700 text-sm px-4 py-2 rounded-full flex items-center gap-2 self-center"><ShieldCheck className="w-4 h-4" /> Your secure gateway is ready!</p>
        </header>

        <section className="flex flex-col gap-4 items-center justify-center min-h-screen bg-emerald-50">
            <div>
                <form className="flex flex-col gap-4 bg-white border border-gray-200 p-8 rounded-2xl shadow-md w-146">
                    <h1 className="text-4xl text-center justify-center">Welcome back.</h1>
                    <p className="text-center justify-between font-light">Let's make sure your emails keep reaching your customers.</p>
                    <label className="font-light">Email Address</label>
                    <input className="border border-gray-300 p-2 rounded-md" type="email" placeholder="name@company.com" />
                    <label className="font-light">Password</label>
                    <input className="border border-gray-300 p-2 rounded-md" type="password" placeholder="••••••••" />
                    <button className="bg-emerald-700 text-white p-2 rounded-2xl hover:bg-emerald-600 flex items-center justify-center gap-2" type="submit">Sign In<ArrowRight className="w-4 h-4" /></button>
                    <div className="flex items-center gap-2">
                        <hr className="flex-1 border-gray-300" />
                        <span className="text-center">OR CONTINUE WITH</span>
                        <hr className="flex-1 border-gray-300" />
                    </div>
                    <div className="flex gap-5 justify-center">
                    <button className="border border-gray-300 p-2 rounded-md" type="button">Google</button>
                    <button className="border border-gray-300 p-2 rounded-md" type="button">Microsoft</button>
                    </div>
                </form>
            </div>
            <p className="text-sm text-gray-500 text-center">
                New to MailGuard? <a href="/register" className="text-emerald-700 font-medium">Create an account</a>
            </p>

        </section>

        <footer className="flex flex-row justify-around p-6 bg-emerald-50">
                <p>@ 2026 MailGuard Security. Assisted Clarity for Email.</p>
                <ul className="flex gap-4 list-none">
                    <li><a href="">Privacy Policy</a></li>
                    <li><a href="">Support</a></li>
                </ul>
                <div className=""></div>
        </footer>
        </>

            )
}

export default LoginPage
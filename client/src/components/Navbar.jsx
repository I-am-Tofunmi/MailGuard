import { Bell } from 'lucide-react';
function Navbar() {
    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
            <h2 className="text-emerald-700 font-bold text-xl cursor-pointer">MailGuard</h2>
            <ul className="flex items-center gap-4 list-none cursor-pointer">
                <li className="text-emerald-600 font-medium border-b-2 border-emerald-600 pb-1"><a href="/">Dashboard</a></li>
                <li className="text-gray-500"><a href="/">Scans</a></li>
                <li className="text-gray-500"><a href="/">History</a></li>
                <li className="text-gray-500"><a href="/">Settings</a></li>
            </ul>
            <div className="flex items-center gap-3">
            <Bell className="w-h h-5 text-gray-600 cursor-pointer" />
            <button type="button" className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold cursor-pointer">New Scan</button>
            </div>
        </nav>
    )
}
export default Navbar
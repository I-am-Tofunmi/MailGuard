function Navbar() {
    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
            <h2 className="text-emerald-700 font-bold text-xl">MailGuard</h2>
            <ul className="flex items-center gap-4 list-none">
                <li className="text-emerald-500">Dashboard</li>
                <li className="text-gray-500">Scans</li>
                <li className="text-gray-500">History</li>
                <li className="text-gray-500">Settings</li>
            </ul>
            <button type="button" className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold">New Scan</button>
        </nav>
    )
}
export default Navbar

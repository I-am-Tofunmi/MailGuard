function Footer() {
    return <footer className="bg-gray-100 border-t border-gray-200 py-8 px-12 flex flex-row justify-between items-center">
        <div className="flex flex-col gap-1">
        <h2 className="text-emerald-700">MailGuard</h2>
        <p className="text-sm text-gray-600">&copy; 2026 MailGuard Security. Assisted Clarity for Email.</p>
        </div>
        <div>
            <ul className="flex gap-6 list-none">
                <li className="text-sm text-gray-600 hover:text-emerald-700 cursor-pointer">Privacy Policy</li>
                <li className="text-sm text-gray-600 hover:text-emerald-700 cursor-pointer">Terms of Service</li>
                <li className="text-sm text-gray-600 hover:text-emerald-700 cursor-pointer">Security Whitepaper</li>
                <li className="text-sm text-gray-600 hover:text-emerald-700 cursor-pointer">Support</li>
            </ul>
        </div>
    </footer>
}
export default Footer;



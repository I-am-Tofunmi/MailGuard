function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-100 px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-emerald-700">MailGuard</h2>
          <p className="text-sm text-gray-600">&copy; 2026 MailGuard Security. Assisted Clarity for Email.</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          <li className="cursor-pointer hover:text-emerald-700 transition">Privacy Policy</li>
          <li className="cursor-pointer hover:text-emerald-700 transition">Terms of Service</li>
          <li className="cursor-pointer hover:text-emerald-700 transition">Security Whitepaper</li>
          <li className="cursor-pointer hover:text-emerald-700 transition">Support</li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;

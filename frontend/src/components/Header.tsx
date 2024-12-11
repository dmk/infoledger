import Link from "next/link";

export function Header() {
  return (
    <header className="bg-blue-700 shadow h-16 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-blue-50 hover:text-white">
            <h1 className="text-2xl font-bold">InfoLedger</h1>
          </Link>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/entries/new" aria-disabled className="text-blue-100 hover:text-white">
                  New Entry
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

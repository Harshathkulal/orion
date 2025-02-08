import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          Orion
        </Link>
        <div className="flex space-x-4">
          <Link href="/features" className="text-gray-600 hover:text-gray-800">
            Login
          </Link>
          
        </div>
      </div>
    </nav>
  );
}
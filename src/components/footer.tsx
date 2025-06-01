import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-mocha-900 text-mocha-300 py-6 mt-12 border-t border-mocha-800">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Orion. All rights reserved.
        </p>
        <div className="mt-2 flex justify-center space-x-4 text-sm">
          <span>Built by</span>
          <Link
            href="https://github.com/Harshathkulal"
            className="hover:underline text-mocha-400"
          >
            Harshath
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

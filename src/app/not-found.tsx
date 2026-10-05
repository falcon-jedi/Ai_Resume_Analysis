import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1014] text-[#dfe3e9]">
      <div className="text-center space-y-3">
        <h1 className="text-6xl font-bold text-[#1a91f0]">404</h1>
        <p className="text-2xl font-semibold">Page Not Found</p>
        <p className="text-[#bfc7d4]">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-block mt-4 text-[#1a91f0] hover:text-[#a0caff] underline transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

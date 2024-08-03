import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gradient-start to-gradient-end">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome</h1>
        <div className="space-y-4">
          <Link href="/login" className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
            Login
          </Link>
          <Link href="/signup" className="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}

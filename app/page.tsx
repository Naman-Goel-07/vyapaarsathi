import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">VyapaarSathi</h1>
        <p className="text-gray-600">
          The Government Action Tracker for MSMEs and Chartered Accountants.
          Never miss a compliance deadline again.
        </p>
        <div className="space-y-4 pt-4">
          <Link 
            href="/login" 
            className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login to Dashboard
          </Link>
          <Link 
            href="/signup" 
            className="block w-full bg-gray-100 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-200 transition"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

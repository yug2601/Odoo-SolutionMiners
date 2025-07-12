import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="w-full flex justify-between items-center p-4 shadow-md bg-white dark:bg-gray-900">
      <Link href="/">
        <span className="text-xl font-bold text-blue-600">SkillChain</span>
      </Link>
      <div className="space-x-4">
        {user ? (
          <>
            <Link href="/profile">Profile</Link>
            <Link href="/swaps">Swaps</Link>
            <Link href="/leaderboard">Leaderboard</Link>
            <button onClick={logout} className="text-red-500">Logout</button>
          </>
        ) : (
          <button onClick={login} className="text-blue-500">Login with Google</button>
        )}
      </div>
    </nav>
  );
}

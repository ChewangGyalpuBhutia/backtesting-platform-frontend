'use client';
import { signIn, signOut, useSession } from 'next-auth/react';

export function OAuthButton() {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;

  async function handleGoogleLogin() {
    await signIn('google', { redirect: false });
  }

  return session ? (
    <button onClick={() => signOut()} className="btn-secondary flex items-center border border-gray-300 bg-white text-gray-800 rounded px-4 py-2 shadow-sm hover:bg-gray-50 transition">
      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M17 16l-4-4m0 0l-4-4m4 4H7"/></svg>
      Sign out ({session.user?.name || 'Google'})
    </button>
  ) : (
    <button onClick={handleGoogleLogin} className="flex items-center border border-gray-300 bg-white text-gray-800 rounded px-4 py-2 shadow-sm hover:bg-gray-50 transition">
      {/* Google Icon SVG */}
      <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
        <g>
          <path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.23 9.24 3.25l6.91-6.91C36.53 2.34 30.64 0 24 0 14.61 0 6.27 5.48 1.82 13.44l8.06 6.27C12.6 13.16 17.87 9.5 24 9.5z"/>
          <path fill="#34A853" d="M46.18 24.55c0-1.56-.14-3.06-.39-4.5H24v9.05h12.47c-.54 2.91-2.18 5.38-4.66 7.05l7.23 5.62C43.73 37.36 46.18 31.44 46.18 24.55z"/>
          <path fill="#FBBC05" d="M9.88 28.71c-1.13-3.36-1.13-6.97 0-10.33l-8.06-6.27C-1.13 17.36-1.13 30.64 9.88 39.29l8.06-6.27z"/>
          <path fill="#EA4335" d="M24 44c6.64 0 12.53-2.34 17.15-6.44l-7.23-5.62c-2.01 1.35-4.59 2.15-7.42 2.15-6.13 0-11.4-3.66-13.94-8.97l-8.06 6.27C6.27 42.52 14.61 48 24 48z"/>
        </g>
      </svg>
      <span className="font-medium">Sign in with Google</span>
    </button>
  );
}

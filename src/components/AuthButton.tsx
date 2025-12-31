

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import AuthModal from './AuthModal';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }: { data: { session: any }, error: any }) => {
      if (error) {
        console.error('Session error:', error);
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }).catch((err: any) => {
      console.error('Session error:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowModal(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const handleAuthSuccess = () => {
    setShowModal(false);
  };

  if (loading) {
    return <div className="text-body-sm text-gray-600">Loading...</div>;
  }

  return (
    <>
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-body-sm text-gray-900">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-body-sm bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-colors duration-300"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 text-body-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors duration-300 shadow-sm hover:shadow"
        >
          Sign In / Sign Up
        </button>
      )}
      <AuthModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}


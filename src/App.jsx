import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Players from "./components/Players";
import Board from "./components/Board";
import AuthForm from './components/AuthForm';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if there's a session on load
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h2>Mine! Game</h2>
          <Board user={user} />
          {/* <Players /> */}
        </div>
      ) : (
        <AuthForm onAuth={setUser} />
      )}
    </div>
  );
}

export default App;

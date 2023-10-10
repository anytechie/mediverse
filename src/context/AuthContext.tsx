import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, signInAnonymously } from "firebase/auth";

export const AuthContext = createContext({
  currentUser: null,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  console.log("auth", auth.currentUser)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // If no user is signed in, sign in anonymously
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((error) => {
        console.error("Error signing in anonymously:", error);
      });
    }

    return unsubscribe;
  }, [auth]);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

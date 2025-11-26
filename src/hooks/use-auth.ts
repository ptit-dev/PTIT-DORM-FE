import * as React from "react";

interface User {
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
}

export const useAuth = (): AuthContextType => {
  const [authState, setAuthState] = React.useState<AuthContextType>({
    user: null,
    isAuthenticated: false,
  });

  React.useEffect(() => {
    const userJson = localStorage.getItem("ptit_user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.roles) {
          setAuthState({ user, isAuthenticated: true });
        }
      } catch (e) {
        setAuthState({ user: null, isAuthenticated: false });
      }
    }
  }, []);

  return authState;
};
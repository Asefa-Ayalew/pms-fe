"use client"
import { createContext, useState, useEffect, useContext, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { jwtVerify } from 'jose'; // Correct import for jwtVerify
import { hasCookie, getCookie, setCookie, deleteCookie } from 'cookies-next';

interface AuthContextValue {
  user: Record<string, any> | undefined;
  isAuthenticated: boolean;
  error: any;
  login: (formFields: { email: string; password: string }) => Promise<any>;
  logOut: () => void;
  getUserInfo: () => Promise<any>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const baseURL = process.env.NEXT_PUBLIC_APP_API || '';

function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<any>();
  const [error, setError] = useState<any>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const isSignedIn = Boolean(hasCookie('token'));
    setIsAuthenticated(isSignedIn);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const token = getCookie('token');
      const storedUserInfo = localStorage.getItem('usersInfo');
      if (storedUserInfo) {
        const userInfo = JSON.parse(storedUserInfo);
        setUser(userInfo);
        console.log('user info', userInfo);

        setCookie('token', userInfo.accessToken); 
        setCookie('refreshToken', userInfo.refreshToken); 
      }

      if (token && typeof token === 'string' && token.split('.').length === 3) {
        try {
          const payload  = jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || '')); // Using jwtVerify
          setUser(payload);
        } catch (err) {
          console.error('Failed to decode token:', err);
          deleteCookie('token');
          deleteCookie('refreshToken');
          setIsAuthenticated(false);
          router.refresh();
        }
      } else {
        console.warn('Invalid or malformed token found in cookies:', token);
        deleteCookie('token');
        deleteCookie('refreshToken');
        setIsAuthenticated(false);
        router.refresh();
      }
    }
  }, [isAuthenticated]);

  const login = async (formFields: { email: string; password: string }) => {
    const response = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formFields),
    });

    if (response.ok) {
      const data = await response.json();
      const { access_token, refresh_token } = data;

      // Set the tokens in cookies
      setCookie('token', access_token);
      setCookie('refreshToken', refresh_token);
      setCookie('userInfo', data.userInfo ? JSON.stringify(data.userInfo) : '{}');
      // Optionally decode and set user info
      const { payload } = await jwtVerify(access_token, new TextEncoder().encode(process.env.JWT_SECRET || ''));
      setUser(payload);
      localStorage.setItem('usersInfo', JSON.stringify(payload));
      setIsAuthenticated(true);
      return data;
    }

    throw new Error('Login failed');
  };

  const logOut = () => {
    deleteCookie('token');
    deleteCookie('refreshToken');
    setIsAuthenticated(false);
    setUser(undefined);
    router.refresh();
  };

  const getUserInfo = async () => {
    const token = getCookie('token');
    if (token && typeof token === 'string' && token.split('.').length === 3) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || ''));
        return payload;
      } catch (err) {
        console.error('Failed to decode token:', err);
        deleteCookie('token');
        deleteCookie('refreshToken');
        setIsAuthenticated(false);
        router.refresh();
        return undefined;
      }
    }
    return undefined;
  };

  const authContextValue: AuthContextValue = {
    user,
    isAuthenticated,
    error,
    login,
    logOut,
    getUserInfo,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };

"use client"
import { createContext, useState, useEffect, useContext, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { jwtVerify } from 'jose';
import {  getCookie, setCookie, deleteCookie } from 'cookies-next';

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
    const isSignedIn = Boolean(getCookie('token'));
    setIsAuthenticated(isSignedIn);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        const token = getCookie('token');
        const storedUserInfo = localStorage.getItem('usersInfo');
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          setUser(userInfo);
          router.push('/dashboard');  // Redirect to the dashboard after user info is set
        }

        if (typeof token === 'string' && token.split('.').length === 3) {
          try {
            const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.NEXT_PUBLIC_AUTH_SECRET || ''));
            setUser(payload);
          } catch (err) {
            handleSessionExpiration();
          }
        } else {
          handleSessionExpiration();
        }
      })();
    }
  }, [isAuthenticated]);

  const handleSessionExpiration = () => {
    deleteCookie('token');
    deleteCookie('refreshToken');
    setIsAuthenticated(false);
    router.refresh();  // Refresh page after invalid session
  };

  const login = async (formFields: { email: string; password: string }) => {
    try {
      const response = await fetch(`${baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formFields),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('data', data);
        const { access_token, refresh_token, profile } = data;

        // Set the tokens in cookies and user info in localStorage
        setCookie('token', access_token);
        setCookie('refreshToken', refresh_token);
        setCookie('userInfo', profile ? JSON.stringify(profile) : '{}');
        setUser(profile);
        localStorage.setItem('usersInfo', JSON.stringify(data));
        const session = JSON.stringify({ access_token, refresh_token });
        const profilee = JSON.stringify(profile);
        console.log('profile::::::',profilee);
        console.log('sesssion::::::',JSON.parse(session));
        localStorage.setItem('userSession', JSON.stringify(session));
        setIsAuthenticated(true);
        router.push('/dashboard');
        return data;
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      setError(error);
      throw error;
    }
  };

  const logOut = () => {
    deleteCookie('token');
    deleteCookie('refreshToken');
    setIsAuthenticated(false);
    setUser(undefined);
    router.push('/auth/login');  
  };

  const getUserInfo = async () => {
    const token = await getCookie('token');
    if (typeof token === 'string' && token.split('.').length === 3) {
      try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.NEXT_PUBLIC_AUTH_SECRET || ''));
        return payload;
      } catch (err) {
        handleSessionExpiration();
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

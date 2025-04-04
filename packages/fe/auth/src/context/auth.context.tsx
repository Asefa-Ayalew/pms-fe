'use client';

import { jwtDecode } from 'jwt-decode';
import { hasCookie, deleteCookie, getCookie, setCookie } from 'cookies-next';
import React, {
  createContext,
  JSX,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import z from 'zod';
import type { Login } from '../../models/auth';

interface AuthContextValue {
  user: Record<string, any> | undefined;
  organizationId: string;
  isAuthenticated: boolean;
  error: any;
  isUser: () => boolean;

  login: (
    formFields: Login
  ) => Promise<
    | {
        access_token?: string;
        refresh_token?: string;
        message?: string;
      }
    | undefined
  >;
  logOut: () => void;
  getUserInfo: () => Promise<
    | {
        email?: string;
        user?: any;
        organizationId?: string;
      }
    | undefined
  >;
  setRole: any;
  role: any;
  roles: any;
  userCall: any;
}

interface BuildFetchAPI {
  formFields: Login | null;
  queryURL: string;
  method: 'GET' | 'POST';
}

type BuildFetchAPIResponse<T> = T;

const AuthContext = createContext<AuthContextValue | null>(null);

const baseURL = process.env.NEXT_PUBLIC_APP_API || '';

function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<any>();
  const [userCall, setUserCall] = useState<any>();
  const [organizationId, setOrganizationId] = useState<any>('');
  const [error, setError] = useState<any>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const userRole = user?.roles?.[0]?.name;
  const [role, setRole] = useState(userRole);
  const [roles, setRoles] = useState(user?.organizations?.[0]?.roles);
  const router = useRouter();

  useEffect(() => {
      const isSignedIn = Boolean(hasCookie('token'));
      setIsAuthenticated(isSignedIn);
    }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const token = getCookie('token');
      if (token) {
        const userInfo: Record<string, any> = jwtDecode(token as string);
        setUser(userInfo);

        setOrganizationId(userInfo.organizations?.[0]?.organization?.id || '');

        userInfo.roles && setRole(userInfo.organizations?.[0]?.roles[0]?.name);
        setRoles(userInfo.organizations?.[0]?.roles);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setUserCall(data);
        })
        .catch((userErr) => {
          console.error(userErr);
        });
    }
  }, [isAuthenticated]);

  const isUser = (): boolean => {
    return Boolean(getCookie('token'));
  };

  const buildFetchAPI = async function <T>(
    params: BuildFetchAPI,
    schema: z.Schema<T>
  ): Promise<BuildFetchAPIResponse<T> | undefined> {
    try {
      setError(undefined);
      const token = getCookie('token');
      const refreshToken = getCookie('refreshToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        const decoded: Record<string, any> = jwtDecode(token as string);
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTimestamp) {
          const refreshedToken: Record<string, string> | undefined =
            await fetch(`${baseURL}/auth/refresh-token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${refreshToken}`,
              },
              body: JSON.stringify({ refresh_token: refreshToken }),
            }).then(async (res) => {
              if (res.ok) {
                const data = await res.json();
                return data;
              }
              deleteCookie('token');
              deleteCookie('refreshToken');
            });

          if (refreshedToken) {
            headers.Authorization = `Bearer ${refreshedToken.access_token}`;
            setCookie('token', refreshedToken.access_token);
          } else {
            deleteCookie('token');
            setIsAuthenticated(false);
            router.refresh();
          }
        } else {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      const fetchConfig: RequestInit = {
        method: params.method,
        headers,
      };

      if (params.method === 'POST') {
        fetchConfig.body = JSON.stringify(params.formFields);
      }

      const response = await fetch(`${baseURL}/auth/${params.queryURL}`, fetchConfig);
      return response.json().then((data) => schema.parse(data));
    } catch (err) {
      setError(err);
    }
  };

  const login = async (formFields: Login) => {
    return await buildFetchAPI(
      {
        formFields,
        queryURL: 'login',
        method: 'POST',
      },
      z.object({
        access_token: z.string().optional(),
        refresh_token: z.string().optional(),
        message: z.string().optional(),
        is_security_question_set: z.boolean().optional(),
      })
    );
  };

  const getUserInfo = async () => {
    return await buildFetchAPI(
      {
        formFields: null,
        queryURL: 'me',
        method: 'GET',
      },
      z.object({
        email: z.string().optional(),
        user: z.object({ userRoles: z.any() }).optional().nullable(),
        organizationId: z.string().optional(),
      })
    );
  };

  const logOut = () => {
    deleteCookie('token');
    deleteCookie('refreshToken');
    router.refresh();
  };

  const authContextValue: AuthContextValue = {
    user,
    isAuthenticated,
    error,
    isUser,
    login,
    logOut,
    getUserInfo,
    setRole,
    role,
    organizationId,
    roles,
    userCall,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };

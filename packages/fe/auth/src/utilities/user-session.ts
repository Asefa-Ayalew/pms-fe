"use client"
export const getCurrentSession = (): any | null => {
    if (!localStorage.getItem('userSession')) {
      return null; 
    }
    try {
      const token = localStorage.getItem('userSession') ?? ''; 
      const session: any | null = JSON.parse(token);
      return session;
    } catch (error) {
      return null;
    }
  };
  export const getUserInfo = (): any | null => {
    if (!localStorage.getItem('usersInfo')) {
      return null; 
    }
    try {
      const token = localStorage.getItem('usersInfo') ?? ''; 
      const session: any | null = JSON.parse(token);
      return session;
    } catch (error) {
      return null;
    }
  }
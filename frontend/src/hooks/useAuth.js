import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser!=undefined) setUser(JSON.parse(storedUser));
    else 
      console.log("undefined user data in localstorage")
  }, []);

  return { user, setUser };
};
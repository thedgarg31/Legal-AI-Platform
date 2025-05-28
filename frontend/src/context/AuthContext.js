import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [persist, setPersist] = useState(JSON.parse(localStorage.getItem('persist')) || false);

  // ✅ PERSISTENT LOGIN: Initialize authentication on app load
  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          console.log('🔄 Verifying stored authentication...');
          
          // Verify token is still valid
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (isMounted) {
              setUser(data.user);
              setToken(storedToken);
              console.log('✅ Authentication restored for:', data.user.name);
            }
          } else if (response.status === 401) {
            // Token expired, try to refresh
            console.log('🔄 Token expired, attempting refresh...');
            await refreshToken();
          } else {
            // Invalid token, clear storage
            console.log('❌ Invalid token, clearing storage');
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('❌ Auth verification error:', error);
        if (isMounted) {
          clearAuthData();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Only verify if persist is enabled or we have stored data
    if (persist || localStorage.getItem('token')) {
      verifyRefreshToken();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [persist]);

  // ✅ CROSS-TAB SYNC: Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          // Token removed in another tab
          setUser(null);
          setToken(null);
        } else {
          // Token updated in another tab
          setToken(e.newValue);
        }
      } else if (e.key === 'user' && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue);
          setUser(updatedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const clearAuthData = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshToken = async () => {
    try {
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) {
        throw new Error('No token to refresh');
      }

      const response = await fetch('http://localhost:5000/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Token refreshed successfully');
        return data.token;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      clearAuthData();
      return null;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔄 Attempting login for:', email);
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Login successful:', data.user);
        
        setUser(data.user);
        setToken(data.token);
        
        // ✅ STORE IN LOCALSTORAGE FOR PERSISTENCE
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // ✅ ENABLE PERSIST BY DEFAULT
        setPersist(true);
        localStorage.setItem('persist', JSON.stringify(true));
        
        return { 
          success: true, 
          user: data.user,
          shouldRedirect: data.user.isLawyer && data.user.lawyerId,
          redirectPath: data.user.isLawyer && data.user.lawyerId 
            ? `/lawyer-dashboard/${data.user.lawyerId}` 
            : null
        };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, message: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      if (user && token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            userId: user.id,
            lawyerId: user.lawyerId 
          })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      setPersist(false);
      localStorage.removeItem('persist');
      console.log('✅ User logged out successfully');
    }
  };

  // ✅ API REQUEST INTERCEPTOR
  const apiRequest = async (url, options = {}) => {
    const currentToken = token || localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken && { 'Authorization': `Bearer ${currentToken}` }),
        ...options.headers
      }
    };

    try {
      let response = await fetch(url, config);
      
      // If unauthorized, try to refresh token
      if (response.status === 401 && currentToken) {
        console.log('🔄 API request unauthorized, refreshing token...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry with new token
          config.headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(url, config);
        }
      }
      
      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    refreshToken,
    apiRequest,
    loading,
    persist,
    setPersist,
    isAuthenticated: !!user && !!token,
    isLawyer: user?.isLawyer || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

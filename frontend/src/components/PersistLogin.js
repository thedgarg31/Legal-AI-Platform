import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { refreshToken, persist, token, user } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                if (persist && !user && token) {
                    console.log('🔄 PersistLogin: Verifying refresh token...');
                    await refreshToken();
                }
            } catch (err) {
                console.error('❌ PersistLogin verification error:', err);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // Only call verifyRefreshToken if we don't have a user but we should persist
        !user && persist ? verifyRefreshToken() : setIsLoading(false);

        return () => {
            isMounted = false;
        };
    }, [persist, refreshToken, token, user]);

    if (!persist) {
        return <Outlet />;
    }

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem auto'
                    }}></div>
                    <p style={{ color: '#666', margin: 0 }}>
                        Verifying authentication...
                    </p>
                </div>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return <Outlet />;
};

export default PersistLogin;

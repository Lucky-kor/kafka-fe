import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useStore from './store';
import { CircularProgress, Box } from '@mui/material'; // CircularProgress와 Box 임포트

const ProtectedRoute = ({ element }) => {
    const { isLogined, initializeState } = useStore(state => state);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            await initializeState();
            setIsChecking(false);
        };
        checkAuth();
    }, [initializeState]);

    if (isChecking) {
        // 로딩 중일 때 CircularProgress를 화면 중앙에 표시
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress
                    sx={{
                        color: '#ffb121' // 원하는 색상 코드
                    }}
                />
            </Box>
        );
    }

    // 인증된 상태면 페이지를 렌더링하고, 아니면 로그인 페이지로 리디렉션
    return isLogined ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;
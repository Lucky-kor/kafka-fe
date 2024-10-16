import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom"; // useNavigate 훅 가져오기
import logo from '../../assets/images/logo.png'; // 기존 로고 경로 유지
import './login.css'; // 기존 스타일 유지

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate(); // useNavigate 훅 호출

    // 로그인 요청 처리 함수
    const handleLogin = async () => {
        if (!username || !password) {
            setErrorMessage('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8081/auth/login', {
                username: username,
                password: password,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                const accessToken = response.headers['authorization'];
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('username', username);

                alert('로그인 성공!');
                navigate('/'); // 홈으로 리디렉션
            }
        } catch (error) {
            console.error("로그인 실패: ", error);
            setErrorMessage('로그인 실패: 아이디나 비밀번호를 확인해주세요.');
        }
    };

    // Enter 키를 눌렀을 때 로그인 처리 함수
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    useEffect(() => {
        const loggedInStatus = localStorage.getItem('accessToken');
        if (loggedInStatus) {
            navigate('/dashboard'); // 로그인된 상태면 홈으로 리디렉션
        }
    }, [navigate]);

    return (
        <div id="login-wrapper">
            <div id="login-container">
                <img src={logo} alt="Ping Pong" id="logo-image" />
                <form id="login-form" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <div>
                        <label>ID : </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyPress={handleKeyPress} // Enter 키 처리 함수 연결
                        />
                    </div>
                    <div>
                        <label>Password : </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress} // Enter 키 처리 함수 연결
                        />
                    </div>
                    {errorMessage && <p style={{ color: '#ff2c2c' }}>{errorMessage}</p>}
                    <button type="submit">Login</button>
                </form>
            </div>

            {/* 기존 bg-bubbles 유지 */}
            <ul id="bg-bubbles">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    );
};

export default Login;

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import '../notification/notification.css';
import { useNavigate } from 'react-router-dom';

const Notification = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [employeeId, setEmployeeId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get("http://localhost:8081/employees/my-info", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
                const { employeeId } = response.data.data;
                setEmployeeId(employeeId);
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchUserInfo();
    }, []);

    useEffect(() => {
        if (employeeId !== null) {
            let url = `http://localhost:8086/notifications/${employeeId}`;
            if (filter === 'read') {
                url += '?isRead=true';
            } else if (filter === 'unread') {
                url += '?isRead=false';
            }

            axios.get(url)
                .then(response => {
                    setNotifications(response.data);
                })
                .catch(error => {
                    console.error("Error fetching notifications:", error);
                });
        }
    }, [employeeId, filter]);

    const handleNotificationClick = async (notification) => {
        try {
            // 읽음 처리
            console.log(`Marking notification ${notification.id} as read`);
            await axios.patch(`http://localhost:8086/notifications/${notification.id}/read`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
            });

            // 알림의 유형에 따라 경로 설정
            if (notification.bookRoomId) {
                navigate(`/room-books/${notification.bookRoomId}`);
            } else if (notification.calendarId) {
                navigate(`/calendar/${notification.calendarId}`);
            } else if (notification.bookCarId) {
                navigate(`/car-books/${notification.bookCarId}`);
            } else if (notification.postId) {
                navigate(`/posts/${notification.postId}`);
            } else if (notification.documentId) {
                navigate(`/elec/${notification.documentId}`);
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    return ReactDOM.createPortal(
        <div className="notification-panel-container">
            <div className="notification-panel">
                <button className="close-button" onClick={onClose}>X</button>
                <h3>알림</h3>
                <div className="filter-buttons">
                    <button onClick={() => setFilter('all')}>전체</button>
                    <button onClick={() => setFilter('read')}>읽은 알림</button>
                    <button onClick={() => setFilter('unread')}>안 읽은 알림</button>
                </div>
                <ul className="notification-list">
                    {notifications.map((notification) => (
                        <li
                            key={notification.id}
                            className={notification.read ? "notification-item read" : "notification-item unread"}
                            onClick={() => handleNotificationClick(notification)}  // 클릭 시 함수 호출
                            style={{ cursor: 'pointer' }}  // 클릭할 수 있는 느낌을 주기 위해 커서 스타일 추가
                        >
                            <p>{notification.message}</p>
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>,
        document.body
    );
};

export default Notification;

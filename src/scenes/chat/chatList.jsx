import React, {useEffect, useState, useRef, useCallback} from 'react';
import './chatList.css';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {MoreHoriz} from "@mui/icons-material";

const ChatList = ({
    formatDate,
    setActiveRoom,
    onRoomClick,
    openModal,
    memberId,
    getChatRoomList,
    chatRoomList,
    setFilteredRoomList,
    filteredRoomList,
    setChatRoomList
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOverallDropdownOpen, setIsOverallDropdownOpen] = useState(false);
    const [selectedRoomDropdown, setSelectedRoomDropdown] = useState(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const overallDropdownRef = useRef(null);
    const roomDropdownRefs = useRef({});

    useEffect(() => {
        if (memberId) {
            getChatRoomList();
        }
    }, [memberId, getChatRoomList]);

    useEffect(() => {
        if (searchTerm) {
            const filteredRooms = chatRoomList.filter((room) =>
                renderRoomName(room).toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredRoomList(filteredRooms);
        } else {
            setFilteredRoomList(chatRoomList);
        }
    }, [chatRoomList, searchTerm, setFilteredRoomList]);

    const exitChatRoom = (roomId) => {
        axios
            .delete(`/chat/delete`, {params: {chatRoomId: roomId, memberId: memberId}})
            .then(() => {
                getChatRoomList();
                setActiveRoom(null);
            })
            .catch((err) => {
                console.error('채팅방 나가기 실패:', err);
            });
    };

    const exitAllChatRooms = () => {
        axios.delete(`/chat/exit`, {params: {memberId: memberId}})
            .then(() => {
                getChatRoomList();
                setActiveRoom(null);
            })
            .catch((err) => {
                console.error('전체 채팅방 나가기 실패:', err);
            });
    };

    const handleSearch = (event) => {
        const searchValue = event.target.value.toLowerCase();
        setSearchTerm(searchValue);

        if (searchValue === '') {
            setFilteredRoomList(sortRoomsByLastActive(chatRoomList));
        } else {
            const filteredRooms = chatRoomList.filter((room) =>
                renderRoomName(room).toLowerCase().includes(searchValue)
            );
            setFilteredRoomList(sortRoomsByLastActive(filteredRooms));
        }
    };

    const toggleOverallDropdown = () => {
        setIsOverallDropdownOpen((prev) => !prev);
    };

    const toggleRoomDropdown = (roomId) => {
        setSelectedRoomDropdown(selectedRoomDropdown === roomId ? null : roomId);
    };

    const handleClickOutside = useCallback((event) => {
        if (overallDropdownRef.current && !overallDropdownRef.current.contains(event.target)) {
            setIsOverallDropdownOpen(false);
        }
        if (selectedRoomDropdown !== null && roomDropdownRefs.current[selectedRoomDropdown] && !roomDropdownRefs.current[selectedRoomDropdown].contains(event.target)) {
            setSelectedRoomDropdown(null);
        }
    }, [selectedRoomDropdown]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const toggleSearch = () => {
        setIsSearchVisible((prev) => !prev);
    };

    const renderRoomName = useCallback((room) => {
        if (room.chatRoomName && room.chatRoomName.trim() !== '') {
            return room.chatRoomName;
        }

        const participantNames = room.participants
            .filter(p => p.memberId !== memberId)
            .map(p => p.name);

        if (participantNames.length > 5) {
            return `${participantNames.slice(0, 5).join(', ')}...`;
        }
        return participantNames.join(', ');
    }, [memberId]);

    const sortRoomsByLastActive = useCallback((rooms) => {
        return [...rooms].sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
    }, []);

    return (
        <div className="sidebar2">
            <div className="tab-header">
                <div className="tab-buttons">
                    <button className="tab-button active">채팅방</button>
                    <input
                        type="text"
                        style={{display: isSearchVisible ? 'block' : 'none'}}
                        placeholder="Search Chat Rooms"
                        className="search-input"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="icon-buttons2" ref={overallDropdownRef}>
                    <button className="icon-button" onClick={openModal}>
                        <AddIcon/>
                    </button>
                    <button className="icon-button" onClick={toggleSearch}>
                        <SearchIcon/>
                    </button>
                    <button className="icon-button" onClick={toggleOverallDropdown}>
                        <MoreHoriz/>
                    </button>
                    <div className={`dropdown-menu ${isOverallDropdownOpen ? 'open' : ''}`}>
                        <button className="dropdown-item" onClick={exitAllChatRooms}>
                            전체 채팅방 나가기
                        </button>
                    </div>
                </div>
            </div>

            <div className="chat-list">
                {filteredRoomList.map((room, idx) => (
                    <div key={idx} className="chat-room" onClick={() => onRoomClick(room)}>
                        <div className="chat-info">
                            <span className="chat-room-name">
                                {renderRoomName(room)}&nbsp;&nbsp;
                                <b style={{fontSize: '10px', color: 'gray'}}>({room.participants.length})</b>
                            </span>
                            <span className="last-message" style={{fontSize: '18px'}}>{room.lastMessage}</span>
                        </div>

                        <div className="chat-meta">
                            {room.lastMessage && (
                                <span className="time">{formatDate(room.lastActive, room.lastMessage)}</span>
                            )}
                            {room.unreadCount > 0 && (
                                <span className="unread-badge">{room.unreadCount}</span>
                            )}
                            <button
                                className="icon-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRoomDropdown(room.chatRoomId);
                                }}
                            >
                                ⋯
                            </button>
                            {selectedRoomDropdown === room.chatRoomId && (
                                <div
                                    className="room-dropdown open"
                                    ref={(el) => (roomDropdownRefs.current[room.chatRoomId] = el)}
                                >
                                    <button
                                        className="dropdown-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            exitChatRoom(room.chatRoomId);
                                        }}
                                    >
                                        채팅방 나가기
                                    </button>
                                    {/* 채팅방 이름 변경 기능은 아직 구현되지 않았으므로 주석 처리합니다 */}
                                    {/*<button
                                        className="dropdown-item"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            changeChatRoomName(room.chatRoomId);
                                        }}
                                    >
                                        채팅방 이름 변경
                                    </button>*/}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatList;
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./chatList.jsx";
import ChatRoomContainer from "./ChatRoomContainer.jsx";
import GroupModal from "../../components/groupModal.jsx";
import { Modal } from "react-bootstrap";
import './Chat.css';
import axios from "axios";
import logo from "../../../public/logo.png";
import useWebSocket from '../../hooks/useWebSocker.js';
import { South } from "@mui/icons-material";

const Chat = () => {
  const [activeRoom, setActiveRoom] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatRoomName, setChatRoomName] = useState('');
  const [memberId, setMemberId] = useState('');
  const [name, setName] = useState('');
  const [chatRoomList, setChatRoomList] = useState([]);
  const [filteredRoomList, setFilteredRoomList] = useState([]);
  const [profile, setProfile] = useState('');
  const [isChatRoomVisible, setIsChatRoomVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');  // 검색 키워드
  const [searchResults, setSearchResults] = useState([]);  // 검색 결과

  // 회원 검색 함수
  const searchMembers = async (keyword) => {
    try {
      const res = await axios.get(`http://localhost:8081/auth/employees/all`, {
        params: {
          page: 1,   // 페이지 1
          size: 10   // 페이지당 10개의 항목
        },
        headers: {
          Authorization: `${localStorage.getItem("accessToken")}`,
        },
      });
      console.log(res.data);
      setSearchResults(res.data);  // 검색 결과 저장
    } catch (err) {
      console.error("회원 검색 실패:", err);
    }
  };

  const handleMemberSelect = (member) => {
    setParticipants([{ memberId: member.id, name: member.name, profile: member.profileFile }]);
    setShowRoomInput(true);  // 방 제목 입력창 표시
    setModalOpen(false);  // 모달 닫기
  };

  const createChatting = async () => {
    if (participants.length !== 2) {
      alert("1:1 방을 만들려면 두 명의 참가자가 필요합니다.");
      return;
    }
  
    const currentDate = new Date();
    const data = {
      chatRoomId: '',  // 새 방이므로 빈 값
      chatRoomName: `${participants[0].name}와의 채팅방`,  // 1:1 방 이름 설정
      participants,
      lastMessage: '',
      topic: 'create-room-one',  // 1:1 채팅방
      lastActive: currentDate.toISOString()
    };
  
    try {
      await axios.post("/chat/create", data, {
        headers: { 'Content-Type': 'application/json' }
      });
      getChatRoomList();
      setChatRoomName('');
      setParticipants([]);
      setShowRoomInput(false);
    } catch (err) {
      console.error("채팅방 생성 실패:", err);
    }
  };

  // useWebSocket 훅 사용
  const onMessageReceived = useCallback((receivedMessage) => {
    setMessages(prevMessages => [...prevMessages, receivedMessage]);
    updateChatRoomList(receivedMessage.chatRoomId, receivedMessage.content);
  }, []);

  const { isConnected, stompClientRef } = useWebSocket(
    memberId,
    activeRoom?.chatRoomId,
    activeRoom?.topic,
    onMessageReceived
  );

  console.log('memberId:', memberId);
  console.log('chatRoomId:', activeRoom?.chatRoomId);
  console.log('topic:', activeRoom?.topic);

  useEffect(() => {
    console.log("autoSelect 호출");
    autoSelect();
  }, []);

  useEffect(() => {
    if (memberId) {
      getChatRoomList();
    }
  }, [memberId, name, profile]);

  const sendMessage = useCallback((message) => {
    if (isConnected && stompClientRef.current) {
      const messageObj = {
        chatRoomId: activeRoom.chatRoomId,
        senderId: memberId,
        senderName: name,
        content: message,
        timestamp: new Date().toISOString()
      };
      stompClientRef.current.send("/app/chat", {}, JSON.stringify(messageObj));
    }
  }, [isConnected, activeRoom, memberId, name]);

  const autoSelect = async () => {
    try {
      const res = await axios.get("http://localhost:8081/auth/employees/my-info", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
    
      const userInfo = res.data.data;
      console.log(userInfo);
      setMemberId(userInfo.employeeId);
      setName(userInfo.name);
      setProfile(userInfo.email);
      setParticipants(prev => {
        const isAlreadyAdded = prev.some(participant => participant.memberId === userInfo.id);
        if (!isAlreadyAdded) {
          return [...prev, { memberId: userInfo.id, name: userInfo.name, profile: userInfo.profileFile }];
        }
        return prev;
      });
      console.log("내 정보 추가 성공");
    } catch (err) {
      console.error("내 정보 가져오기 실패:", err);
    }
  };

  const getChatRoomList = useCallback(async () => {
    try {
      const res = await axios.post('http://localhost:8085/chat/list', {
        userId: memberId,
        name: name,
        profile: profile
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
        }
      });
      setChatRoomList(res.data);
      setFilteredRoomList(res.data);
    } catch (err) {
      console.error("채팅방 목록 가져오기 실패:", err);
    }
  }, [memberId, name, profile]);

  const handleModalSelect = (value) => {
    setParticipants(prev => {
      const existingIds = prev.map(participant => participant.memberId);
      const newParticipants = value
        .filter(item => !existingIds.includes(item.id))
        .map(item => ({
          memberId: item.id,
          name: item.name,
          profile: item.profileFile
        }));
      const allParticipants = [...prev, ...newParticipants];
      return allParticipants.filter((participant, index, self) =>
        index === self.findIndex(p => p.memberId === participant.memberId)
      );
    });
    setShowRoomInput(true);
    setModalOpen(false);
  };

  // const createChatting = async () => {
  //   const currentDate = new Date();
  //   const data = {
  //     chatRoomId: '',
  //     chatRoomName,
  //     participants,
  //     lastMessage: '',
  //     topic: participants.length === 2 ? 'create-room-one' : 'create-room-many',
  //     lastActive: currentDate.toISOString()
  //   };
  //   try {
  //     await axios.post("/chat/create", data, {
  //       headers: { 'Content-Type': 'application/json' }
  //     });
  //     getChatRoomList();
  //     setChatRoomName('');
  //     setParticipants([]);
  //     setShowRoomInput(false);
  //   } catch (err) {
  //     console.error("채팅방 생성 실패:", err);
  //   }
  // };

  const handleRoomClick = (room) => {
    setActiveRoom(room);
    setIsChatRoomVisible(true);
  };

  const handleCloseChatRoom = () => {
    setIsChatRoomVisible(false);
    setTimeout(() => setActiveRoom(null), 300);
  };

  const formatDate = (dateString, lastMessage) => {
    if (!dateString || !lastMessage) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const formatTwoDigits = (num) => num.toString().padStart(2, '0');
    const hours = formatTwoDigits(date.getHours());
    const minutes = formatTwoDigits(date.getMinutes());
    if (isToday) {
      return `${hours}:${minutes}`;
    } else {
      const month = formatTwoDigits(date.getMonth() + 1);
      const day = formatTwoDigits(date.getDate());
      return `${month}/${day}`;
    }
  };

  const formatDate2 = (dateString) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const updateChatRoomList = (chatRoomId, lastMessage) => {
    const updateRoom = (room) =>
      room.chatRoomId === chatRoomId
        ? { ...room, lastMessage, lastActive: new Date() }
        : room;
    
    setChatRoomList(prevList => prevList.map(updateRoom));
    setFilteredRoomList(prevList => prevList.map(updateRoom));
  };

  return (
    <div className="chat-container">
      <div className="sidebar-container">
        <Sidebar
          formatDate={formatDate}
          setActiveRoom={setActiveRoom}
          filteredRoomList={filteredRoomList}
          setFilteredRoomList={setFilteredRoomList}
          onRoomClick={handleRoomClick}
          openModal={() => setModalOpen(true)}
          memberId={memberId}
          getChatRoomList={getChatRoomList}
          chatRoomList={chatRoomList}
          updateChatRoomList={updateChatRoomList}
        />
      </div>
      <div className={`chatroom-container ${isChatRoomVisible ? 'visible' : ''}`}>
        {activeRoom && (
          <ChatRoomContainer
          formatDate2={formatDate2}
          activeRoom={activeRoom}
          chatRoomId={activeRoom.chatRoomId}
          memberId={memberId}
          profile={profile}
          participants={activeRoom.participants}
          name={name}
          topic={activeRoom.topic}
          getChatRoomList={getChatRoomList}
          onClose={handleCloseChatRoom}
          updateChatRoomList={updateChatRoomList}
          isConnected={isConnected}
          sendMessage={sendMessage}
          messages={messages}
        />
        )}
      </div>
      {!isChatRoomVisible && (
        <img src={logo} alt="Logo" className={`grey-logo ${isChatRoomVisible ? 'visible' : ''}`} />
      )}
      <Modal show={modalOpen || showRoomInput} onHide={() => { setModalOpen(false); setShowRoomInput(false); }} centered>
  <Modal.Header closeButton>
    <Modal.Title>{showRoomInput ? '방 제목 입력' : '회원 검색'}</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {showRoomInput ? (
      // 방 제목 입력 UI
      <div>
        <input
          type="text"
          value={chatRoomName}
          onChange={(e) => setChatRoomName(e.target.value)}
          placeholder="방 제목 입력"
          style={{width: '100%', padding: '10px', margin: '10px 0'}}
        />
        <p>참가자: {participants.map(p => p.name).join(', ')}</p>
      </div>
    ) : (
      // 회원 검색 UI
      <div>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="회원 검색"
          style={{width: '100%', padding: '10px', margin: '10px 0'}}
        />
        <button onClick={() => searchMembers(searchKeyword)}>검색</button>
        
        <ul>
          {searchResults.map((member) => (
            <li key={member.id} onClick={() => handleMemberSelect(member)}>
              {member.name} - {member.email}
            </li>
          ))}
        </ul>
      </div>
    )}
  </Modal.Body>

  <Modal.Footer>
    {showRoomInput ? (
      // 방 만들기 버튼
      <button onClick={createChatting} style={{
        width: '100%',
        padding: '10px',
        backgroundColor: '#5CB85C',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        방 만들기
      </button>
    ) : (
      // 모달 닫기 버튼
      <button onClick={() => setModalOpen(false)} style={{
        width: '100%',
        padding: '10px',
        backgroundColor: '#d9534f',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        닫기
      </button>
    )}
  </Modal.Footer>
</Modal>

    </div>
  );
};

export default Chat;
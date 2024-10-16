import {useEffect, useState, useRef} from 'react';
import Stomp from 'stompjs';
import './ChatRoomContainer.css';
import axios from 'axios';
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import error from "eslint-plugin-react/lib/util/error.js";
import { South } from '@mui/icons-material';

const ChatRoomContainer = ({profile, activeRoom, onClose, memberId, name, chatRoomId, topic, formatDate2,updateChatRoomList}) => {
    const [messages, setMessages] = useState([]);  // 모든 메시지를 저장할 배열
    const [inputMessage, setInputMessage] = useState('');  // 입력된 메시지 상태
    const [isConnected, setIsConnected] = useState(false); // WebSocket 연결 상태 확인
    const [unreadCount, setUnreadCount] = useState(0); // 읽지 않은 메시지 카운트 추가
    const [isChatOpen, setIsChatOpen] = useState(true); // 채팅창 열림 상태 추가
    const stompClientRef = useRef(null); // stompClient를 useRef로 관리
    const [messageTopic, setMessageTopic] = useState('');
    const chatBodyRef = useRef(null); // 채팅 메시지를 담는 div를 참조하는 ref

    let subscriptionUrl = '';
    const subscriptionUrlRef = useRef('');

    // 창이 활성화되었을 때 WebSocket 연결
    useEffect(() => {
        const handleFocus = () => {
            setIsChatOpen(true);
            setUnreadCount(0); // 채팅창 열리면 읽지 않은 메시지 초기화
            sendReadReceipt();  // 읽었음을 서버에 알림
            console.log("채팅창 열림");
        };

        const handleBlur = () => {
            setIsChatOpen(false);
            console.log("채팅창 닫힘");
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    // 메시지를 읽었음을 서버에 알리는 함수
    const sendReadReceipt = () => {
        const stompClient = stompClientRef.current;
        if (stompClient && chatRoomId) {
            stompClient.send(`/app/chat/${chatRoomId}/read`, {}, JSON.stringify({ memberId }));
        }
    };

    // 프로필을 표시할 조건
    const showProfile = (allMessages, index) => {
        if (index === 0) {
            return true; // 첫 번째 메시지는 항상 프로필 표시
        }

        const currentMsg = allMessages[index];
        const prevMsg = allMessages[index - 1];

        // 이전 메시지와 발신자가 다르거나 1분 이상의 차이가 나면 프로필 표시
        return (
            currentMsg.senderId !== prevMsg.senderId ||
            new Date(currentMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) !==
            new Date(prevMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        );
    };

    const renderParticipants = (participants) => {
        const names = participants.map((p) => p.name);
        if (names.length > 5) {
            return `${names.slice(0, 5).join(', ')}...`;  // 5명까지 표시하고 나머지는 "..."
        }
        return names.join(', ');  // 참가자들을 쉼표로 구분하여 표시
    };


    // 타임스탬프를 표시할 조건
    const shouldShowTimestamp = (allMessages, index) => {
        if (index === allMessages.length - 1) {
            return true; // 마지막 메시지는 항상 타임스탬프 표시
        }

        const currentMsg = allMessages[index];
        const nextMsg = allMessages[index + 1];

        // 다음 메시지가 같은 사람이거나 1분 이내에 보내지 않은 경우 타임스탬프 표시
        return (
            currentMsg.senderId !== nextMsg.senderId ||
            new Date(currentMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) !==
            new Date(nextMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        );
    };

    // 이름을 표시할 조건
    const showName = (allMessages, index) => {
        if (index === 0) {
            return true; // 첫 번째 메시지는 항상 이름 표시
        }

        const currentMsg = allMessages[index];
        const prevMsg = allMessages[index - 1];

        // 이전 메시지와 발신자가 다르거나 1분 이상의 차이가 나면 이름 표시
        return (
            currentMsg.senderId !== prevMsg.senderId ||
            new Date(currentMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) !==
            new Date(prevMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        );
    };


    // WebSocket 연결 함수
    const connectWebSocket = () => {
        if (!memberId || !chatRoomId) {
            console.error("User ID 또는 ChatRoom ID가 정의되지 않음");
            return Promise.reject("필수 정보 누락");
        }
    
        console.log(`WebSocket 연결 시도 - ChatRoom ID: ${chatRoomId}`);
    
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(`http://localhost:8085/ws`);
            const stompClient = Stomp.over(socket);
            stompClientRef.current = stompClient;
    
            stompClient.connect({}, (frame) => {
                console.log('WebSocket이 연결되었습니다: ' + frame);
                setIsConnected(true);
                resolve(stompClient);
            }, (error) => {
                console.error('WebSocket 오류 발생: ', error);
                setIsConnected(false);
                reject(error);
            });
        }).then((stompClient) => {
            if (topic === "create-room-one" && !messageTopic) {
                console.log("Setting messageTopic to 'one'");
                subscriptionUrlRef.current = `/topic/messages/${chatRoomId}`;
                setMessageTopic('one');
            } else if (topic === "create-room-many" && !messageTopic) {
                console.log("Setting messageTopic to 'many'");
                subscriptionUrlRef.current = `/topic/app/${chatRoomId}`;
                setMessageTopic('many');
            }
    
            console.log(chatRoomId);
            console.log("subscriptionUrl:", subscriptionUrlRef.current);
    
            stompClient.subscribe(`/topic/chatRoom/${chatRoomId}`, (message) => {
                console.log("구독 주소 확인:", subscriptionUrlRef.current);
                const receivedMessage = JSON.parse(message.body);
                console.log("수신한 메시지:", receivedMessage);

                // 서버로부터 받은 메시지 중에서 본인의 메시지는 제외
                if (String(receivedMessage.senderId) === String(memberId)) {
                    return;  // 본인이 보낸 메시지는 무시
                }

                // 창이 열려 있지 않으면 읽지 않은 메시지로 처리
                if (!isChatOpen) {
                    console.log(`읽지 않은 메시지로 처리 : ${receivedMessage.content}`);
                    setUnreadCount(prevCount => prevCount + 1);
                } else {
                    console.log(`메시지를 읽었습니다: ${receivedMessage.content}`);
                    sendReadReceipt();  // 서버에 메시지를 읽었다고 알림
                }

                // 서버로부터 받은 메시지를 왼쪽 말풍선에 추가 (다른 사용자의 메시지)
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        content: receivedMessage.content,
                        senderName: receivedMessage.senderName,
                        isMine: false,
                        name: receivedMessage.senderName,
                        profile: receivedMessage.profile,  // 프로필 정보 추가
                        senderId: receivedMessage.senderId,  // senderId도 추가
                        timestamp: receivedMessage.timestamp  // timestamp도 추가
                    }
                ]);
                updateChatRoomList(chatRoomId, receivedMessage.content, receivedMessage.senderName);
            });
        }, (error) => {
            console.error('WebSocket 오류 발생: ', error);
            setIsConnected(false); // WebSocket 연결 실패 시 false로 설정
        });
    };

    // 메시지 전송 함수
    const sendMessage = () => {
        const stompClient = stompClientRef.current;

        if (!isConnected || !stompClient || inputMessage.trim() === '') {
            console.error(error);
            console.error('WebSocket이 연결되지 않았거나 stompClient가 초기화되지 않았거나 메시지가 비어있습니다.');
            return;
        }
        let currentTime = new Date()

        const messageObj = {
            senderName: name,  // 사용자명
            profile: profile,
            chatRoomId: chatRoomId,
            senderId: memberId,
            recipientId: activeRoom.participants,  // 수신자 목록
            content: inputMessage,
            announcement: '',
            fileUrl: '',
            topic: "one",
            timestamp: currentTime
        };

        try {
            // 서버로 메시지 전송
            console.log(messageObj);
            stompClient.send('/app/chat', {}, JSON.stringify(messageObj));

            // 내가 보낸 메시지를 오른쪽 말풍선에 추가
            setMessages(prevMessages => [
                ...prevMessages,
                {content: inputMessage, senderId: memberId, senderName: name, isMine: true, timestamp: new Date()}
            ]);


            // Sidebar 업데이트를 위해 부모 컴포넌트의 함수 호출
            updateChatRoomList(chatRoomId, inputMessage);

            setInputMessage('');  // 입력창 비우기
        } catch (error) {
            console.error('메시지 전송 중 오류 발생:', error);
        }
    };

    // 채팅 히스토리 로드 함수
    const getChatHistory = () => {
        axios('http://localhost:8085/chat/history?chatRoomId=' + chatRoomId)
            .then(res => {
                const chatHistory = res.data;
                console.log("받은 채팅 기록:", chatHistory);
                // 오래된 메시지 순으로 정렬하여 저장
                setMessages(chatHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
            })
            .catch(err => {
                console.error('채팅 기록을 불러오는데 실패했습니다: ', err);
            });
    };

    // WebSocket 연결 및 채팅 히스토리 로드
    useEffect(() => {
        if (!stompClientRef.current && memberId && chatRoomId) {
            console.log("WebSocket 연결 시작");
            connectWebSocket(); // WebSocket 연결
            getChatHistory();  // 채팅 기록 로드
        }
    }, [memberId, chatRoomId]);


    // 메시지 입력 후 엔터 키로 전송
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // 메시지가 업데이트될 때마다 스크롤을 아래로 이동시키는 함수
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);  // messages 배열이 변경될 때마다 실행

    const shouldShowDate = (allMessages, index) => {
        if (index === 0) return false; // 첫 메시지의 날짜는 표시하지 않음

        const currentMsg = allMessages[index];
        const prevMsg = allMessages[index - 1];

        // 두 날짜가 모두 유효한지 확인
        if (!isValidDate(new Date(currentMsg.timestamp)) || !isValidDate(new Date(prevMsg.timestamp))) {
            return false;
        }

        const currentDate = new Date(currentMsg.timestamp).toDateString();
        const prevDate = new Date(prevMsg.timestamp).toDateString();

        return currentDate !== prevDate;
    };

    const isValidDate = (date) => {
        return date instanceof Date && !isNaN(date);
    };

    const formatDateHeader = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ko-KR', options);
    };

    // 채팅 메시지 UI 렌더링
    return (
        <div className={`chat-room-container2 ${activeRoom ? 'open' : ''}`} style={{height:'100%', borderRadius:'5px', display: 'flex', flexDirection: 'column'}}>
            <div className="chat-header">
                <div className="chat-header-info">
                    <span style={{fontSize: '20px'}}>{activeRoom?.chatRoomName || 'No room selected'}</span>
                    <div className="chat-room-participants">
                        <PeopleIcon fontSize="small"/>
                        <span>{renderParticipants(activeRoom?.participants || [])}</span>
                        <span className="participant-count">({activeRoom?.participants?.length || 0})</span>
                    </div>
                </div>
                <button style={{backgroundColor: 'transparent', border: 'none'}} onClick={onClose}>
                    <CloseIcon/>
                </button>
            </div>
            <div className="lk-chat-messages" ref={chatBodyRef}
                 style={{flex: 1, overflowY: 'auto', paddingBottom: '70px'}}>
                {messages.map((msg, index) => (
                    <div key={index} className="lk-chat-totla" style={{display: 'flex', flexDirection: 'column'}}>
                        {shouldShowDate(messages, index) && (
                            <div className="date-header-container">
                                <div className="date-header">
                                    {formatDateHeader(msg.timestamp)}
                                </div>
                            </div>
                        )}
                    <div key={index} className={`lk-chat-entry ${String(msg.senderId) === String(memberId) ? 'lk-chat-entry-self' : ''}`}>
                        {msg.senderId !== memberId ? (
                            <div className="lk-chat-entry-other">
                                <div className="profile-picture">
                                    {showProfile(messages, index) && (
                                        <div className="profile-picture">
                                            <div className="profile-placeholder">
                                                <img src={msg.profile}
                                                     alt={msg.senderName}
                                                     className="profile-image"/>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="lk-chat-entry-content">
                                    {showName(messages, index) && (
                                        <div className="lk-chat-entry-metadata">{msg.senderName}</div>
                                    )}

                                    <div className="lk-chat-entry-bubble-container">
                                        {msg.content && msg.content.trim() !== '' && (
                                            <div className="lk-chat-entry-bubble2">
                                            <div className="message-content2">{msg.content}</div>
                                        </div>)}
                                        {shouldShowTimestamp(messages, index) && (
                                            <div className="lk-chat-entry-timestamp">
                                                {msg.timestamp && formatDate2(msg.timestamp)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="lk-chat-entry-self">
                                <div className="lk-chat-entry-bubble-container">
                                    {shouldShowTimestamp(messages, index) && (
                                        <div className="lk-chat-entry-timestamp">
                                            {msg.timestamp && formatDate2(msg.timestamp)}
                                        </div>
                                    )}
                                    {msg.content && msg.content.trim() !== '' && (
                                        <div className="lk-chat-entry-bubble2">
                                            <div className="message-content">{msg.content}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    </div>
                ))}
            </div>
            <div className="input-container" style={{width: '100%'}}>
                <input
                    className="chat-input"
                    type="text"
                    placeholder="Type a message"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button className="send-button" onClick={sendMessage}>보내기</button>
            </div>
        </div>
    );
};

export default ChatRoomContainer;
import { useState, useRef, useEffect } from "react";
import Stomp from 'stompjs';

const useWebSocket = (memberId, chatRoomId, topic, onMessageReceived) => {
  console.log(memberId)
  console.log(chatRoomId)
  console.log(topic)
    const [isConnected, setIsConnected] = useState(false);
    const stompClientRef = useRef(null);
  
    useEffect(() => {
      if (!memberId || !chatRoomId) {
        console.error("User ID 또는 ChatRoom ID가 정의되지 않았습니다.");
        return;
      }
  
      const socket = new WebSocket(`http://localhost:8085/ws`);
      const stompClient = Stomp.over(socket);
      stompClientRef.current = stompClient;
  
      const subscriptionUrl = topic === "create-room-one" 
        ? `/topic/messages/${chatRoomId}`
        : `/topic/group/${chatRoomId}`;
  
      stompClient.connect({}, (frame) => {
        console.log('WebSocket이 연결되었습니다: ' + frame);
        setIsConnected(true);
  
        stompClient.subscribe(subscriptionUrl, (message) => {
          const receivedMessage = JSON.parse(message.body);
          onMessageReceived(receivedMessage);
        });
      }, (error) => {
        console.error('WebSocket 오류 발생 : ', error);
        setIsConnected(false);
      });
  
      return () => {
        if (stompClientRef.current) {
          stompClientRef.current.disconnect();
        }
      };
    }, [memberId, chatRoomId, topic, onMessageReceived]);
  
    return { isConnected, stompClientRef };
  };
  
  export default useWebSocket;
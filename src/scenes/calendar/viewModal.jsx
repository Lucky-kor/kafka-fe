import React, { useEffect, useState } from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import axios from 'axios';
import { tokens } from '../../theme'; 

const ViewModal = ({ isOpen, eventDetails, onCancel, onUpdate, onDelete }) => {
  const [purpose, setPurpose] = useState('');
  const [bookingStatus, setBookingStatus] = useState(''); // 상태로 변경
  const colors = tokens();

  const statusMap = {
    PENDING: "신청",
    CONFIRMED: "확정",
    CANCELLED: "취소",
  };

  const purposeMap = {
    BUSINESS: '업무',
    PERSONAL: '개인',
    MAINTENANCE: '정비',
    OTHER: '기타',
    MEETING: '회의',
    WORKSHOP: '워크샵',
    TRAINING: '교육',
  };

  useEffect(() => {
    const fetchPurpose = async () => {
      if (eventDetails?.carBookId) {
        try {
          const response = await axios.get(`http://localhost:8084/car-books/${eventDetails.carBookId}`);
          if (response && response.data) {
            const purposeKey = response.data.data.purpose;
            setBookingStatus(statusMap[response.data.data.status]); // 상태 업데이트
            setPurpose(purposeMap[purposeKey] || '');
          }
        } catch (error) {
          console.error("Error fetching car reservation details:", error);
        }
      } else if (eventDetails?.roomBookId) {
        try {
          const response = await axios.get(`http://localhost:8084/room-books/${eventDetails.roomBookId}`);
          if (response && response.data) {
            const purposeKey = response.data.data.purpose;
            setBookingStatus(statusMap[response.data.data.status]); // 상태 업데이트
            setPurpose(purposeMap[purposeKey] || '');
          }
        } catch (error) {
          console.error("Error fetching room reservation details:", error);
        }
      }
    };

    if (eventDetails?.carBookId || eventDetails?.roomBookId) {
      fetchPurpose();
    }
  }, [eventDetails?.carBookId, eventDetails?.roomBookId]);

  if (!eventDetails) return null;

  let legendColor = colors.greenAccent[500];

  if (eventDetails?.carBookId) {
    legendColor = colors.redAccent[500];
  } else if (eventDetails?.roomBookId) {
    legendColor = colors.blueAccent[500];
  }

  return (
    <Modal open={isOpen} onClose={onCancel}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.default',
        borderRadius: '8px',
        width: 450,
        boxShadow: 24,
        p: 4
      }}>

        <Box display="flex" alignItems="center" mb={2}>
          <Box width={15} height={15} borderRadius="50%" bgcolor={legendColor} mr={2} mt={1} />
          <Typography variant="h3" component="h3" color="colors.gray[100]">
            {eventDetails?.title} {purpose ? `[${purpose}]` : ''}
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ color: "colors.gray[100]", mb: 2 }}>
          {eventDetails?.content}
        </Typography>

        <Typography variant="body2" sx={{ color: "colors.gray[100]", mb: 1 }}>
          {new Date(eventDetails?.startTime).toLocaleDateString()}{" "}
          {new Date(eventDetails?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {" "}~{" "}
          {new Date(eventDetails?.endTime).toLocaleDateString()}{" "}
          {new Date(eventDetails?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>

        {eventDetails?.isOwner && (
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Button
                onClick={onUpdate}
                variant="contained"
                color="primary"
              >
                수정
              </Button>
              <Button
                onClick={onDelete}
                variant="outlined"
                color="secondary"
                sx={{ ml: 2 }}
              >
                삭제
              </Button>
            </Box>
            
            <Typography variant="body2" color={colors.gray[200]}>
              예약 상태: {bookingStatus}
            </Typography>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default ViewModal;

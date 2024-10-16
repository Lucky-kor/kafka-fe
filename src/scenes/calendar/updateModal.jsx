import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const UpdateModal = ({ isOpen, eventDetails, onCancel, onSubmit }) => {
  const [inputValues, setInputValues] = useState({
    title: '',
    start: '',
    end: '',
    content: '',
    isReservation: false,
    reservationType: '',
    purpose: '',
  });

  const carPurposes = [
    { value: 'BUSINESS', label: '업무' },
    { value: 'PERSONAL', label: '개인' },
    { value: 'MAINTENANCE', label: '정비' },
    { value: 'OTHER', label: '기타' },
  ];

  const roomPurposes = [
    { value: 'MEETING', label: '회의' },
    { value: 'WORKSHOP', label: '워크샵' },
    { value: 'TRAINING', label: '교육' },
    { value: 'OTHER', label: '기타' },
  ];

  useEffect(() => {
    if (eventDetails && isOpen) {
      setInputValues({
        title: eventDetails.title || '',
        start: eventDetails.startTime || '',
        end: eventDetails.endTime || '',
        content: eventDetails.content || '',
        isReservation: eventDetails.carBookId || eventDetails.roomBookId ? true : false,
        reservationType: eventDetails.carBookId ? 'car' : eventDetails.roomBookId ? 'room' : '',
        purpose: eventDetails.purpose || '',
      });
    }
  }, [isOpen, eventDetails]);

  useEffect(() => {
    const fetchReservationDetails = async () => {
      if (eventDetails?.carBookId) {
        try {
          const response = await axios.get(`http://localhost:8084/car-books/${eventDetails.carBookId}`);
          if (response?.data?.data) {
            setInputValues((prevValues) => ({
              ...prevValues,
              purpose: response.data.data.purpose || '',
            }));
          }
        } catch (error) {
          console.error("Error fetching car reservation details:", error);
        }
      } else if (eventDetails?.roomBookId) {
        try {
          const response = await axios.get(`http://localhost:8084/room-books/${eventDetails.roomBookId}`);
          if (response?.data?.data) {
            setInputValues((prevValues) => ({
              ...prevValues,
              purpose: response.data.data.purpose || '',
            }));
          }
        } catch (error) {
          console.error("Error fetching room reservation details:", error);
        }
      }
    };

    if (eventDetails?.carBookId || eventDetails?.roomBookId) {
      fetchReservationDetails();
    }
  }, [eventDetails?.carBookId, eventDetails?.roomBookId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInputValues((prevValues) => {
      const updatedValues = { ...prevValues, [name]: value };

      if (name === 'end' && updatedValues.start && new Date(updatedValues.end) < new Date(updatedValues.start)) {
        updatedValues.start = '';
      }

      if (name === 'start' && updatedValues.end && new Date(updatedValues.start) > new Date(updatedValues.end)) {
        updatedValues.end = '';
      }

      return updatedValues;
    });
  };

  const handleSubmit = () => {
    onSubmit(inputValues);
  };

  return (
    <Modal open={isOpen} onClose={onCancel}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.default',
        borderRadius: '5px',
        width: 600,
        boxShadow: 24,
        p: 4
      }}>
        <Typography variant="h3" component="h2">일정 수정</Typography>

        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          label="제목"
          name="title"
          value={inputValues.title}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          label="시작 시간"
          name="start"
          type="datetime-local"
          InputLabelProps={{
            shrink: true,
          }}
          value={inputValues.start}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          label="종료 시간"
          name="end"
          type="datetime-local"
          InputLabelProps={{
            shrink: true,
          }}
          value={inputValues.end}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          label="설명"
          name="content"
          value={inputValues.content}
          onChange={handleChange}
        />

        {inputValues.isReservation && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>목적</InputLabel>
            <Select
              name="purpose"
              value={inputValues.purpose}
              onChange={handleChange}
            >
              {inputValues.reservationType === 'car' ? (
                carPurposes.map(purpose => (
                  <MenuItem key={purpose.value} value={purpose.value}>
                    {purpose.label}
                  </MenuItem>
                ))
              ) : (
                roomPurposes.map(purpose => (
                  <MenuItem key={purpose.value} value={purpose.value}>
                    {purpose.label}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        )}

        <Box mt={2}>
          <Button onClick={handleSubmit} variant="contained" color="primary">수정</Button>
          <Button onClick={onCancel} variant="outlined" color="secondary" sx={{ ml: 2 }}>취소</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UpdateModal;

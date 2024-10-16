import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, TextField, Typography, Checkbox, FormControl, InputLabel, MenuItem, Select, FormControlLabel, useTheme } from '@mui/material';
import axios from 'axios';
import { tokens } from "../../theme";

const AddModal = ({ isOpen, onCancel, onSubmit }) => {
  const [inputValues, setInputValues] = useState({
    title: '',
    start: '',
    end: '',
    content: '',
    isReservation: false,
    reservationType: '', 
    selectedOption: '', 
    purpose: '', 
  });
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [availableOptions, setAvailableOptions] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setInputValues({
        title: '',
        start: '',
        end: '',
        content: '',
        isReservation: false,
        reservationType: '',
        selectedOption: '',
        purpose: '',
      });
      setAvailableOptions([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchAvailableOptions = async () => {
      let url = '';
      if (inputValues.reservationType === 'car') {
        url = 'http://localhost:8084/cars/available';
      } else if (inputValues.reservationType === 'room') {
        url = 'http://localhost:8084/rooms/available';
      }

      if (url) {
        try {
          const response = await axios.get(url);
          setAvailableOptions(response.data);
        } catch (error) {
          console.error("Error fetching available options:", error);
          setAvailableOptions([]);
        }
      }
    };

    if (inputValues.reservationType) {
      fetchAvailableOptions();
    }
  }, [inputValues.reservationType]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInputValues((prevValues) => {
      const updatedValues = { ...prevValues, [name]: value };

      if (name === "end" && updatedValues.start && new Date(updatedValues.end) < new Date(updatedValues.start)) {
        updatedValues.start = ''; 
      }

      if (name === "start" && updatedValues.end && new Date(updatedValues.start) > new Date(updatedValues.end)) {
        updatedValues.end = '';
      }

      return updatedValues;
    });
  };

  const handleCheckboxChange = (e) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      isReservation: e.target.checked,
      reservationType: e.target.checked ? prevValues.reservationType : '', 
      selectedOption: '',
      purpose: '',
    }));
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
        <Typography variant="h3" component="h2">일정 추가</Typography>
        
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

        <FormControlLabel
          control={
            <Checkbox
                checked={inputValues.isReservation}
                onChange={handleCheckboxChange}
                sx={{
                    color: colors.primary[100], 
                    '&.Mui-checked': {
                    color: colors.gray[100], 
                    },
                }}
            />
          }
          label="예약"
        />

        {inputValues.isReservation && (
          <>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>예약 종류</InputLabel>
              <Select
                name="reservationType"
                value={inputValues.reservationType}
                onChange={handleChange}
              >
                <MenuItem value="car">차량</MenuItem>
                <MenuItem value="room">회의실</MenuItem>
              </Select>
            </FormControl>

            {inputValues.reservationType && (
              <>
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>{inputValues.reservationType === 'car' ? '차량 선택' : '회의실 선택'}</InputLabel>
                  <Select
                    name="selectedOption"
                    value={inputValues.selectedOption}
                    onChange={handleChange}
                  >
                    {availableOptions.map((option) => (
                      <MenuItem 
                        key={inputValues.reservationType === 'car' ? option.carId : option.roomId} 
                        value={inputValues.reservationType === 'car' ? option.carId : option.roomId}
                      >
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>목적</InputLabel>
                  <Select
                    name="purpose"
                    value={inputValues.purpose}
                    onChange={handleChange}
                  >
                    {inputValues.reservationType === 'car' ? (
                      [
                        <MenuItem key="BUSINESS" value="BUSINESS">업무</MenuItem>,
                        <MenuItem key="PERSONAL" value="PERSONAL">개인</MenuItem>,
                        <MenuItem key="MAINTENANCE" value="MAINTENANCE">정비</MenuItem>,
                        <MenuItem key="OTHER" value="OTHER">기타</MenuItem>
                      ]
                    ) : (
                      [
                        <MenuItem key="MEETING" value="MEETING">회의</MenuItem>,
                        <MenuItem key="WORKSHOP" value="WORKSHOP">워크샵</MenuItem>,
                        <MenuItem key="TRAINING" value="TRAINING">교육</MenuItem>,
                        <MenuItem key="OTHER" value="OTHER">기타</MenuItem>
                      ]
                    )}
                  </Select>
                </FormControl>
              </>
            )}
          </>
        )}

        <Box mt={2}>
          <Button onClick={handleSubmit} variant="contained" color="primary">추가</Button>
          <Button onClick={onCancel} variant="outlined" color="secondary" sx={{ ml: 2 }}>취소</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddModal;

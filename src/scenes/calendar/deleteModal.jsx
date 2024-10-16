import React from 'react';
import {Box, Button, Modal, Typography} from "@mui/material";

const DeleteModal = ({ isOpen, onCancel, onSubmit, title}) => {
    return (
        <Modal open={isOpen} onClose={onCancel}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -100%)',
                bgcolor: 'background.default',
                borderRadius: '5px',
                width: 400,
                boxShadow: 24,
                p: 4
            }}>
                <Typography variant="h3" component="h2">
                    {title}
                </Typography>
                <Box mt={2}>
                    <Button onClick={onSubmit} variant="contained" color="primary">확인</Button>
                    <Button onClick={onCancel} variant="outlined" color="secondary" sx={{ ml: 2 }}>취소</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default DeleteModal;
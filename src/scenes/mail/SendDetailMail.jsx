import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Typography,
    CircularProgress,
    IconButton,
    Button,
    useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { tokens } from '../../theme';

const SendDetailMail = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { mailId } = useParams();
    const navigate = useNavigate();
    const [mailDetail, setMailDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMailDetail = async () => {
            try {
                let response;
                if (mailType === 'sent') {
                    response = await axios.get(`http://localhost:8083/mail/sent/${mailId}`);
                } else if (mailType === 'trash') {
                    response = await axios.get(`http://localhost:8083/mail/trash/${mailId}`);
                }
                setMailDetail(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('메일 상세 조회 중 오류 발생: ', error);
                setLoading(false);
            }
        };

        fetchMailDetail();
    }, [mailType, mailId]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!mailDetail) {
        return (
            <Box p={3} textAlign="center">
                <Typography variant="h6" color="error">
                    메일을 불러올 수 없습니다.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                    뒤로 가기
                </Button>
            </Box>
        );
    }

    return (
        <Box p={5}>
            <Box display="flex" alignItems="center" mb={5}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h1"  color="textSecondary" fontWeight="bold">
                    {mailDetail.subject}
                </Typography>
            </Box>

            <Box mb={5}>
                <Typography variant="h3" color="textSecondary" mt={3}>
                    <strong>보낸 사람:</strong> {mailDetail.senderName} ({mailDetail.senderEmail})
                </Typography>
                <Typography variant="h3" color="textSecondary" mt={3}>
                    <strong>받는 사람:</strong> {mailDetail.recipientName} ({mailDetail.recipientEmail})
                </Typography>
                <Typography variant="h5" color="textSecondary" mt={3}>
                    {new Date(mailDetail.sentAt).toLocaleString()}
                </Typography>
            </Box>

            <Box p={2} border="1px solid #ccc" borderRadius="5px" bgcolor={colors.primary[400]}>
                <Typography variant="h3" whiteSpace="pre-line">
                    {mailDetail.body}
                </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                    variant="outlined"
                    onClick={() => navigate(`/read/1/${parseInt(mailId) - 1}`)}
                    disabled={parseInt(mailId) <= 1}
                >
                    이전 메일
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => navigate(`/read/1/${parseInt(mailId) + 1}`)}
                    disabled={parseInt(mailId) >= 617} // 총 메일 개수를 기준으로 설정
                >
                    다음 메일
                </Button>
            </Box>
        </Box>
    );
};

export default SendDetailMail;
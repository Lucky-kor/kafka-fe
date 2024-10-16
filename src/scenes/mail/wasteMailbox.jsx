import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Checkbox,
    IconButton,
    CircularProgress,
    useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { tokens } from '../../theme';
import { useNavigate } from 'react-router-dom';

const Waste = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [trashMails, setTrashMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        const fetchTrashMails = async () => {
            try {
                const response = await axios.get(`http://localhost:8083/mail/trash?page=${page}&size=10&sort=sentAt,DESC`);
                setTrashMails(response.data.data);
                setTotalPages(response.data.pageInfo.totalPages);
                setTotalElements(response.data.pageInfo.totalElements);
                setLoading(false);
            } catch (error) {
                console.error('휴지통 메일 조회 중 오류 발생: ', error);
                setLoading(false);
            }
        };
        fetchTrashMails();
    }, [page]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h2" mb={2}>휴지통 ({trashMails.length}개)</Typography>
            <Box display="flex" flexDirection="column">
                {trashMails.length === 0 ? (
                    <Typography variant="h5" textAlign="center" color="textSecondary">
                        휴지통이 비어있습니다.
                    </Typography>
                ) : (
                    trashMails.map((mail) => (
                        <Box
                            key={mail.trashMailId}
                            display="grid"
                            gridTemplateColumns="40px 200px auto 150px 40px"
                            alignItems="center"
                            p={2}
                            borderBottom="1px solid #ccc"
                        >
                            <Checkbox />
                            <Typography variant="h4" noWrap>{mail.recipientName || mail.recipientEmail}</Typography>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                noWrap
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/read/2/${mail.trashmailId}`)}
                            >
                                {mail.subject}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" textAlign="right">
                                {new Date(mail.sentAt).toLocaleString()}
                            </Typography>
                            <Box display="flex" gap={1}>
                                <IconButton>
                                    <RestoreIcon />
                                </IconButton>
                                <IconButton>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default Waste;

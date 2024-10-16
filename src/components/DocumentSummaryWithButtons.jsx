import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  useTheme
} from '@mui/material';

const DocumentSummaryWithButtons = () => {
  const [documents, setDocuments] = useState([]);
  const theme = useTheme();

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:8082/documents', {
        params: {
          page: 1,
          size: 10
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('문서 데이터를 가져오는 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper} sx={{ maxHeight: 250, overflow: 'auto', width: '100%' }}>
        <Table stickyHeader sx={{ tableLayout: 'auto', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{ fontSize: '0.75rem', padding: '2px', width: '20%' }}
              >
                종류
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: '0.75rem', padding: '2px', width: '30%' }}
              >
                제목
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: '0.75rem', padding: '2px', width: '15%' }}
              >
                작성자
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: '0.75rem', padding: '2px', width: '20%' }}
              >
                상태
              </TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell align="center">{doc.docsTypes?.type || 'N/A'}</TableCell>
                <TableCell align="center">{doc.title || '제목 없음'}</TableCell>
                <TableCell align="center">{doc.author}</TableCell>
                <TableCell align="center">
                  {doc.documentStatus === 'APPROVED' && (
                    <Typography color="blue" sx={{ fontSize: '0.7rem' }}>결재 완료</Typography>
                  )}
                  {doc.documentStatus === 'REJECTED' && (
                    <Typography color="red" sx={{ fontSize: '0.7rem' }}>반려</Typography>
                  )}
                  {doc.documentStatus === 'IN_PROGRESS' && (
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: theme.palette.mode === 'dark' ? 'white' : 'black'
                      }}
                    >결재 대기</Typography>
                  )}
                  {doc.documentStatus === 'DRAFT' && (
                    <Typography color="gray" sx={{ fontSize: '0.7rem' }}>임시 저장</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DocumentSummaryWithButtons;

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Table, TableBody, TableRow, TableCell, Typography,useTheme } from '@mui/material';
import ApprovalLineModal from './ApprovalLineModal';
import sendPostDocumentSubmitRequest from '../request/PostDoumentSubmit';
import sendPatchDocumentRequest from '../request/PatchDocument';
import axios from 'axios';
import {tokens} from "../theme";

const RewirteDocumentForm = ({ open, handleClose, initialData, isRewriting, fetchDocuments }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [customFields, setCustomFields] = useState({});
  const [approvalLines, setApprovalLines] = useState([]);
  const [workflowId, setWorkflowId] = useState(null);
  const [openApprovalLineModal, setOpenApprovalLineModal] = useState(false);
  const [documentTypeId, setDocumentTypeId] = useState('');
  const [employeeId, setEmployeeId] = useState(null);
  const [errors, setErrors] = useState({}); // 오류 상태 관리
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // 사용자 정보를 가져오는 함수
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get("http://localhost:8081/employees/my-info", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const { employeeId } = response.data.data;
      setEmployeeId(employeeId);
    } catch (error) {
      console.error("로그인된 사용자 정보를 가져오는 중 오류 발생:", error);
    }
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 초기 데이터로 폼 필드 초기화
  useEffect(() => {
    if (initialData) {
      console.log("Initial Data: ", initialData);
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setCustomFields(initialData.customFields || {});
      setApprovalLines(initialData.workFlow?.approvals || []);
      setWorkflowId(initialData.workFlow?.workflowId || null);

      // documentTypeId 초기화
      if (initialData.docsTypes?.id) {
        setDocumentTypeId(initialData.docsTypes.id);
        console.log("documentTypeId 초기화: ", initialData.docsTypes.id);
      } else {
        console.warn("documentTypeId가 없습니다.");
      }

      // documentId 확인
      if (initialData.id) {
        console.log("Document ID exists, this will be a patch request.");
      } else {
        console.log("No Document ID found, this will be a post request.");
      }
    }
  }, [initialData]);

  const handleFieldChange = (fieldName, value) => {
    setCustomFields(prev => ({
      ...prev,
      [fieldName]: value,
    }));

    // 오류 메시지 제거
    if (errors.customFields && errors.customFields[fieldName]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.customFields[fieldName];
        return newErrors;
      });
    }
  };

  const handleOpenApprovalLineModal = () => {
    setOpenApprovalLineModal(true);
  };

  const handleCloseApprovalLineModal = () => {
    setOpenApprovalLineModal(false);
  };

  const handleApprovalLineSubmit = (selectedApprovals, workflowId) => {
    setApprovalLines(selectedApprovals);
    setWorkflowId(workflowId);
    setOpenApprovalLineModal(false);

    // 오류 메시지 제거
    if (errors.workflowId) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors.workflowId;
        return newErrors;
      });
    }
  };

  // 문서 제출 요청
  const handleSubmitDocument = async () => {
    let newErrors = {};

    if (!title) {
      newErrors.title = '제목을 입력해주세요.';
    }

    if (!content) {
      newErrors.content = '내용을 입력해주세요.';
    }

    if (!workflowId) {
      newErrors.workflowId = '결재라인을 설정해주세요.';
    }

    // 커스텀 필드 검증
    for (const key in customFields) {
      if (!customFields[key]) {
        if (!newErrors.customFields) {
          newErrors.customFields = {};
        }
        newErrors.customFields[key] = '필수 필드입니다.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 오류가 없으면 오류 상태 초기화
    setErrors({});

    const requestBody = {
      documentTypeId: documentTypeId,
      workflowId: Number(workflowId),
      title,
      content,
      employeeId: employeeId,
      customFields,
    };

    console.log("Request Body (Submit Document):", requestBody);

    // PATCH 요청인지 POST 요청인지 확인하여 구분
    if (initialData && initialData.id) {
      await sendPatchDocumentRequest(initialData.id, requestBody, () => {
        console.log("문서 제출 완료 (PATCH 요청)");
        handleClose();
        fetchDocuments();
      });
    } else {
      await sendPostDocumentSubmitRequest(requestBody, () => {
        console.log("문서 제출 완료 (POST 요청)");
        handleClose();
        fetchDocuments();
      });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>문서 작성</DialogTitle>
      <DialogContent>
        <Box>
          {/* 문서 제목 입력 */}
          <TextField
            label="문서 제목"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors(prevErrors => ({ ...prevErrors, title: null }));
              }
            }}
            sx={{ marginBottom: '20px' }}
            error={!!errors.title}
            helperText={errors.title}
          />

          {/* 문서 내용 입력 */}
          <TextField
            label="문서 내용"
            fullWidth
            variant="outlined"
            multiline
            rows={6}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) {
                setErrors(prevErrors => ({ ...prevErrors, content: null }));
              }
            }}
            sx={{ marginBottom: '20px' }}
            error={!!errors.content}
            helperText={errors.content}
          />

          {/* 커스텀 필드 입력 */}
          {Object.keys(customFields).map((field, index) => (
            <Box key={index} sx={{ marginBottom: '20px' }}>
              <TextField
                label={field}
                fullWidth
                variant="outlined"
                value={customFields[field]}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                error={!!(errors.customFields && errors.customFields[field])}
                helperText={errors.customFields && errors.customFields[field]}
              />
            </Box>
          ))}

          {/* 결재라인 설정 */}
          <Button variant="contained" onClick={handleOpenApprovalLineModal} sx={{ marginBottom: '20px' }}>
            결재라인 설정
          </Button>
          {errors.workflowId && (
            <Typography color="error" sx={{ marginBottom: '20px' }}>
              {errors.workflowId}
            </Typography>
          )}

          {/* 결재라인 테이블 */}
          <Table>
            <TableBody>
              {approvalLines.map((approver, index) => (
                <TableRow key={index}>
                  <TableCell>{approver.position}</TableCell>
                  <TableCell>{approver.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmitDocument} color="primary">제출</Button>
        <Button onClick={handleClose} color="secondary">닫기</Button>
      </DialogActions>

      {/* 결재라인 설정 모달 */}
      <ApprovalLineModal
        open={openApprovalLineModal}
        handleClose={handleCloseApprovalLineModal}
        onSubmit={handleApprovalLineSubmit}
      />
    </Dialog>
  );
};

export default RewirteDocumentForm;

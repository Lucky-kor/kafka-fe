import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme, Box, Modal, Typography, Table, TableBody, TableCell, TableRow, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import RewirteDocumentForm from './RewriteDocumentForm';
import ApprovalTable from "./ApprovalTable";
import getEmployee from "../request/GetEmployee";
import Swal from "sweetalert2";
import { tokens } from "../theme";

const DocumentModal = ({ documentId, handleClose, fetchDocuments }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const mode = theme.palette.mode;
    const [documentData, setDocumentData] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
    const [openMessageModal, setOpenMessageModal] = useState(false);
    const [openRewirteDocumentForm, setOpenRewirteDocumentForm] = useState(false);
    const [selectedApprovalId, setSelectedApprovalId] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get("http://localhost:8081/employees/my-info", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
                const { name, departmentName, employeeRank, employeeId } = response.data.data;
                setUserInfo({ name, departmentName, employeeRank, employeeId });
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchUserInfo();
    }, []);

    const fetchDocumentData = async () => {
        if (!documentId) {
            console.error("문서 ID가 올바르게 전달되지 않았습니다.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8082/documents/${documentId}`);
            const data = response.data.data;

            if (data) {
                const approvals = data.workFlow?.approvals || [];
                const sortedApprovals = approvals.sort((a, b) => a.approvalOrder - b.approvalOrder);

                const approvalsWithInfo = await Promise.all(sortedApprovals.map(async (approval) => {
                    const employeeInfo = await getEmployee(approval.employeeId);
                    return {
                        ...approval,
                        name: employeeInfo?.name || "Unknown",
                        position: employeeInfo?.employeeRank || "Unknown"
                    };
                }));

                setDocumentData({
                    ...data,
                    workFlow: {
                        ...data.workFlow,
                        approvals: approvalsWithInfo
                    }
                });
            }
        } catch (err) {
            console.error("오류 발생:", err);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchDocumentData();
            setIsOpen(true);
        }
    }, [documentId]);

    if (!documentData || !userInfo) {
        return null;
    }

    const handleApprovalAction = (approvalId, approvalOrder) => {
        const currentApprover = documentData.workFlow?.approvals.find(
            approval => approval.approvalOrder === documentData.workFlow.currentStep + 1
        );

        if (currentApprover && currentApprover.employeeId === userInfo.employeeId) {
            setSelectedApprovalId(currentApprover.id);
            setOpenMessageModal(true);
        } else {
            Swal.fire({
                title: "결재 오류",
                text: "현재 결재 순서가 아닙니다.",
                icon: "error",
                confirmButtonText: "확인",
                backdrop: false,
            });
        }
    };

    const handleCloseMessageModal = () => {
        setOpenMessageModal(false);
    };

    const handleReWrite = () => {
        setOpenRewirteDocumentForm(true); // RewirteDocumentForm 열기
    };

    const handleCloseRewirteDocumentForm = () => {
        setOpenRewirteDocumentForm(false); // RewirteDocumentForm 닫기
        fetchDocumentData(); // 문서 데이터 갱신
    };

    const handleCloseModal = async () => {
        await fetchDocumentData();
        handleClose();
    };

    const handleConfirmApproval = async (status) => {
        try {
            const response = await axios.patch('http://localhost:8082/workflows', {
                id: selectedApprovalId,
                approvalOrder: documentData.workFlow.currentStep + 1,
                approvalStatus: status,
                message: message,
                employeeId: userInfo.employeeId
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                const updatedWorkflow = response.data.data;
                setDocumentData((prevData) => ({
                    ...prevData,
                    workFlow: updatedWorkflow
                }));
                setOpenMessageModal(false);
                Swal.fire({
                    title: "결재 완료",
                    text: "결재가 성공적으로 처리되었습니다.",
                    icon: "success",
                    confirmButtonText: "확인",
                });
                await fetchDocumentData(); // Refresh document data
            }
        } catch (error) {
            console.error("Error during approval:", error);
            Swal.fire({
                title: "결재 오류",
                text: "결재 처리 중 오류가 발생했습니다.",
                icon: "error",
                confirmButtonText: "확인",
            });
        }
    };

    return (
        <Modal open={isOpen} onClose={handleCloseModal}>
            <Box sx={{
                width: "50%",
                maxHeight: "80vh",
                overflow: "auto",
                padding: 4,
                fontsize: "1 rem",
                backgroundColor: mode === 'dark' ? colors.primary[300] : theme.palette.background.paper,
                color: mode === 'dark' ? theme.palette.text.primary : 'black',
                margin: "100px auto",
                position: "relative"
            }}>
                <IconButton
                    aria-label="close"
                    onClick={handleCloseModal}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'black',
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h5" textAlign="center" mb={4} fontWeight="bold" fontSize={40} sx={{ color: mode === 'dark' ? 'white' : 'black' }}>
                    {documentData.docsTypes.documentTemplate.templateName}
                </Typography>

                {/* 다시작성 버튼 */}
                {documentData.author === userInfo.name && documentData.documentStatus === 'DRAFT' && (
                    <Button
                        variant="contained"
                        onClick={handleReWrite}
                        sx={{ position: "absolute", top: 16, right: 80 }}
                    >
                        다시 작성
                    </Button>
                )}

                {/* RewirteDocumentForm 렌더링 */}
                {openRewirteDocumentForm && (
                    <RewirteDocumentForm
                        open={openRewirteDocumentForm}
                        handleClose={handleCloseRewirteDocumentForm}
                        initialData={documentData}
                        fetchDocuments={fetchDocumentData} // 필요에 따라 문서 목록 갱신 함수 전달
                    />
                )}

                <Box sx={{ mb: 6 }} />
                <Box sx={{ display: "block", position: "left", width: "15em", textAlign: "center", marginBottom: "20px" }}>
                    <ApprovalTable
                        approvalLines={documentData.workFlow?.approvals || []}
                        handleApprovalClick={handleApprovalAction}
                    />
                </Box>

                <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
                    <TableBody>
                        {/* 문서 정보 표시 */}
                        <TableRow>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, fontWeight: "bold", width: "20%", color: mode === 'dark' ? 'white' : 'black' }}>문서번호</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, color: mode === 'dark' ? 'white' : 'black' }}>{documentData.documentCode}</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>작성일자</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, color: mode === 'dark' ? 'white' : 'black' }}>{documentData.createdAt.substring(0, 10)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>작성자</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, color: mode === 'dark' ? 'white' : 'black' }}>{documentData.author}</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>부서</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, color: mode === 'dark' ? 'white' : 'black' }}>{documentData.departmentName}</TableCell>
                        </TableRow>

                        {/* 커스텀 필드 표시 */}
                        {documentData.customFields &&
                            Object.keys(documentData.customFields).map((field, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>{field}</TableCell>
                                    <TableCell colSpan={3} sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, color: mode === 'dark' ? 'white' : 'black' }}>
                                        {documentData.customFields[field]}
                                    </TableCell>
                                </TableRow>
                            ))}

                        {/* 문서 내용 표시 */}
                        <TableRow>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>내용</TableCell>
                            <TableCell colSpan={3} sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[700]}`, color: mode === 'dark' ? 'white' : 'black' }}>
                                {documentData.content}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                {/* 결재 내역 표시 부분 */}
                <Box sx={{ mt: 4 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: "bold",
                            mb: 2,
                            color: mode === "dark" ? "black" : "black",
                        }}
                    >
                        [결재 내역]
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {documentData.workFlow.approvals
                            .filter(
                                (approval) =>
                                    approval.approvalOrder !== 0 &&
                                    (approval.approvalStatus === "APPROVE" ||
                                        approval.approvalStatus === "REJECT" ||
                                        approval.approvalStatus === "FINALIZE")
                            )
                            .map((approval, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        border: `1px solid ${mode === "dark"
                                                ? theme.palette.grey[700]
                                                : theme.palette.grey[300]
                                            }`,
                                        borderRadius: 2,
                                        padding: 2,
                                        backgroundColor:
                                            mode === "dark" ? colors.primary[500] : colors.blueAccent[800],
                                    }}
                                >
                                    <Typography variant="body1" sx={{ fontWeight: "bold", color: "white" }}>
                                        {approval.name} ({approval.position})
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: theme.palette.grey[300] }}>
                                        승인 상태:{" "}
                                        {approval.approvalStatus === "APPROVE"
                                            ? "승인"
                                            : approval.approvalStatus === "REJECT"
                                                ? "반려"
                                                : "전결"}
                                    </Typography>
                                    {approval.message ? (
                                        <Typography variant="body2" sx={{ mt: 1, color: "white" }}>
                                            메세지: {approval.message}
                                        </Typography>
                                    ) : (
                                        <Typography
                                            variant="body2"
                                            sx={{ mt: 1, fontStyle: "italic", color: theme.palette.grey[400] }}
                                        >
                                            메세지가 없습니다.
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                    </Box>
                </Box>
                <Dialog open={openMessageModal} onClose={handleCloseMessageModal}>
                    <DialogTitle>메시지 입력</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="메시지"
                            fullWidth
                            variant="outlined"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => handleConfirmApproval('APPROVE')}>승인</Button>
                        <Button onClick={() => handleConfirmApproval('REJECT')}>반려</Button>
                        <Button onClick={() => handleConfirmApproval('FINALIZE')}>전결</Button>
                        <Button onClick={handleCloseMessageModal}>취소</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Modal >
    );
};

export default DocumentModal;

import { Box, useTheme, MenuItem, Select, FormControl, InputLabel, Button } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Header } from "../../components";
import getDocumentAllRequest from "../../request/GetDocuments";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import TableModal from '../../components/TableModal';
import DocumentModal from "../../components/DocumentModal";
import NewDocumentForm from '../../components/NewDocumentForm';
import axios from 'axios';

const Elec = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
    const [approvalLines, setApprovalLines] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [employeeId, setEmployeeId] = useState(null);
    const [employeeName, setEmployeeName] = useState(''); // 사용자 이름 추가
    const [selectedRows, setSelectedRows] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    const [approvalStatus, setApprovalStatus] = useState({
        0: null,
        1: null,
        2: null,
    });

    const [showMyDocuments, setShowMyDocuments] = useState(false); // 작성자 문서 보기 상태
    const [showApproverDocuments, setShowApproverDocuments] = useState(false); // 승인자 문서 보기 상태

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get("http://localhost:8081/employees/my-info", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            const { employeeId, name, role } = response.data.data;
            setEmployeeId(employeeId);
            setEmployeeName(name); // 사용자 이름 설정
            setIsAdmin(role === 'ADMIN');
        } catch (error) {
            console.error("로그인된 사용자 정보를 가져오는 중 오류 발생:", error);
        }
    };

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await getDocumentAllRequest({}, {}, 1, 1000, setList, setIsLoading);
            if (response?.data?.data && Array.isArray(response.data.data)) {
                const documents = response.data.data;
                setList(documents);
                // 초기 필터링 적용
                filterDocuments(documents);
                setIsLoading(false);
            } else {
                console.error("데이터를 찾을 수 없습니다.");
                setList([]);
                setFilteredData([]);
                setIsLoading(false);
            }
        } catch (err) {
            console.error("오류 발생:", err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
        fetchDocuments();
    }, []);

    const filterDocuments = (documents = list) => {
        let filtered = documents;

        // 로그인한 사용자가 작성자이거나 승인자인 문서만 필터링
        filtered = filtered.filter(item =>
            item.author === employeeName ||
            (item.workFlow && item.workFlow.approvals &&
                item.workFlow.approvals.some(approval => approval.employeeId === employeeId))
        );

        // 결재 상태 필터링
        if (selectedStatus !== "all") {
            filtered = filtered.filter(item => item.documentStatus === selectedStatus);
        }

        // 버튼 필터링
        if (showMyDocuments && !showApproverDocuments) {
            filtered = filtered.filter(item => item.author === employeeName);
        } else if (!showMyDocuments && showApproverDocuments) {
            filtered = filtered.filter(item =>
                item.workFlow && item.workFlow.approvals &&
                item.workFlow.approvals.some(approval => approval.employeeId === employeeId)
            );
        }
        // 둘 다 선택되지 않은 경우에는 작성자이거나 승인자인 문서를 그대로 사용

        setFilteredData(filtered);
    };

    useEffect(() => {
        filterDocuments();
    }, [list, selectedStatus, showMyDocuments, showApproverDocuments]);

    const handleStatusChange = (event) => {
        const status = event.target.value;
        setSelectedStatus(status);
    };

    const handleDocumentClick = (documentId) => {
        if (documentId) {
            console.log("문서 ID:", documentId);
            setSelectedDocumentId(documentId);
            setIsModalOpen(true);
            console.log("모달 열림 상태:", isModalOpen);
        } else {
            console.error("문서 ID가 올바르게 전달되지 않았습니다.");
        }
    };

    const handleOpenDocumentForm = () => {
        console.log("결재작성 버튼이 클릭됨");
        setIsDocumentFormOpen(true);
        console.log("isDocumentFormOpen 상태:", isDocumentFormOpen);
    };

    const handleCloseDocumentForm = () => {
        console.log("문서 작성 모달 닫힘");
        setIsDocumentFormOpen(false);
        fetchDocuments();
    };

    const handleDeleteDocuments = async () => {
        if (selectedRows.length === 0) {
            alert("삭제할 문서를 선택하세요.");
            return;
        }

        console.log("삭제할 문서 ID들:", selectedRows);

        const deletableRows = list.filter(row => selectedRows.includes(row.id) && (isAdmin || (row.employeeId === employeeId && row.documentStatus === 'DRAFT')));
        const deletableIds = deletableRows.map(row => row.id);

        if (deletableIds.length === 0) {
            alert("삭제할 수 있는 문서가 없습니다.");
            return;
        }

        try {
            const response = await axios.delete('http://localhost:8082/documents', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    deleteIds: deletableIds,
                },
                params: {
                    employeeId: employeeId,
                },
            });
            if (response.status === 204) {
                console.log("문서 삭제 완료");
                fetchDocuments();
                setSelectedRows([]);
            }
        } catch (error) {
            console.error("문서 삭제 중 오류 발생: ", error);
        }
    };

    const columns = [
        {
            field: "documentCode",
            headerName: "문서번호",
            flex: 1,
            renderCell: (params) => (
                <Button
                    onClick={() => handleDocumentClick(params.row.id)}
                    sx={{
                        color: colors.gray[100],
                        textTransform: 'none',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: 'transparent',
                            color: '#74ade2',
                        }
                    }}
                >
                    {params.value}
                </Button>
            )
        },
        { field: "docsTypes.type", headerName: "종류", flex: 1, valueGetter: (params) => params.row.docsTypes?.type || "N/A" },
        { field: "title", headerName: "제목", flex: 1, valueGetter: (params) => params.row.title || "N/A" },
        { field: "author", headerName: "작성자", flex: 1 },
        { field: "departmentName", headerName: "부서", flex: 1 },
        { field: "createdAt", headerName: "작성일", flex: 1, valueGetter: (params) => params.row.createdAt?.substring(0, 10) || "N/A" },
        {
            field: "documentStatus", headerName: "상태", flex: 1, valueGetter: (params) => {
                switch (params.value) {
                    case "DRAFT": return "임시 저장";
                    case "IN_PROGRESS": return "결재 중";
                    case "APPROVED": return "승인 완료";
                    case "REJECTED": return "반려";
                    default: return "전체 보기";
                }
            }
        },
    ];

    return (
        <div>
            {isLoading && <p>로딩 중...</p>}
            <Box m="20px">
                <Header title="전자결재" subtitle="List of Approval Documents" />

                <Box mb="20px" display="flex" justifyContent="flex-end">
                    <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                        <InputLabel id="status-select-label">결재 상태</InputLabel>
                        <Select
                            labelId="status-select-label"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            label="결재 상태"
                        >
                            <MenuItem value="all">모두 보기</MenuItem>
                            <MenuItem value="DRAFT">임시 저장</MenuItem>
                            <MenuItem value="IN_PROGRESS">결재 중</MenuItem>
                            <MenuItem value="APPROVED">승인 완료</MenuItem>
                            <MenuItem value="REJECTED">반려</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box display="flex" justifyContent="flex-end" mb="10px" gap={2}>
                    <Button
                        onClick={handleOpenDocumentForm}
                        variant="contained"
                        sx={{
                            width: '200px',
                            height: '50px',
                            fontSize: '15px',
                            backgroundColor: '#1c8adb',
                            color: colors.gray[200],
                            '&:hover': { backgroundColor: '#b6b6b6ac' },
                        }}
                    >
                        + 결재 작성
                    </Button>
                </Box>
                <Box mt="20px" />

                <Box display="flex" justifyContent="flex-end" mb="10px" gap={2}>
                    {/* 작성자 문서 보기 버튼 */}
                    <Button
                        onClick={() => {
                            setShowMyDocuments(!showMyDocuments);
                            if (showApproverDocuments && !showMyDocuments) {
                                setShowApproverDocuments(false);
                            }
                        }}
                        variant={showMyDocuments ? "contained" : "outlined"}
                        sx={{
                            width: '100px', height: '40px', border: "1px solid #5c5555ea", color: colors.gray[900],
                            backgroundColor: showMyDocuments ? '#1c8adb' : '#686ffa0',

                            '&:hover': {
                                backgroundColor: '#ffffff5d',
                            },
                        }}
                    >
                        작성 문서함
                    </Button>
                    {/* 승인자 문서 보기 버튼 */}
                    <Button
                        onClick={() => {
                            setShowApproverDocuments(!showApproverDocuments);
                            if (showMyDocuments && !showApproverDocuments) {
                                setShowMyDocuments(false);
                            }
                        }}
                        variant={showApproverDocuments ? "contained" : "outlined"}
                        sx={{
                            width: '100px', height: '40px', border: "1px solid #5c5555ea", color: colors.gray[900],
                            backgroundColor: showApproverDocuments ? '#1c8adb' : '#686ffa0',

                            '&:hover': {
                                backgroundColor: '#ffffff5d',
                            },
                        }}
                    >
                        결재 문서함
                    </Button>
                    {/* 삭제 버튼 */}
                    <Button
                        onClick={handleDeleteDocuments}
                        variant="outlined"
                        sx={{
                            width: '100px',
                            height: '40px',
                            fontSize: '12px',
                            color: colors.gray[900],
                            backgroundColor: colors.gray[150],
                            border: "1px solid #5c5555ea"
                        }}
                    >
                        삭제 ({selectedRows.length})
                    </Button>
                </Box>

                <Box
                    mt="10px"
                    height="75vh"
                    maxWidth="100%"
                    sx={{
                        "& .MuiDataGrid-root": { border: "none" },
                        "& .MuiDataGrid-cell": { border: "none" },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#1c8adb",
                            borderBottom: "none",
                            color: colors.gray[200],
                        },
                        "& .MuiDataGrid-footerContainer": {
                            borderTop: "none",
                            color: colors.gray[200],
                            backgroundColor: "#1c8adb",
                        },
                        "& .MuiCheckbox-root": {
                            color: `${colors.blueAccent[100]} !important`,
                        },
                        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                            color: `${colors.gray[100]} !important`,
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            backgroundColor: colors.primary[400],
                        }
                    }}
                >
                    <DataGrid
                        rows={filteredData}
                        columns={columns}
                        components={{ Toolbar: GridToolbar }}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        pageSizeOptions={[10, 20, 50]}
                        checkboxSelection
                        onRowSelectionModelChange={(newSelectionModel) => {
                            console.log("Selected row IDs:", newSelectionModel);
                            setSelectedRows(newSelectionModel);
                        }}
                        rowSelectionModel={selectedRows}
                    />
                </Box>
            </Box>

            {approvalLines.length > 0 && (
                <TableModal
                    open={isModalOpen}
                    handleClose={() => setIsModalOpen(false)}
                    approvalLines={approvalLines}
                    approvalStatus={approvalStatus}
                    handleApprove={() => { }}
                    currentUser={employeeId}
                />
            )}

            {isModalOpen && (
                <DocumentModal
                    documentId={selectedDocumentId}
                    handleClose={() => setIsModalOpen(false)}
                />
            )}

            {/* NewDocumentForm 렌더링 */}
            {isDocumentFormOpen && (
                <NewDocumentForm
                    open={isDocumentFormOpen}
                    handleClose={handleCloseDocumentForm}
                    fetchDocuments={fetchDocuments}
                />
            )}

        </div>
    );
};

export default Elec;

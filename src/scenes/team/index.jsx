import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, useTheme, Modal } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import CircleIcon from '@mui/icons-material/Circle';

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/auth/employees/all?page=${page + 1}&size=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      const data = response.data.data;
      const formattedEmployees = data.map((employee) => ({
        id: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        departmentName: employee.departmentName,
        employeeRank: translateRank(employee.employeeRank),
        status: employee.status
      }));

      setEmployees(formattedEmployees);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const translateRank = (rank) => {
    switch (rank) {
      case "INTERN":
        return "인턴";
      case "STAFF":
        return "사원";
      case "SENIOR_STAFF":
        return "주임";
      case "ASSISTANT_MANAGER":
        return "대리";
      case "MANAGER":
        return "과장";
      case "SENIOR_MANAGER":
        return "차장";
      case "DIRECTOR":
        return "부장";
      default:
        return rank;
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:8081/auth/employees/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      setSelectedEmployee(response.data.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  const deleteEmployee = async () => {
    if (window.confirm("정말로 이 직원을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`http://localhost:8081/auth/employees/${selectedEmployee.employeeId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        alert("직원이 성공적으로 삭제되었습니다.");
        setIsModalOpen(false);
        fetchEmployees();
      } catch (error) {
        console.error("직원 삭제 중 오류가 발생했습니다.", error);
        alert("직원 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, pageSize]);

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: "이름",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    { field: "email", headerName: "이메일", flex: 1 },
    { field: "phoneNumber", headerName: "전화번호", flex: 1 },
    { field: "departmentName", headerName: "부서명", flex: 1 },
    { field: "employeeRank", headerName: "직급", flex: 1 },
    {
      field: "status",
      headerName: "활동 중",
      flex: 1,
      renderCell: (params) => (
        <CircleIcon
          style={{
            color: params.value === "로그인" ? colors.greenAccent[500] : colors.gray[500],
          }}
        />
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="주소록" subtitle="전체 직원 목록" />

      <Box
        mt="40px"
        height="75vh"
        flex={1}
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            border: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[500],
            borderBottom: "none",
            color: colors.gray[200],
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[500],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-iconSeparator": {
            color: colors.primary[100],
          },
        }}
      >
        <DataGrid
          rows={employees}
          columns={columns}
          loading={loading}
          pagination
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          checkboxSelection
          onSelectionModelChange={(newSelection) => {
            setSelectedIds(newSelection);  // 체크박스 선택 시 ID 업데이트
          }}
          onRowClick={(params) => fetchEmployeeDetails(params.row.id)}
        />
      </Box>

      {/* 직원 상세 정보 모달 */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "#2d3e50",
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
            color: "#fff",
          }}
        >
          {selectedEmployee ? (
            <Box>
              <Typography 
                variant="h5" 
                component="h2" 
                gutterBottom 
                sx={{ textAlign: "center", fontWeight: "bold", fontSize: "20px", mb: 3 }} 
              >
                직원 정보
              </Typography>

              <Box mb={2} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img
                  src={selectedEmployee.profilePicture || "/src/assets/images/avatar.png"}
                  alt="프로필"
                  style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: "50%", 
                    objectFit: "cover", 
                  }}
                />
              </Box>

              {/* 필드들 사이에 구분선 추가 */}
              <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                <strong>이름:</strong> {selectedEmployee.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                <strong>이메일:</strong> {selectedEmployee.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                <strong>전화번호:</strong> {selectedEmployee.phoneNumber}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                <strong>부서:</strong> {selectedEmployee.departmentName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                <strong>직급:</strong> {selectedEmployee.employeeRank}
              </Typography>

              {/* 관리자일 때만 보여줄 추가 정보 */}
              {localStorage.getItem("username") === "admin@pingpong-works.com" ? (
                <>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>긴급 연락처:</strong> {selectedEmployee.emergencyNumber || "없음"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>차량 번호:</strong> {selectedEmployee.vehicleNumber || "없음"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>주소:</strong> {selectedEmployee.address || "없음"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>입사 일:</strong> {new Date(selectedEmployee.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>상태:</strong> {selectedEmployee.status === "LOGGED_IN" ? "로그인 상태" : "로그아웃 상태"}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>내선 번호:</strong> {selectedEmployee.extensionNumber}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>긴급 연락처:</strong> {selectedEmployee.emergencyNumber || "없음"}
                  </Typography>
                </>
              )}

              <Box mt={4} sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* 직원 삭제 버튼 */}
                <button
                  style={{
                    backgroundColor: colors.blueAccent[500], // 확인 버튼과 동일한 스타일
                    color: "#fff",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = colors.blueAccent[700]} 
                  onMouseOut={(e) => e.target.style.backgroundColor = colors.blueAccent[500]}
                  onClick={deleteEmployee}
                >
                  직원 삭제
                </button>

                {/* 확인 버튼 */}
                <button
                  style={{
                    backgroundColor: colors.blueAccent[500], // 기존 확인 버튼 색상 고정
                    color: "#fff",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = colors.blueAccent[700]} 
                  onMouseOut={(e) => e.target.style.backgroundColor = colors.blueAccent[500]}
                  onClick={() => setIsModalOpen(false)}
                >
                  확인
                </button>
              </Box>
            </Box>
          ) : (
            <Typography>로딩 중...</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Team;

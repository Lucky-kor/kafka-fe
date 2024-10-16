import { Box, useTheme, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Header } from "../../components/index.jsx";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { mockDataContacts } from "../../data/mockData.js";
import { tokens } from "../../theme.js";
import axios from "axios";
import { useEffect, useState } from "react";

const Mine = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [list, setList] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const getStatusCount = () => {
        axios.post("/elecapp/receivedApp", { memberId: "1" }) // 실제 멤버 ID로 교체 필요
            .then(res => {
                setList(res.data);
                setFilteredData(res.data);
            })
            .catch(err => console.error("오류 발생:", err));
    };
    useEffect(() => {
        getStatusCount();
    }, []);
    const handleStatusChange = (event) => {
        const status = event.target.value;
        setSelectedStatus(status);
        if (status === "all") {
            setFilteredData(list);
        } else {
            setFilteredData(
                list.filter(item => {
                    switch (status) {
                        case "ready":
                            return item.approveType === 0;
                        case "ing":
                            return item.approveType === 2;
                        case "done":
                            return item.approveType === 3;
                        default:
                            return true;
                    }
                })
            );
        }
    };
    const columns = [
        {
            field: "title",
            headerName: "제목",
            flex: 1,
            valueGetter: (params) =>
                params.row.additionalFields?.title || "휴가신청서",
        },
        { field: "writer", headerName: "작성자", flex: 1 },
        { field: "department", headerName: "부서", flex: 1 },
        {
            field: "writeday",
            headerName: "",
            flex: 1,
            valueGetter: (params) =>
                params.value ? params.value.substring(0, 10) : "N/A",
        }

    ];
    return (
        //읽은 메일 , 안읽은 메일 설정 따로 필요함.

        <Box m="20px">
            <Header title="전체 메일함" subtitle="List of TotalMail" />
            <Box mb="20px" display="flex" justifyContent="flex-end">
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel id="status-select-label">결재 상태</InputLabel>
                    <Select
                        labelId="status-select-label"
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        label="수신 상태"
                    >
                        <MenuItem value="all">전체 보기</MenuItem>
                        <MenuItem value="ready">안 읽은 메일</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box
                mt="40px"
                height="75vh"
                maxWidth="100%"
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
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-iconSeparator": {
                        color: colors.primary[100],
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.gray[100]} !important`,
                    },
                }}
            >
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    components={{ Toolbar: GridToolbar }}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    checkboxSelection
                />
            </Box>
        </Box>
    );
};

export default Mine;
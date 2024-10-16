import {
  Box,
  IconButton,
  InputBase,
  useTheme,
  Typography,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { SearchOutlined, AddOutlined } from "@mui/icons-material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Boards = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0); 
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 1 });
  const [keyword, setKeyword] = useState("");
  const [searchOption, setSearchOption] = useState("title");
  const [category, setCategory] = useState("all");
  const [sortOption, setSortOption] = useState("createdAt_desc");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (page) => {
    setLoading(true); 
    try {
      const response = await axios.get("http://localhost:8084/boards", {
        params: {
          keyword: keyword,
          searchOption: searchOption,
          sort: sortOption,
          page: page,
          size: 10,
          category: category,
        },
      });

      const filteredData = response.data.data.map((item) => ({
        id: item.boardId,
        boardId: item.boardId,
        title: `[${item.category}] ${item.title}`,
        employeeName: item.employeeName || '익명',
        category: item.category,
        createdAt: item.createdAt,
        views: item.views,
      }));

      setData(filteredData);
      setPageInfo({
        totalElements: response.data.pageInfo.totalElements,
        totalPages: response.data.pageInfo.totalPages,
      });
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  }, [sortOption, category]);

  const handleSearch = () => {
    setPage(0);
    fetchData(0); 
  };

  const handleSearchOptionChange = (event) => {
    setSearchOption(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(0);
    fetchData(0);
  };

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  const handleRowClick = (params) => {
    navigate(`/viewBoard/${params.id}`);
  };

  const columns = [
    { field: "boardId", headerName: "No", headerAlign: "center", align: "center" },
    {
      field: "title",
      headerName: "제목",
      flex: 2,
      headerAlign: "center",
      align: "center",
      cellClassName: "name-column--cell",
    },
    {
      field: "employeeName",
      headerName: "작성자",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "createdAt",
      headerName: "등록일",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <Typography>{params.row.createdAt.split("T")[0]}</Typography>,
    },
    {
      field: "views",
      headerName: "조회수",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Typography color={colors.greenAccent[500]}>{params.row.views}</Typography>
      ),
    },
  ];


  const totalPagesToShow = 10;
  const currentPageGroup = Math.floor(page / totalPagesToShow);

  const visiblePages = Array.from(
    { length: Math.min(totalPagesToShow, pageInfo.totalPages - currentPageGroup * totalPagesToShow) },
    (_, i) => currentPageGroup * totalPagesToShow + i
  );

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  const handlePreviousPageGroup = () => {
    if (currentPageGroup > 0) {
      setPage((currentPageGroup - 1) * totalPagesToShow);
    }
  };

  const handleNextPageGroup = () => {
    if ((currentPageGroup + 1) * totalPagesToShow < pageInfo.totalPages) {
      setPage((currentPageGroup + 1) * totalPagesToShow);
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Boards" subtitle={`List of Boards`} />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddOutlined />}
          onClick={() => navigate("createBoard")}
          sx={{
            height: "50px",
            padding: "0 20px",
            backgroundColor: colors.greenAccent[500],
            fontSize: "16px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: colors.greenAccent[700],
            },
          }}
        >
          작성하기
        </Button>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bgcolor={colors.primary[400]}
        borderRadius="3px"
        p={2}
        mb={2}
      >
        <Box display="flex" alignItems="center" flexGrow={1}>
          <Select
            value={category}
            onChange={handleCategoryChange}
            sx={{
              color: colors.gray[100],
              backgroundColor: colors.primary[500],
              mr: 2,
            }}
          >
            <MenuItem value="all">전체</MenuItem>
            <MenuItem value="공지">공지</MenuItem>
            <MenuItem value="식단">식단</MenuItem>
            <MenuItem value="일반">일반</MenuItem>
            <MenuItem value="질문">질문</MenuItem>
          </Select>

          <Select
            value={searchOption}
            onChange={handleSearchOptionChange}
            sx={{
              color: colors.gray[100],
              backgroundColor: colors.primary[500],
              mr: 2,
            }}
          >
            <MenuItem value="title">제목</MenuItem>
            <MenuItem value="content">내용</MenuItem>
            <MenuItem value="title_content">제목+내용</MenuItem>
            <MenuItem value="employeeName">작성자</MenuItem>
          </Select>

          <InputBase
            placeholder="Search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch(); 
              }
            }}
            sx={{ ml: 2, flex: 1 }}
          />
          <IconButton type="button" onClick={handleSearch} sx={{ p: 1 }}>
            <SearchOutlined />
          </IconButton>
        </Box>
      </Box>

      <Box
        mt="20px"
        height="58vh"
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
        }}
      >
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <DataGrid
            rows={data}
            columns={columns}
            getRowId={(row) => row.boardId}
            sx={{
              "& .MuiDataGrid-row:hover": {
                cursor: "pointer",
              },
              "& .MuiDataGrid-footerContainer": {
                display: "none",
              },
            }}    
            onRowClick={handleRowClick}
          />
          
        )}
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
        <Button
          disabled={currentPageGroup === 0}
          onClick={handlePreviousPageGroup}
          sx={{
            backgroundColor: colors.primary[500],
            color: colors.gray[100],
            "&:hover": {
              backgroundColor: colors.primary[700],
            },
          }}
        >
          이전
        </Button>
        {visiblePages.map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === page ? "contained" : "outlined"}
            onClick={() => handlePageClick(pageNum)}
            sx={{
              backgroundColor: pageNum === page ? colors.blueAccent[700] : colors.primary[500],
              color: colors.gray[100],
              "&:hover": {
                backgroundColor: pageNum === page ? colors.blueAccent[800] : colors.primary[700],
              },
              borderColor: colors.gray[300],
            }}
          >
            {pageNum + 1}
          </Button>
        ))}
        <Button
          disabled={pageInfo.totalPages <= visiblePages[visiblePages.length - 1] + 1}
          onClick={handleNextPageGroup}
          sx={{
            backgroundColor: colors.primary[500],
            color: colors.gray[100],
            "&:hover": {
              backgroundColor: colors.primary[700],
            },
          }}
        >
          다음
        </Button>
      </Box>
    </Box>
  );
};

export default Boards;

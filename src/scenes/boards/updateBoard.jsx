import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "../../components";
import { Close } from "@mui/icons-material";
import axios from "axios";
import { tokens } from "../../theme";

const UpdateBoard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();

  const { boardId } = location.state; // 이전 페이지에서 넘겨받은 boardId

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]); // 삭제할 이미지 리스트 상태 추가

  // 게시글 데이터 가져오기
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await axios.get(`http://localhost:8084/boards/${boardId}`);
        const boardData = response.data.data;

        setTitle(boardData.title);
        setCategory(boardData.category);
        setContent(boardData.content);
        setImages(boardData.imageUrls || []);
        setImagePreviews(boardData.imageUrls || []);
      } catch (error) {
        console.error("게시글 정보를 불러오는데 실패했습니다", error);
        alert("게시글 정보를 불러오는데 실패했습니다.");
      }
    };

    if (boardId) {
      fetchBoardData();
    }
  }, [boardId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...files]);
    setImagePreviews([...imagePreviews, ...newImagePreviews]);

    e.target.value = null;
  };

  const handleImageRemove = (index) => {
    // 기존 이미지인지 확인 후 삭제 리스트에 추가
    if (typeof images[index] === "string") {
      setImagesToDelete([...imagesToDelete, images[index]]);
    }

    // 이미지 및 미리보기 리스트에서 제거
    const newImages = [...images];
    const newImagePreviews = [...imagePreviews];
    newImages.splice(index, 1);
    newImagePreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newImagePreviews);
  };

  const handleSubmit = async () => {
    try {
      const updatedData = {
        title: title,
        category: category,
        content: content,
        images: images.filter((image) => typeof image !== "string"), // 파일 객체만 남김
        imagesToDelete: imagesToDelete, // 삭제할 이미지 리스트를 본문에 포함
      };

      const response = await axios.patch(`http://localhost:8084/boards/${boardId}`, updatedData, {
        params: {
          employeeId: 1,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        alert("게시글이 성공적으로 수정되었습니다.");
        navigate(`/viewBoard/${boardId}`)
      }
    } catch (error) {
      console.error("게시글 수정 실패", error);
      alert("게시글 수정에 실패했습니다.");
    }
  };

  return (
    <Box m="20px">
      <Header title="Boards" subtitle="Board Update" />
  
      <Box mt="20px" display="flex" flexDirection="column" gap={2} maxWidth="100%" bgcolor={colors.primary[400]} p={3} borderRadius="8px">
        <TextField
          label="제목"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          InputLabelProps={{ style: { color: colors.gray[100] } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.gray[300],
              },
              "&:hover fieldset": {
                borderColor: colors.greenAccent[500],
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.greenAccent[500],
              },
            },
          }}
        />
  
        <TextField
          label="카테고리"
          variant="outlined"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
          InputLabelProps={{ style: { color: colors.gray[100] } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.gray[300],
              },
              "&:hover fieldset": {
                borderColor: colors.greenAccent[500],
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.greenAccent[500],
              },
            },
          }}
        />
  
        <TextField
          label="내용"
          variant="outlined"
          multiline
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          InputLabelProps={{ style: { color: colors.gray[100] } }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.gray[300],
              },
              "&:hover fieldset": {
                borderColor: colors.greenAccent[500],
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.greenAccent[500],
              },
            },
          }}
        />
  
        <Button
          variant="outlined"
          component="label"
          sx={{
            color: colors.gray[100],
            borderColor: colors.gray[300],
            "&:hover": {
              borderColor: colors.greenAccent[500],
            },
          }}
        >
          이미지 업로드
          <input type="file" multiple hidden onChange={handleImageUpload} />
        </Button>
  
        <Box display="flex" flexWrap="wrap" gap={2} mt={2} maxWidth="100%" justifyContent="center">
          {imagePreviews.map((preview, index) => (
            <Box
              key={index}
              position="relative"
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="200px"
              height="200px"
              bgcolor={colors.primary[400]}
              border={`1px solid ${colors.gray[300]}`}
            >
              <IconButton
                onClick={() => handleImageRemove(index)}
                sx={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  color: colors.gray[100],
                  backgroundColor: colors.redAccent[500],
                  borderRadius: "50%",
                }}
              >
                <Close />
              </IconButton>
              <img
                src={preview}
                alt="미리보기"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </Box>
          ))}
        </Box>
  
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/viewBoard/${boardId}`)}
            sx={{
              color: colors.redAccent[500],
              borderColor: colors.redAccent[500],
              mr: 2,
              "&:hover": {
                borderColor: colors.redAccent[700],
              },
            }}
          >
            취소
          </Button>
          <Button
            variant="outlined"
            onClick={handleSubmit}
            sx={{
              color: colors.greenAccent[500],
              borderColor: colors.greenAccent[500],
              "&:hover": {
                borderColor: colors.greenAccent[700],
              },
            }}
          >
            수정하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateBoard;
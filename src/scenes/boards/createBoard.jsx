import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components";
import { Close } from "@mui/icons-material";
import axios from "axios";
import { tokens } from "../../theme";

const CreateBoard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [category, setCategory] = useState("일반");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...files]);
    setImagePreviews([...imagePreviews, ...newImagePreviews]);

    e.target.value = null;
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "";
    setUsername(storedUsername);

    if (storedUsername === "admin@gmail.com") {
      setCategory("공지");
    }
  }, []);

  const handleSubmit = async () => {
    try {
      if ((category === "공지" || category === "식단") && username !== "admin@gmail.com") {
        alert("공지와 식단 카테고리는 관리자만 작성할 수 있습니다.");
        return;
      }

      const imageLinks = images.map((image) => image);
  
      const postData = {
        title: title,
        category: category,
        content: content,
        images: imageLinks,
      };
  
      const response = await axios.post("http://localhost:8084/boards", postData, {
        params: {
          employeeId: 1, 
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 201) {
        alert("게시글이 성공적으로 작성되었습니다.");
        navigate("/boards");
      }
    } catch (error) {
      console.error("게시글 작성 실패", error);
      alert("게시글 작성에 실패했습니다.");
    }
  };

  return (
    <Box m="20px">
      <Header title="Boards" subtitle="Create Board" />
  
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
  
        <Select
          label="카테고리"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
          sx={{
            color: colors.gray[100],
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
        >
          {username === "admin@gmail.com"
            ? [
                <MenuItem key="공지" value="공지">공지</MenuItem>,
                <MenuItem key="식단" value="식단">식단</MenuItem>,
                <MenuItem key="일반" value="일반">일반</MenuItem>,
                <MenuItem key="질문" value="질문">질문</MenuItem>
              ]
            : [
                <MenuItem key="일반" value="일반">일반</MenuItem>,
                <MenuItem key="질문" value="질문">질문</MenuItem>
              ]
          }
        </Select>
  
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
            onClick={() => navigate("/boards")}
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
            작성하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateBoard;
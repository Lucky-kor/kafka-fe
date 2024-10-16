import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, useTheme, Divider, Paper, IconButton, Modal } from "@mui/material";
import { Header } from "../../components";
import axios from "axios";
import { tokens } from "../../theme";
import CommentIcon from '@mui/icons-material/Comment';
import ReplyIcon from '@mui/icons-material/Reply';

const ViewBoard = () => {
  const { id } = useParams();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [board, setBoard] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [replyComments, setReplyComments] = useState({});
  const [replyOpen, setReplyOpen] = useState({});
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const navigate = useNavigate();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => setOpenDeleteModal(false);

  const fetchBoardDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8084/boards/${id}`);
      const boardData = response.data.data;
      setBoard(boardData);

      const loggedInUserId = 1;
      setIsOwner(boardData.employeeId === loggedInUserId);
    } catch (error) {
      console.error("Error fetching board details", error);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsResponse = await axios.get(`http://localhost:8084/boards/${id}/comments`);
      const processedComments = commentsResponse.data.map(comment => ({
        id: comment.boardCommentId,
        employeeName: comment.employeeName || "익명",
        content: comment.content,
        createdAt: comment.createdAt,
        employeeId: comment.employeeId,
        parentCommentId: comment.parentCommentId,
      }));
      setComments(processedComments);
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8084/boards/${id}`, {
        params: {
          employeeId: 1,
        },
      });
      alert("게시글이 삭제되었습니다.");
      navigate("/boards");
    } catch (error) {
      console.error("Error deleting board", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  const handleUpdate = () => {
    navigate(`/updateBoard`, { state: { boardId: id } });
  };

  const handleCommentSubmit = async (parentId = null) => {
    try {
      await axios.post(`http://localhost:8084/boards/${id}/comments`, {
        content: parentId ? replyComments[parentId] : comment,
        parentCommentId: parentId,
      }, {
        params: {
          employeeId: 1,
        },
      });
      alert("댓글이 성공적으로 등록되었습니다.");
      if (parentId) {
        setReplyComments(prev => ({ ...prev, [parentId]: "" }));
        setReplyOpen(prev => ({ ...prev, [parentId]: false }));
      } else {
        setComment("");
      }
      fetchComments(); 
    } catch (error) {
      console.error("Error submitting comment", error);
      alert("댓글 등록에 실패했습니다.");
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8084/boards/${id}/comments/${commentId}`, {
        params: {
          employeeId: 1,
        },
      });
      alert("댓글이 삭제되었습니다.");
      fetchComments(); 
    } catch (error) {
      console.error("Error deleting comment", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  const handleCommentUpdate = async (commentId) => {
    try {
      await axios.patch(`http://localhost:8084/boards/${id}/comments/${commentId}`, {
        content: replyComments[commentId],
      }, {
        params: {
          employeeId: 1,
        },
      });
      alert("댓글이 수정되었습니다.");
      setEditCommentId(null);
      fetchComments();
    } catch (error) {
      console.error("Error updating comment", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setOpenImageModal(true);
  };

  useEffect(() => {
    if (!isFetched) {
      fetchBoardDetails();
      fetchComments();
      setIsFetched(true);
    }
  }, [isFetched]);

  if (!board) {
    return <Typography>Loading...</Typography>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  };

  return (
    <Box m="20px">
      <Header title="Boards" subtitle="Board View" />

      <Box display="flex" flexDirection="column" bgcolor={colors.primary[400]} p={3} borderRadius="8px" boxShadow="0px 0px 20px rgba(0,0,0,0.1)">
        {isOwner && (
          <Box display="flex" justifyContent="space-between" gap={2} mb={1}>
          <Button
            variant="outlined"
            onClick={() => navigate('/boards')}
            sx={{
              color: colors.greenAccent[400],
              borderColor: colors.greenAccent[400],
              "&:hover": {
                backgroundColor: colors.greenAccent[400],
                color: "#fff",
              },
            }}
          >
            목록
          </Button>
          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={handleUpdate}
              sx={{
                color: colors.blueAccent[500],
                borderColor: colors.blueAccent[500],
                "&:hover": {
                  backgroundColor: colors.blueAccent[500],
                  color: "#fff",
                },
              }}
            >
              수정
            </Button>
            <Button
              variant="outlined"
              onClick={handleOpenDeleteModal}
              sx={{
                color: colors.redAccent[500],
                borderColor: colors.redAccent[500],
                "&:hover": {
                  backgroundColor: colors.redAccent[500],
                  color: "#fff",
                },
              }}
            >
              삭제
            </Button>
          </Box>
        </Box>
        )}

        <Typography variant="h4" color={colors.greenAccent[500]} fontWeight="bold">
          [{board.category}] {board.title}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="subtitle1" color={colors.gray[100]}>
            작성자: {board.employeeName || "익명"} &nbsp;&nbsp; | &nbsp;&nbsp; 조회수: {board.views}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle1" color={colors.gray[100]}>
              작성일: {formatDate(board.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, backgroundColor: colors.gray[300] }} />

        <Typography variant="body1" color={colors.gray[100]} mt={2} mb={2}>
          {board.content}
        </Typography>

        <Divider sx={{ my: 3, backgroundColor: colors.gray[300] }} />

        {board.imageUrls && board.imageUrls.length > 0 && (
          <Box mt={2} mb={3}>
            <Typography variant="subtitle2" color={colors.greenAccent[500]} mb={1}>
              첨부 파일:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {board.imageUrls.map((url, index) => (
                <Box
                  key={index}
                  component="img"
                  src={url}
                  alt={`첨부 이미지 ${index + 1}`}
                  width="200px"
                  height="200px"
                  borderRadius="8px"
                  boxShadow="0 0 10px rgba(0, 0, 0, 0.2)"
                  onClick={() => handleImageClick(url)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Modal
          open={openImageModal}
          onClose={() => setOpenImageModal(false)}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Box>
            <img src={selectedImage} alt="첨부 이미지 크게 보기" style={{ maxWidth: '90%', maxHeight: '90%' }} />
          </Box>
        </Modal>

        <Typography variant="h5" color={colors.greenAccent[500]} fontWeight="bold" mb={2} display="flex" alignItems="center">
          <CommentIcon sx={{ mr: 1 }} /> 댓글 [{comments.length}]
        </Typography>

        {comments.length > 0 ? (
          comments.map((comment) => (
            !comment.parentCommentId ? (
              <React.Fragment key={comment.id}>
                <Paper elevation={3} sx={{ mb: 2, p: 2, bgcolor: colors.primary[600], borderRadius: "4px" }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="subtitle2" color={colors.gray[100]}>
                        {comment.employeeName} | {formatDate(comment.createdAt)}
                      </Typography>
                      <IconButton onClick={() => setReplyOpen(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}>
                        <ReplyIcon sx={{ color: colors.gray[300] }} />
                      </IconButton>
                    </Box>
                    {comment.employeeId === 1 && (
                      <Box display="flex" gap={2}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditCommentId(editCommentId === comment.id ? null : comment.id);
                            setReplyComments(prev => ({ ...prev, [comment.id]: comment.content }));
                          }}
                          sx={{
                            color: colors.blueAccent[500],
                            borderColor: colors.blueAccent[500],
                            "&:hover": {
                              backgroundColor: colors.blueAccent[500],
                              color: "#fff",
                            },
                          }}
                        >
                          수정
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleCommentDelete(comment.id)}
                          sx={{
                            color: colors.redAccent[500],
                            borderColor: colors.redAccent[500],
                            "&:hover": {
                              backgroundColor: colors.redAccent[500],
                              color: "#fff",
                            },
                          }}
                        >
                          삭제
                        </Button>
                      </Box>
                    )}
                  </Box>
                  {editCommentId === comment.id ? (
                    <Box mt={2} mb={2} bgcolor={colors.primary[400]} p={2} borderRadius="4px">
                      <TextField
                        variant="outlined"
                        placeholder="댓글을 입력하세요"
                        value={replyComments[comment.id] || ""}
                        onChange={(e) => setReplyComments(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        fullWidth
                        multiline
                        rows={2}
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
                      <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
                        <Button
                          variant="outlined"
                          onClick={() => handleCommentUpdate(comment.id)}
                          sx={{
                            borderColor: colors.greenAccent[500],
                            color: colors.greenAccent[500],
                            fontWeight: "bold",
                            "&:hover": {
                              backgroundColor: colors.greenAccent[500],
                              color: "#fff",
                            },
                          }}
                        >
                          수정 완료
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body1" color={colors.gray[100]} mb={1}>
                      {comment.content}
                    </Typography>
                  )}
                  {replyOpen[comment.id] && (
                    <Box mt={2} mb={2} bgcolor={colors.primary[400]} p={2} borderRadius="4px">
                      <TextField
                        variant="outlined"
                        placeholder="댓글을 입력하세요"
                        value={replyComments[comment.id] || ""}
                        onChange={(e) => setReplyComments(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        fullWidth
                        multiline
                        rows={2}
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
                      <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
                        <Button
                          variant="outlined"
                          onClick={() => handleCommentSubmit(comment.id)}
                          sx={{
                            borderColor: colors.greenAccent[500],
                            color: colors.greenAccent[500],
                            fontWeight: "bold",
                            "&:hover": {
                              backgroundColor: colors.greenAccent[500],
                              color: "#fff",
                            },
                          }}
                        >
                          등록
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
                {comments.filter(reply => reply.parentCommentId === comment.id).map((reply) => (
                  <Paper key={reply.id} elevation={2} sx={{ mb: 1, ml: 4, p: 2, bgcolor: colors.primary[500], borderRadius: "4px" }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Typography variant="subtitle2" color={colors.gray[100]}>
                          {reply.employeeName} | {formatDate(reply.createdAt)}
                        </Typography>
                      </Box>
                      {reply.employeeId === 1 && (
                        <Box display="flex" gap={2}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setEditCommentId(editCommentId === reply.id ? null : reply.id);
                              setReplyComments(prev => ({ ...prev, [reply.id]: reply.content }));
                            }}
                            sx={{
                              color: colors.blueAccent[500],
                              borderColor: colors.blueAccent[500],
                              "&:hover": {
                                backgroundColor: colors.blueAccent[500],
                                color: "#fff",
                              },
                            }}
                          >
                            수정
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => handleCommentDelete(reply.id)}
                            sx={{
                              color: colors.redAccent[500],
                              borderColor: colors.redAccent[500],
                              "&:hover": {
                                backgroundColor: colors.redAccent[500],
                                color: "#fff",
                              },
                            }}
                          >
                            삭제
                          </Button>
                        </Box>
                      )}
                    </Box>
                    {editCommentId === reply.id ? (
                      <Box mt={2} mb={2} bgcolor={colors.primary[400]} p={2} borderRadius="4px">
                        <TextField
                          variant="outlined"
                          placeholder="댓글을 입력하세요"
                          value={replyComments[reply.id] || ""}
                          onChange={(e) => setReplyComments(prev => ({ ...prev, [reply.id]: e.target.value }))}
                          fullWidth
                          multiline
                          rows={2}
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
                        <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
                          <Button
                            variant="outlined"
                            onClick={() => handleCommentUpdate(reply.id)}
                            sx={{
                              borderColor: colors.greenAccent[500],
                              color: colors.greenAccent[500],
                              fontWeight: "bold",
                              "&:hover": {
                                backgroundColor: colors.greenAccent[500],
                                color: "#fff",
                              },
                            }}
                          >
                            수정 완료
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body1" color={colors.gray[100]} mb={1}>
                        {reply.content}
                      </Typography>
                    )}
                  </Paper>
                ))}
              </React.Fragment>
            ) : null
          ))
        ) : (
          <Typography variant="body2" color={colors.gray[300]}>
            등록된 댓글이 없습니다.
          </Typography>
        )}

        <Box display="flex" flexDirection="column" gap={2} mt={3}>
          <TextField
            variant="outlined"
            placeholder={"댓글을 입력하세요"}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            multiline
            rows={4}
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

          <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
            <Button
              variant="outlined"
              onClick={() => handleCommentSubmit()}
              sx={{
                borderColor: colors.greenAccent[500],
                color: colors.greenAccent[500],
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: colors.greenAccent[500],
                  color: "#fff",
                },
              }}
            >
              등록
            </Button>
          </Box>
        </Box>
      </Box>
      <Modal
      open={openDeleteModal}
      onClose={handleCloseDeleteModal}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box
        bgcolor={colors.primary[500]}
        p={4}
        borderRadius="8px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h6" color={colors.gray[100]} mb={2}>
          정말 삭제하시겠습니까?
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            onClick={handleDelete} // 실제 삭제 처리
            sx={{
              color: "#fff",
              backgroundColor: colors.redAccent[500],
              "&:hover": {
                backgroundColor: colors.redAccent[700],
              },
            }}
          >
            확인
          </Button>
          <Button
            variant="outlined"
            onClick={handleCloseDeleteModal} // 모달 닫기
            sx={{
              color: colors.gray[100],
              borderColor: colors.gray[100],
              "&:hover": {
                backgroundColor: colors.gray[500],
                color: "#fff",
              },
            }}
          >
            취소
          </Button>
        </Box>
      </Box>
    </Modal>
    </Box>
  );
};

export default ViewBoard;
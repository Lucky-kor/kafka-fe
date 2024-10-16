import React, { useState, useEffect } from "react";
import { useTheme, Modal, Box, Button, TextField, IconButton, Typography, Table, TableBody, TableCell, TableRow, TableHead, MenuItem } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from "axios";
import { tokens } from "../theme";

const DocumentTemplate = ({ isOpen, handleClose, templateId, docTypeId }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const mode = theme.palette.mode;
    const [templateData, setTemplateData] = useState(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (templateId) {
            fetchTemplateData();
        }
    }, [templateId]);

    const fetchTemplateData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:8082/templates/${templateId}`);
            const data = response.data;

            if (data) {
                console.log("응답 데이터:", data);
                setTemplateData(data);
                setFields(data.fields || []);
            } else {
                console.error("템플릿 데이터가 없습니다.");
            }
        } catch (error) {
            console.error("템플릿 데이터를 가져오는 중 오류 발생:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (index, key, value) => {
        const updatedFields = [...fields];
        updatedFields[index][key] = value;
        setFields(updatedFields);
    };

    const handleSaveTemplate = async () => {
        if (!templateData) return;

        try {
            // 템플릿 패치 요청
            const patchDto = {
                id: templateData.id,
                templateName: templateData.templateName,
                fields: fields.map(field => ({
                    id: field.id,
                    fieldName: field.fieldName,
                    fieldType: field.fieldType
                })),
            };

            const response = await axios.patch(`http://localhost:8082/templates/${templateId}`, patchDto);

            const newType = `${response.data.templateName}ver_${response.data.version}`;
            const docsTypeDto = {
                templateId: response.data.id,
                type: newType
            };

            await axios.post(`http://localhost:8082/docs-types`, docsTypeDto);

            alert("템플릿 및 Docs Type 수정 완료!");
            handleClose();
        } catch (error) {
            console.error("템플릿 또는 Docs Type 수정 중 오류 발생:", error);
            alert("템플릿 또는 Docs Type 수정 중 오류가 발생했습니다.");
        }
    };

    const handleDeleteField = (index) => {
        const updatedFields = fields.filter((_, i) => i !== index);
        setFields(updatedFields);
    };

    const handleAddField = () => {
        const newField = {
            id: Date.now(), // 임시 ID
            fieldName: "",
            fieldType: ""
        };
        setFields([...fields, newField]);
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box sx={{
                width: "50%",
                maxHeight: "80vh",
                overflow: "auto",
                padding: 4,
                margin: "100px auto",
                backgroundColor: mode === 'dark' ? colors.primary[300] : theme.palette.background.paper,
                position: "relative"
            }}>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'black',
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {loading ? (
                    <Typography textAlign="center">로딩 중...</Typography>
                ) : templateData ? (
                    <>
                        <Typography variant="h5" textAlign="center" mb={4}>템플릿 수정</Typography>
                        <TextField
                            label="템플릿 이름"
                            fullWidth
                            value={templateData.templateName}
                            onChange={(e) => setTemplateData({ ...templateData, templateName: e.target.value })}
                            sx={{ mb: 4 }}
                        />
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>필드 이름</TableCell>
                                    <TableCell>필드 타입</TableCell>
                                    <TableCell>작업</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <TextField
                                                value={field.fieldName}
                                                onChange={(e) => handleFieldChange(index, 'fieldName', e.target.value)}
                                                placeholder="필드 이름 입력"
                                                fullWidth
                                                variant="standard"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                select
                                                value={field.fieldType}
                                                onChange={(e) => handleFieldChange(index, 'fieldType', e.target.value)}
                                                placeholder="필드 타입 선택"
                                                fullWidth
                                                variant="standard"
                                            >
                                                <MenuItem value="text">텍스트</MenuItem>
                                                <MenuItem value="number">숫자</MenuItem>
                                                <MenuItem value="date">날짜</MenuItem>
                                                <MenuItem value="checkbox">체크박스</MenuItem>
                                            </TextField>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleDeleteField(index)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddField}
                            variant="outlined"
                            sx={{ mt: 2 }}
                        >
                            새 필드 추가
                        </Button>
                        <Button variant="contained" onClick={handleSaveTemplate} sx={{ mt: 4, ml: 2 }}>
                            저장
                        </Button>
                    </>
                ) : (
                    <Typography textAlign="center">템플릿 데이터를 불러올 수 없습니다.</Typography>
                )}
            </Box>
        </Modal>
    );
};

export default DocumentTemplate;

import React, { useState } from "react";
import axios from "axios";
import { tokens } from "../../theme";
import { Button, TextField, Box, Typography, useTheme, MenuItem, Select, FormControl, InputLabel, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close'; 
import { useNavigate } from "react-router-dom"; 

function TemplateForm() {

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate(); // useNavigate 사용

  // 필드 상태 관리
  const [templateName, setTemplateName] = useState("");
  const [fields, setFields] = useState([]);

  // 필드 추가 상태 관리
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("");

  // 필드 타입 목록 (JavaScript 기본 타입)
  const fieldTypes = [
    { label: "텍스트", value: "String" },
    { label: "숫자", value: "Number" },
    { label: "날짜", value: "Date" },
    { label: "체크박스", value: "checkbox" }
  ];

  // 필드 추가 핸들러
  const handleAddField = () => {
    if (newFieldName && newFieldType) {
      setFields([...fields, { fieldName: newFieldName, fieldType: newFieldType }]);
      setNewFieldName("");
      setNewFieldType("");
    }
  };

    // 필드 삭제 핸들러
    const handleDeleteField = (index) => {
      const updatedFields = fields.filter((_, i) => i !== index); // 인덱스를 기준으로 삭제
      setFields(updatedFields);
    };

  // POST 요청 전송 핸들러
  const handleSubmit = async () => {
    const templateData = {
      templateName,
      fields,
    };

    try {
        // 첫 번째 POST 요청: 템플릿 생성
        const response = await axios.post("http://localhost:8082/templates", templateData);
        console.log("템플릿 생성 성공:", response);
  
        // 두 번째 POST 요청: docs-types에 템플릿 정보 전송
        const docsTypeData = {
          templateId: response.data.id,
          type: `${templateName} ver_${response.data.version}`
        };
        
        const docsTypeResponse = await axios.post("http://localhost:8082/docs-types", docsTypeData);
        console.log("docs-type 생성 성공:", docsTypeResponse.data);

        // 생성이 성공한 후 Document 페이지로 이동
        navigate("/document");  
  
      } catch (error) {
        console.error("전송 중 오류 발생:", error);
      }
    };

  return (
    <Box sx={{ bgcolor: colors.gray[350]}}>    
        <Box sx={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>템플릿 생성</Typography>
      <Box m="40px"></Box>
      {/* 템플릿 이름 입력 */}
      <TextField
        label="템플릿 이름"
        variant="outlined"
        fullWidth
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
        sx={{ marginBottom: "20px" }}
      />

          {/* 필드 추가 입력 */}
        <Box display="flex" gap={2} marginBottom={2}>
          <TextField
            label="필드 이름"
            variant="outlined"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel id="field-type-label">필드 타입</InputLabel>
            <Select
              labelId="field-type-label"
              value={newFieldType}
              label="필드 타입"
              onChange={(e) => setNewFieldType(e.target.value)}
            >
              {fieldTypes.map((type, index) => (
                <MenuItem key={index} value={type.value}>
                  {type.label} {/* 사용자에게 보이는 레이블 */}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleAddField}>
            필드 추가
          </Button>
        </Box>

        {/* 추가된 필드 목록 표시 및 삭제 버튼 */}
        <Box>
          {fields.length > 0 && (
            <ul>
              {fields.map((field, index) => (
                <li key={index} style={{ display: "flex", alignItems: "center" }}>
                  {field.fieldName} - {fieldTypes.find(type => type.value === field.fieldType)?.label || field.fieldType}
                  <IconButton onClick={() => handleDeleteField(index)} aria-label="delete">
                    <CloseIcon /> 
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </Box>

        {/* 템플릿 생성 버튼 */}
        <Button variant="contained" color="primary" fullWidth onClick={handleSubmit}>
          템플릿 생성
        </Button>
      </Box>
    </Box>
  );
}

export default TemplateForm;

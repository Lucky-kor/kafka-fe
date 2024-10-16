import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Box, Button, useTheme, TextField, useMediaQuery } from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import axios from 'axios';
import { tokens } from "../../theme";

const MailWrite = () => {
  const theme = useTheme();
  console.log("mailwrite진입..."); // 이 로그가 찍히는지 확인
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const quillRef = useRef(null);

  const initialValues = {
    recipientEmail: "",
    subject: "",
    address1: "",
    address2: "",
    body: ""
  };

  const checkoutSchema = yup.object().shape({
    recipientEmail: yup.string().email("올바른 이메일 형식이어야 합니다.").required("받는 사람의 이메일이 필요합니다."),
    subject: yup.string().required("제목이 필요합니다."),
    address1: yup.string(),
    address2: yup.string(),
    body: yup.string()
  });

  const handleFormSubmit = async (values, actions) => {
    if (!quillRef.current) {
      alert("Quill 에디터가 초기화되지 않았습니다. 다시 시도해주세요.");
      return;
    }

    const quillContent = quillRef.current.querySelector(".ql-editor").innerHTML;
    // const updatedValues = { ...values, content: quillContent };
    values.body = quillContent;

    console.log("메일 전송 요청 시작..."); // 이 로그가 찍히는지 확인


    try {
      // 백엔드 API 호출
      const response = await axios.post('http://localhost:8083/mail/send', values);
      console.log(response.data);
      actions.resetForm({ values: initialValues });
      alert("메일이 성공적으로 전송되었습니다.");
    } catch (error) {
      console.error("메일 전송 중 오류 발생: ", error);
      alert("메일 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'font': [] }],
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['link', 'image', 'video'],
            ['clean']
          ]
        }
      });
    }
  }, [quillRef]);

  return (
      <Box m="50px">
        <Header subject="메일 쓰기" subtitle="" />

        <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={checkoutSchema}
        >
          {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    variant="outlined"
                    type="text"
                    label="받는 사람"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.recipientEmail}
                    name="recipientEmail"
                    error={touched.recipientEmail && Boolean(errors.recipientEmail)}
                    helperText={touched.recipientEmail && errors.recipientEmail}
                    sx={{ mb: 2 }}
                />
                {/*<TextField*/}
                {/*    fullWidth*/}
                {/*    variant="outlined"*/}
                {/*    type="text"*/}
                {/*    label="참조"*/}
                {/*    onBlur={handleBlur}*/}
                {/*    onChange={handleChange}*/}
                {/*    value={values.address1}*/}
                {/*    name="address1"*/}
                {/*    error={touched.address1 && Boolean(errors.address1)}*/}
                {/*    helperText={touched.address1 && errors.address1}*/}
                {/*    sx={{ mb: 2 }}*/}
                {/*/>*/}
                {/*<TextField*/}
                {/*    fullWidth*/}
                {/*    variant="outlined"*/}
                {/*    type="text"*/}
                {/*    label="숨은 참조"*/}
                {/*    onBlur={handleBlur}*/}
                {/*    onChange={handleChange}*/}
                {/*    value={values.address2}*/}
                {/*    name="address2"*/}
                {/*    error={touched.address2 && Boolean(errors.address2)}*/}
                {/*    helperText={touched.address2 && errors.address2}*/}
                {/*    sx={{ mb: 2 }}*/}
                {/*/>*/}
                <TextField
                    fullWidth
                    variant="outlined"
                    type="text"
                    label="제목"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.subject}
                    name="subject"
                    error={touched.subject && Boolean(errors.subject)}
                    helperText={touched.subject && errors.subject}
                    sx={{ mb: 2 }}
                />
                {/*<TextField*/}
                {/*    fullWidth*/}
                {/*    variant="outlined"*/}
                {/*    type="body"*/}
                {/*    label="본문"*/}
                {/*    onBlur={handleBlur}*/}
                {/*    onChange={handleChange}*/}
                {/*    value={values.body}*/}
                {/*    name="body"*/}
                {/*    error={touched.body && Boolean(errors.body)}*/}
                {/*    helperText={touched.body && errors.body}*/}
                {/*    sx={{ mb: 2 }}*/}
                {/*/>*/}
                <Button variant="contained" color="secondary" component="label" startIcon={<AttachFileIcon />} sx={{ mb: 2 }}>
                  파일첨부
                  <input type="file" hidden />
                </Button>

                {/* Quill Editor Container */}
                <div ref={quillRef} style={{ height: '300px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px' }} />

                <Box display="flex" alignItems="center" justifyContent="flex-end" gap="10px" mt="20px">
                  <Button type="submit" color="third" variant="contained">
                    임시저장
                  </Button>
                  <Button type="submit" color="third" variant="contained">
                    보내기
                  </Button>
                </Box>
              </form>
          )}
        </Formik>
      </Box>
  );
};

export default MailWrite;

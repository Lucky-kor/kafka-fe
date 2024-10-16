import axios from "axios";
import Swal from "sweetalert2";

const sendPostDocumentSaveRequest = async (requestBody, executeAfter) => {
    
    try {
        const response = await axios.post('http://localhost:8082/documents/save', requestBody, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.status === 200 || response.status === 201) {
            console.log('결재문서 저장 성공', response);
            if (executeAfter !== undefined) {
                executeAfter();
            }
        } else {
            console.log('결재문서 저장 실패: ', response.status);
            Swal.fire({ text: `요청 실패(${response.status})` });
        }
    } catch (error) {
        console.error('결재문서 저장 실패(에러 발생): ', error);
        
        if (error.response) {
            Swal.fire({ text: `요청 실패(${error.response.status}): ${error.response.data.message}` });
        } else {
            Swal.fire({ text: '알 수 없는 오류가 발생했습니다.' });
        }
    }
}
export default sendPostDocumentSaveRequest;
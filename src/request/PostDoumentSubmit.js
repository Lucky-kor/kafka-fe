import axios from "axios";
import Swal from "sweetalert2";

const sendPostDocumentSubmitRequest = async (requestBody, executeAfter) => {
    console.log("보낼 데이터:", requestBody);
    try {
        const response = await axios.post('http://localhost:8082/documents/submit', requestBody, {
            headers: {
                'Content-Type': 'application/json',
                //'Authorization': state.token
            }
            
        });
        console.log("보낼 데이터:", requestBody);

      if (response.status === 200 || response.status === 201) {
            console.log('결재문서 임시저장 성공', response);
            if (executeAfter !== undefined) {
                executeAfter();
            }
        } else {
            console.log('결재문서 임시저장 실패: ', response.status);
            Swal.fire({ text: `요청 실패(${response.status})` });
        }
    } catch (error) {
        console.error('결재문서 임시저장 실패(에러 발생): ', error);
        Swal.fire({ text: `요청 실패(${error.status})` });
    }
}



export default sendPostDocumentSubmitRequest;
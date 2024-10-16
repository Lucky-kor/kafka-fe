import axios from "axios";
import Swal from "sweetalert2";

const postWorkflowRequest = async (requestBody, executeAfter) => {
    try {
        const response = await axios.post(
            'http://localhost:8082/workflows',
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        // Location 헤더에서 workflow ID를 추출
        const locationHeader = response.headers['location'];
        if (locationHeader) {
            const workflowId = locationHeader.split('/').pop(); // URL에서 ID 추출
            console.log('Received workflowId:', workflowId);

            if (executeAfter) {
                executeAfter(workflowId); // 추출한 workflowId를 상위 컴포넌트로 전달
            }
        } else {
            console.error('Location 헤더가 없습니다.');
        }
    } catch (error) {
        console.error('결재라인 생성 실패(에러 발생): ', error);
        Swal.fire({ text: `요청 실패(${error.response?.status})` });
    }
};

export default postWorkflowRequest;

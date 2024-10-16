import axios from 'axios';

const sendPatchDocumentRequest = async (documentId, requestBody, onSuccess) => {
    try {
        const response = await axios.patch(`http://localhost:8082/documents/${documentId}`, requestBody, {  // 주소 수정
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        });
        console.log('PATCH 요청 성공:', response.data);
        onSuccess();
    } catch (error) {
        console.error('PATCH 요청 중 오류 발생:', error);
    }
};

export default sendPatchDocumentRequest;

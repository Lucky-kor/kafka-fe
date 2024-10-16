import axios from 'axios';

const patchApprovalRequest = async (approvalData, onSuccess, onError) => {
    try {
        const response = await axios.patch('http://localhost:8082/workflows', approvalData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // 토큰이 필요할 경우 추가
            },
        });
        if (response.status === 200) {
            onSuccess(response.data); // 요청 성공 시 처리할 로직
        } else {
            console.error('서버 응답 오류:', response);
            if (onError) onError(response);
        }
    } catch (error) {
        console.error('Approval PATCH 요청 오류:', error);
        if (onError) onError(error);
    }
};

export default patchApprovalRequest;

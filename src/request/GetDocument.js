import axios from 'axios';
import Swal from 'sweetalert2';

const getDocument = async (documentId, setDocument, setIsLoading) => {
    if (typeof setIsLoading === 'function') {
        setIsLoading(true); // 로딩 상태 시작
    }

    try {
        const response = await axios.get(`http://localhost:8082/documents/${documentId}`, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': state.token
            }
        });

   if (response.status === 200 && response.data.length > 0) {
            setDocument(response.data);
        } else {
            setDocument([]); // 데이터가 없을 때 빈 배열 설정
        }
    } catch (error) {
        console.error('Error fetching departments:', error);
        Swal.fire({ text: '전자 결재 문서를 불러오는 중 오류가 발생했습니다.' });
        setDocument([]);
    } finally {
        if (typeof setIsLoading === 'function') {
            setIsLoading(false); // 로딩 상태 종료
        }
    }
};

export default getDocument;
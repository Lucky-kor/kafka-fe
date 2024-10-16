import axios from 'axios'; 
import Swal from 'sweetalert2';

const getDocsTypeAllRequest = async (page, size, setDocuments, sort, direction, setIsLoading) => {
    setIsLoading(true); // 요청 시작 시 로딩 상태 true
    try {
        const params = {
            page,
            size,
            sort,
            direction
        };

        const response = await axios.get(`http://localhost:8082/docs-types`, {
            headers: {
                'Content-Type': 'application/json',
            }, 
            params
        });

        if (response.status === 200) {
            console.log('문서타입 GET요청 성공: ', response.data);
            return response.data;  // 데이터 반환
        } else {
            console.error('Failed to fetch documents data:', response.status);
            Swal.fire({ text: `문서 타입 요청 실패(${response.status})` });
            return null;  // 실패 시 null 반환
        }
    } catch (error) {
        console.error('데이터 요청 중 오류 발생:', error);
        Swal.fire({ text: '데이터를 가져오는 중 오류가 발생했습니다.' });
        return null;  // 에러 시 null 반환
    } finally {
        setIsLoading(false);  // 최종적으로 로딩 상태 false
    }
};

export default getDocsTypeAllRequest;

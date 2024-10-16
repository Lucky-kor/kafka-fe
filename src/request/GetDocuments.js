import axios from 'axios';
import Swal from 'sweetalert2';

const getDocumentAllRequest = async (state, searchParams, page, size, setDocuments, setIsLoading) => {
    setIsLoading(true); // 요청 시작 시 로딩 상태 true
    try {
        const params = {
            ...searchParams,  // searchParams를 통해 동적으로 검색 파라미터를 전달
            page,
            size
        };

        const response = await axios.get(`http://localhost:8082/documents`, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': state.token
            }, 
            params
        });

        if (response.status === 200) {
            console.log('문서 GET요청 성공: ', response.data);
            if (response.data.data && response.data.data.length > 0) {
                setDocuments(response.data);
            } else {
                setDocuments({ data: [] });
            }
            setIsLoading(false);
        } else {
            console.log('Failed to fetch documents data:', response.status);
            Swal.fire({text: `요청 실패(${response.status})`});
            setDocuments({ data: [] });
        }

        setIsLoading(false);

        
        return response;

    } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({ text: '데이터를 가져오는 중 오류가 발생했습니다.' });
        setDocuments({ data: [] });
    } finally {
        setIsLoading(false);
    }
};

export default getDocumentAllRequest;
import axios from 'axios';
import Swal from 'sweetalert2';

const getEmployeesByDepartment = async (departmentId, page, size, setEmployees, setIsLoading) => {

    try {
        setIsLoading(true); // 요청 시작 시 로딩 상태 true
        const params = {
            page,
            size
        };

        const response = await axios.get(`http://localhost:8081/user/employees/departments/${departmentId}`,{ 
            headers: {
                'Content-Type': 'application/json',
                // 필요시 Authorization 헤더 추가
                // 'Authorization': state.token
            }, 
            params
        });

        if (response.status === 200 && response.data.data.length > 0) {
            setEmployees(response.data.data); // 직원 목록을 상태로 설정
        } else {
            setEmployees([]); // 직원이 없으면 빈 배열 설정
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({ text: '직원 목록을 불러오는 중 오류가 발생했습니다.' });
        setEmployees([]); // 오류 시 빈 배열로 설정
    } finally {
        setIsLoading(false);
    }
};

export default getEmployeesByDepartment;

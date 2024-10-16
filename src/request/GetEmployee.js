import axios from 'axios';
import Swal from 'sweetalert2';

const getEmployee = async (employeeId, setEmployee, setIsLoading) => {
    if (typeof setIsLoading === 'function') {
        setIsLoading(true); // 로딩 상태 시작
    }

    try {
        const response = await axios.get(`http://localhost:8081/user/employees/${employeeId}`, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': state.token
            }
        });

        if (response.status === 200 && response.data?.data) {
            return response.data.data; // 받은 데이터를 반환
        } else {
            return null; // 데이터가 없을 때 null 반환
        }
    } catch (error) {
        console.error('Error fetching employee:', error);
        Swal.fire({ text: '직원 정보를 불러오는 중 오류가 발생했습니다.' });
        return null; // 오류 발생 시 null 반환
    } finally {
        if (typeof setIsLoading === 'function') {
            setIsLoading(false); // 로딩 상태 종료
        }
    }
};

export default getEmployee;

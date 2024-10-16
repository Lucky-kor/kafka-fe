import axios from "axios";
import Swal from "sweetalert2";

const sendGetMyInfoRequest = async (state, setData, setIsLoading, executeAfter) => {
  if (!state.isAuthenticated) {
    return;
  }
  try {
    console.log("state: ", state);
    const response = await axios.get("http://localhost:8081/employees/my-info", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${state.token}`,
      },
    });
    if (response.status === 200) {
      console.log("내 정보 GET요청 성공: ", response.data);
      setData(response.data);
      if (setIsLoading !== undefined) {
        setIsLoading(false);
      }

      if (executeAfter !== undefined) {
        executeAfter(response.data.data);
      }
    } else {
      console.log("내 정보 GET요청 실패: ", response.status);
      Swal.fire({ text: `요청 실패(${response.status})` });
    }
  } catch (error) {
    console.error("내 정보 GET요청 실패(에러 발생): ", error);
    Swal.fire({ text: `요청 실패(${error.response?.status || error.message})` });
  }
};
export default sendGetMyInfoRequest;

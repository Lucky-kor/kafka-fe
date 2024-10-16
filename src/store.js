// import { create } from 'zustand';
// import axios from 'axios';



// const useStore = create((set) => ({
//     id: '',
//     passwd: '',
//     isLogined: false,
//     isAdmin: false,
//     setId: (id) => set({ id }),
//     setPasswd: (passwd) => set({ passwd }),
//     error: '',
//     timer: 0,
//     timerInterval: null,

//     //로그인
//     login: async () => {
//         try {
//             const { id, passwd } = useStore.getState();
//             const json = JSON.stringify({ id, passwd });
//             const blob = new Blob([json], { type: 'application/json' });
//             const data = new FormData();
//             data.append('data', blob);

//             const response = await axios({
//                 method: 'post',
//                 url: '/employee/auth/login',
//                 data: data,
//             });

//             if (response.status === 200) {
//                 console.log('로그인 성공', response.data);
//                 const { isAdmin } = response.data;

//                 set({
//                     isLogined: true,
//                     isAdmin,
//                     error: '',
//                     timer: 1800, //로그인 성공시 timer 30분
//                     timerInterval: setInterval(()=> {
//                         set((state)=>{
//                             const newTime =state.timer - 1;
//                             if(newTime <= 0) {
//                                 clearInterval(state.timerInterval);
//                                 localStorage.removeItem('timer');
//                                 useStore.getState().logout();
//                                 return { timer: 0 };
//                             }
//                             localStorage.setItem('timer', newTime);
//                             return { timer: newTime };
//                         });
//                     }, 1000)
//                 });
//                 localStorage.setItem('timer', 1800);

//             }
//         } catch (error) {
//             if (error.response) {
//                 let errorMessage = '로그인 실패: 요청 중 오류 발생';
//                 switch (error.response.status) {
//                     case 401:
//                         errorMessage = '존재하지 않는 ID입니다.';
//                         break;
//                     case 402:
//                         errorMessage = '비밀번호가 틀렸습니다.';
//                         break;
//                     default:
//                         console.log('로그인 실패: 요청 중 오류 발생');
//                         break;
//                 }
//                 set({ error: errorMessage });
//             } else {
//                 set({ error: '로그인 실패: 요청 중 오류 발생' });
//             }
//             console.error('로그인 실패:', error);
//         }
//     },

//     //로그아웃
//     logout: async () => {
//         try {
//             const response = await axios.post('/employee/auth/logout');
//             if (response.status === 200) {
//                 console.log('로그아웃 성공', response.data);
//                 set({
//                     isLogined: false,
//                     id: '',
//                     passwd: '',
//                     isAdmin: false,
//                     error: '',
//                     timer: 0, // 타이머 종료
//                 });
//                 clearInterval(useStore.getState().timerInterval);
//                 localStorage.removeItem('timer'); // 로그아웃 시 로컬 저장소 타이머 제거
//                 alert('로그아웃 되었습니다.');
//             } else {
//                 console.log('로그아웃 실패: 알 수 없는 오류가 발생했습니다.');
//             }
//         } catch (error) {
//             console.error('로그아웃 실패:', error);
//         }
//     },

//     // 페이지 로드 시 서버에서 로그인 상태 확인
//     initializeState: async () => {
//         try {
//             const response = await axios.get('/employee/auth/islogin');
//             if (response.status === 200) {
//                 const { isAdmin } = response.data;

//                 const newTimer = 1800;

//                 const state = useStore.getState();
//                 if (state.timerInterval) {
//                     clearInterval(state.timerInterval);
//                 }

//                 set({
//                     isLogined: true,
//                     isAdmin,
//                     timer: newTimer,
//                     timerInterval: setInterval(() => {
//                         set((state) => {
//                             const newTime = state.timer - 1;
//                             if (newTime <= 0) {
//                                 clearInterval(state.timerInterval);
//                                 localStorage.removeItem('timer');
//                                 useStore.getState().logout();
//                                 return { timer: 0 };
//                             }
//                             localStorage.setItem('timer', newTime);
//                             return { timer: newTime };
//                         });
//                     }, 1000)
//                 });
//                 localStorage.setItem('timer', newTimer);
//                 console.log('새로고침해서 데이터를 받아왔습니다.');
//             } else if (response.status === 400) {
//                 // 응답이 400인 경우 상태를 초기화합니다.
//                 set({
//                     isLogined: false,
//                     id: '',
//                     passwd: '',
//                     isAdmin: false,
//                     error: '',
//                     timer: 0
//                 });
//                 localStorage.removeItem('timer'); // 세션 만료 시 로컬 저장소에서 제거
//                 alert('세션이 만료되었습니다.');
//             }
//         } catch (error) {
//             console.error('로그인 상태 확인 실패:', error);
//             // 요청 실패 시 상태를 초기화합니다.
//             set({
//                 isLogined: false,
//                 id: '',
//                 passwd: '',
//                 isAdmin: false,
//                 error: '',
//                 timer: 0
//             });
//             localStorage.removeItem('timer'); // 요청 실패 시 로컬 저장소에서 제거
//         }
//     }
// }));

// // 페이지가 로드될 때 서버에서 상태를 초기화합니다.
// useStore.getState().initializeState();

// export default useStore;
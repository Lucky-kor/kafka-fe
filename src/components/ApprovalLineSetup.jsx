import React, { useState } from 'react';
import { Button } from '@mui/material';
import ApprovalLineModal from './ApprovalLineModal';  // 결재라인 설정 모달
import TableModal from './TableModal';  // 결재 진행 상황 모달

const ApprovalLineSetup = () => {
  const [openApprovalLineModal, setOpenApprovalLineModal] = useState(false);
  const [openTableModal, setOpenTableModal] = useState(false);
  const [approvalLines, setApprovalLines] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState({}); // 각 결재자의 승인/반려 상태 관리
  const [isWriteButtonClicked, setIsWriteButtonClicked] = useState(false);  // 결재작성 버튼이 클릭되었는지 여부

  // 결재 작성 버튼 클릭 시 결재라인 설정 모달을 먼저 엶
  const handleWriteButtonClick = () => {
    console.log("결재 작성 버튼 클릭됨");  // 로그로 상태 확인
   //setIsWriteButtonClicked(true);
    setOpenApprovalLineModal(true);  // 결재라인 설정 모달 열기
  };

  // 결재라인 설정 모달 닫기
  const handleCloseApprovalLineModal = () => {
    setOpenApprovalLineModal(false);
  };

  // 결재라인 설정 완료 후 결재 진행 모달 열기
  const handleApprovalLineSubmit = (selectedApprovals) => {
    setApprovalLines(selectedApprovals);
    setOpenApprovalLineModal(false); // 결재라인 설정 모달 닫기

    // // 승인 상태 초기화
    // const initialStatus = {};
    // selectedApprovals.forEach((_, index) => {
    //   initialStatus[index] = null; // null이면 대기, true는 승인, false는 반려
    // });
    
    // setApprovalStatus(initialStatus);
    // 결재 상태 초기화
    const initialStatus = selectedApprovals.reduce((acc, _, index) => {
      acc[index] = null; // null이면 대기, true는 승인, false는 반려
      return acc;
    }, {});
    
    setApprovalStatus(initialStatus);

    // 결재 진행 테이블 모달 열기 (결재라인 설정 후에만 열리도록 설정)
    setOpenTableModal(true);
  };

  // 결재 진행 상황에서 승인 또는 반려 처리
  const handleApprove = (index, status) => {
    setApprovalStatus(prevStatus => ({
      ...prevStatus,
      [index]: status
    }));
  };

  // 결재 진행 상황 모달 닫기
  const handleCloseTableModal = () => {
    setOpenTableModal(false);
  };

  return (
    <div>
      {/* 결재 작성 버튼 */}
      <Button
        variant="contained"
        onClick={handleWriteButtonClick}
        sx={{
          width: '200px',
          height: '50px',
          fontSize: '15px',
          backgroundColor: '#6870fa',
          color: '#fff',
          '&:hover': { backgroundColor: '#b6b6b6ac' },
        }}
      >
        결재 작성
      </Button>

      {/* 결재라인 설정 모달 */}
      <ApprovalLineModal
        open={openApprovalLineModal}
        handleClose={handleCloseApprovalLineModal}
        onSubmit={handleApprovalLineSubmit}
      />

      {/* 결재 진행 테이블 모달 */}
      {approvalLines.length > 0 && (
        <TableModal
          open={openTableModal}
          handleClose={handleCloseTableModal}
          approvalLines={approvalLines}
          approvalStatus={approvalStatus}
          handleApprove={handleApprove}
        />
      )}
    </div>
  );
};

export default ApprovalLineSetup;

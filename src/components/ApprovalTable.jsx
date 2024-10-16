import React from "react";
import APPROVE from '../assets/images/APPROVE.png';
import FINALIZE from '../assets/images/FINALIZE.png';
import REJECT from '../assets/images/REJECT.png';
import { Table, TableBody, TableRow, TableCell, TableHead, Typography, Box, Button } from "@mui/material";

const ApprovalTable = ({ approvalLines, handleApprovalClick }) => {
    return (
        <Table sx={{ border: "1px solid #5c5555ea", width: "100%" , backgroundColor:"#ffffffdb", color:"black"}}>
            <TableHead>
                <TableRow>
                    {approvalLines && approvalLines.length > 0 ? (
                        approvalLines.map((approver, index) => (
                            <TableCell
                                key={index}
                                align="center"
                                sx={{ fontSize: '0.8rem', border: "1px solid #5c5555ea" }}
                            >
                                <Typography variant="body1" sx={{ fontSize: '0.7rem', color:"black" }}>
                                    {approver.position}
                                </Typography>
                            </TableCell>
                        ))
                    ) : (
                        <TableCell align="center" colSpan={1} sx={{ color:"black"}}>
                            결재라인이 설정되지 않았습니다.
                        </TableCell>
                    )}
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    {approvalLines && approvalLines.length > 0 ? (
                        approvalLines.map((approver, index) => (
                            <TableCell
                                key={index}
                                align="center"
                                sx={{ border: "1px solid #5c5555ea" }}
                            >
                                <Box
                                    sx={{
                                        width: '50px',
                                        height: '50px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    {/* 결재 상태가 올바르게 전달되었는지 확인 */}
                                    {approver.approvalStatus ? (
                                        approver.approvalStatus === 'PENDING' ? (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleApprovalClick(approver.employeeId, approver.approvalOrder)} // approvalOrder 전달
                                            >
                                                결재
                                            </Button>
                                        ) : (
                                            <img
                                                src={
                                                    approver.approvalStatus === 'APPROVE'
                                                        ? APPROVE
                                                        : approver.approvalStatus === 'FINALIZE'
                                                        ? FINALIZE
                                                        : REJECT
                                                }
                                                alt={approver.approvalStatus}
                                                style={{ width: '40px', height: '40px'}}
                                            />
                                        )
                                    ) : (
                                        <Typography>상태 없음</Typography>
                                    )}
                                </Box>
                            </TableCell>
                        ))
                    ) : null}
                </TableRow>

                <TableRow>
                    {approvalLines && approvalLines.length > 0 ? (
                        approvalLines.map((approver, index) => (
                            <TableCell
                                key={index}
                                align="center"
                                sx={{ border: "1px solid #5c5555ea" }}
                            >
                                <Typography variant="body2" sx={{ fontSize: '0.7rem', color:"black" }}>
                                    {approver.name}
                                </Typography>
                            </TableCell>
                        ))
                    ) : null}
                </TableRow>
            </TableBody>
        </Table>
    );
};

export default ApprovalTable;

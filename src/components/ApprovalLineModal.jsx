import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Table, TableBody, TableRow, TableCell, Select, MenuItem,
    Box, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import { Delete } from '@mui/icons-material'; // 삭제 아이콘 추가
import postWorkflowRequest from '../request/PostWorkflow';
import getEmployeesByDepartment from '../request/GetEmployeesByDepartment';
import getDepartments from '../request/GetDepartments';

const ApprovalLineModal = ({ open, handleClose, onSubmit, currentEmployeeId }) => {
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedApprovals, setSelectedApprovals] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 부서 데이터 불러오기
    useEffect(() => {
        getDepartments((data) => {
            console.log('Departments:', data);  // 부서 데이터 확인
            setDepartments(data);
        }, setIsLoading);
    }, []);

    // 부서 선택 시 직원 데이터 불러오기
    const handleDepartmentSelect = async (departmentId) => {
        setIsLoading(true);
        try {
            await getEmployeesByDepartment(departmentId, 1, 20, (data) => {
                console.log('Employees data:', data);  // 직원 데이터 확인
                setEmployees(data);
            }, setIsLoading);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 결재자 추가
    const handleAddApprover = (approver) => {
        // 본인을 추가하지 못하도록 체크
        if (approver.employeeId === currentEmployeeId) {
            alert('본인은 결재자로 추가할 수 없습니다.');
            return;
        }

        if (!selectedApprovals.some(a => a.employeeId === approver.employeeId)) {
            setSelectedApprovals((prevApprovals) => [...prevApprovals, approver]);
        }
    };

    // 결재자 삭제
    const handleRemoveApprover = (employeeId) => {
        setSelectedApprovals((prevApprovals) =>
            prevApprovals.filter(a => a.employeeId !== employeeId)
        );
    };

    // 결재자 라인 설정
    const handleConfirm = async () => {
        const workflowPayload = {
            approvals: selectedApprovals.map((approver, index) => ({
                employeeId: approver.employeeId, // 결재자 ID
                approvalOrder: index + 1 // 결재 순서
            }))
        };

        // POST 요청을 통해 workflow 생성
        postWorkflowRequest(workflowPayload, (workflowId) => {
            if (workflowId) {
                console.log('Received workflowId:', workflowId);
                onSubmit(selectedApprovals, workflowId);  // 추출한 workflowId를 상위 컴포넌트로 전달
            } else {
                console.error('workflowId를 받지 못했습니다.');
            }
        });

        handleClose();  // 모달 닫기
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>결재라인 설정</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Select
                            value={selectedDepartment}
                            onChange={(e) => {
                                const departmentId = e.target.value;
                                setSelectedDepartment(departmentId);
                                handleDepartmentSelect(departmentId);  // 부서 선택 시 직원 데이터 호출
                            }}
                            fullWidth
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                            ))}
                        </Select>

                        {/* 직원 목록 리스트 */}
                        <List>
                            {employees.map((employee, index) => (
                                <ListItem
                                    key={employee.employeeId || `employee-${index}`}
                                    button
                                    onClick={() => handleAddApprover({
                                        name: employee.name,
                                        position: employee.employeeRank,
                                        employeeId: employee.employeeId
                                    })}
                                >
                                    <ListItemText primary={`${employee.name} (${employee.employeeRank})`} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* 선택된 결재라인 표시 */}
                    <Box sx={{ flex: 1 }}>
                        <Table>
                            <TableBody>
                                {selectedApprovals.map((approver, index) => (
                                    <TableRow key={approver.employeeId}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{approver.position}</TableCell>
                                        <TableCell>{approver.name}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => handleRemoveApprover(approver.employeeId)}
                                                size="small"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirm} color="primary">확인</Button>
                <Button onClick={handleClose} color="secondary">취소</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApprovalLineModal;

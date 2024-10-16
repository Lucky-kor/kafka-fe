import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Button, Box, Checkbox, IconButton, Modal, Typography, List, ListItem, ListItemText, ListItemIcon, Divider } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const OrganizationChart = ({ selectedEmployees, setselectedEmployees }) => {
    const [departmentList, setDepartmentList] = useState([]);
    const [expandedDepartments, setExpandedDepartments] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [departmentLevel, setDepartmentLevel] = useState({});
    const [includeSubDepartments, setIncludeSubDepartments] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [expandedTopDepartments, setExpandedTopDepartments] = useState([]);
    const [expandedMidDepartments, setExpandedMidDepartments] = useState([]);
    const [selectedDepartmentNames, setSelectedDepartmentNames] = useState([]);
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getDepartmentList();
    }, []);

    useEffect(() => {
        if (Array.isArray(departmentList) && departmentList.length > 0) {
            const levels = {};
            departmentList.forEach(dept => {
                if (dept.id % 100 === 0) levels[dept.id] = 'top';
                else if (dept.id % 10 === 0) levels[dept.id] = 'mid';
                else levels[dept.id] = 'sub';
            });
            setDepartmentLevel(levels);
        }
        setIsLoading(false);
    }, [departmentList]);


    useEffect(() => {
        if (filteredEmployees.length > 0 && selectedEmployees) {
            setSelectAllChecked(
                filteredEmployees.every(employee =>
                    selectedEmployees.some(selected => selected.id === employee.id)
                )
            );
        } else {
            setSelectAllChecked(false);
        }
    }, [filteredEmployees, selectedEmployees]);

    const getDepartmentList = () => {
        setIsLoading(true);
        axios.get("/departments/all")
            .then(res => {
                if (Array.isArray(res.data)) {
                    setDepartmentList(res.data);
                } else {
                    console.error("Received data is not an array:", res.data);
                    setDepartmentList([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch department list:", err);
                setDepartmentList([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };


    const getEmployeeList = () => {
        axios.get("/employee/list")
            .then(res => {
                setEmployeeList(res.data);
            });
    };

    const handleSelectAllChange = (event) => {
        const checked = event.target.checked;
        setSelectAllChecked(checked);
        if (checked) {
            const newSelectedEmployees = [...(selectedEmployees || [])];
            filteredEmployees.forEach(employee => {
                if (!newSelectedEmployees.some(selected => selected.id === employee.id)) {
                    newSelectedEmployees.push(employee);
                }
            });
            setselectedEmployees(newSelectedEmployees);
        } else {
            const newSelectedEmployees = (selectedEmployees || []).filter(
                selected => !filteredEmployees.some(filtered => filtered.id === selected.id)
            );
            setselectedEmployees(newSelectedEmployees);
        }
    };

    const structuredDepartments = Array.isArray(departmentList) && departmentList.length > 0
        ? departmentList.reduce((acc, curr) => {
            const baseId = Math.floor(curr.id / 100) * 100;
            const subId = Math.floor(curr.id / 10) * 10;

            if (!acc[baseId]) {
                acc[baseId] = { id: baseId, departmentName: '', subDepartments: {} };
            }

            if (baseId === curr.id) {
                acc[baseId].departmentName = curr.departmentName;
            } else if (subId === curr.id) {
                if (!acc[baseId].subDepartments[subId]) {
                    acc[baseId].subDepartments[subId] = { id: subId, departmentName: '', subDepartments: {} };
                }
                acc[baseId].subDepartments[subId].departmentName = curr.departmentName;
            } else {
                const parentSubId = Math.floor(curr.id / 10) * 10;
                if (!acc[baseId].subDepartments[parentSubId]) {
                    acc[baseId].subDepartments[parentSubId] = { id: parentSubId, departmentName: '', subDepartments: {} };
                }
                acc[baseId].subDepartments[parentSubId].subDepartments[curr.id] = { id: curr.id, departmentName: curr.departmentName };
            }

            return acc;
        }, {})
        : {};

    const filterEmployees = (id, includeSubDepartments) => {
        const level = departmentLevel[id];
        let employeesToShow = [];

        const addEmployeesForDepartment = (deptId) => {
            employeesToShow = [...employeesToShow, ...employeeList.filter(employee => employee.department.id === deptId)];
        };

        if (includeSubDepartments) {
            switch (level) {
                case 'top':
                    departmentList.filter(dept => Math.floor(dept.id / 100) === Math.floor(id / 100)).forEach(dept => addEmployeesForDepartment(dept.id));
                    break;
                case 'mid':
                    departmentList.filter(dept => Math.floor(dept.id / 10) === Math.floor(id / 10)).forEach(dept => addEmployeesForDepartment(dept.id));
                    break;
                case 'sub':
                    addEmployeesForDepartment(id);
                    break;
            }
        } else {
            addEmployeesForDepartment(id);
        }

        setFilteredEmployees(employeesToShow);
    };

    const handleDepartmentSelect = (id) => {
        const level = departmentLevel[id];
        const departmentNames = findDepartmentNames(id);
        setSelectedDepartmentNames(departmentNames);
        setSelectedDepartment(id);

        switch (level) {
            case 'top':
                handleTopDepartmentExpand(id);
                break;
            case 'mid':
                handleMidDepartmentExpand(id);
                break;
        }

        filterEmployees(id, includeSubDepartments);
    };

    const findDepartmentNames = (departmentId) => {
        let names = [];
        const traverse = (dept, acc) => {
            if (dept.id === departmentId) {
                acc.push(dept.departmentName);
                return acc;
            }

            if (dept.subDepartments) {
                for (const subDept of Object.values(dept.subDepartments)) {
                    const result = traverse(subDept, [...acc, dept.departmentName]);
                    if (result.length) return result;
                }
            }
            return [];
        };

        return traverse(structuredDepartments[Math.floor(departmentId / 100) * 100], []);
    };

    const handleTopDepartmentExpand = (id) => {
        setExpandedTopDepartments(prev => {
            if (prev.includes(id)) {
                return prev.filter(deptId => deptId !== id);
            } else {
                return [id];  // 다른 상위 부서를 닫고 현재 부서만 열기
            }
        });
        // 중간 부서 확장 상태 초기화
        setExpandedMidDepartments([]);
    };
    const handleMidDepartmentExpand = (id) => {
        setExpandedMidDepartments(prev => {
            if (prev.includes(id)) {
                return prev.filter(deptId => deptId !== id);
            } else {
                return [...prev, id];
            }
        });
    };
    const handleEmployeeSelect = (employee) => {
        setselectedEmployees(prevSelected => {
            // prevSelected가 null일 때 빈 배열로 초기화
            const selected = prevSelected || [];
            const alreadySelected = selected.some(selected => selected.id === employee.id);
            if (alreadySelected) {
                return selected.filter(selected => selected.id !== employee.id);
            } else {
                return [...selected, employee];
            }
        });
    };

    const handleIncludeSubDepartmentsChange = (e) => {
        const newIncludeSubDepartments = e.target.checked;
        setIncludeSubDepartments(newIncludeSubDepartments);
        if (selectedDepartmentNames && selectedDepartmentNames.length > 0) { // null 체크 추가
            const selectedDepartmentId = departmentList.find(dept => dept.departmentName === selectedDepartmentNames[selectedDepartmentNames.length - 1]).id;
            filterEmployees(selectedDepartmentId, newIncludeSubDepartments);
        }
    };

    if (isLoading) {
        return <Typography>Loading departments...</Typography>;
    }

    if (!Array.isArray(departmentList) || departmentList.length === 0) {
        return <Typography>No departments available.</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', p: 2, gap: 2, height:'90%'}}>
            {/* Department List */}
            <Box sx={{ flex: 1, bgcolor: '#f1f3f5', borderRadius: 1, p: 2, boxShadow: 1, overflowY: 'auto'}}>
                <Typography variant="h6" gutterBottom>부서 목록</Typography>
                <List>
                    {Object.entries(structuredDepartments).map(([key, department]) => (
                        <React.Fragment key={department.id}>
                            <ListItem
                                button
                                onClick={() => handleDepartmentSelect(department.id)}
                                sx={{
                                    py: 1,
                                    bgcolor: expandedTopDepartments.includes(department.id) ? '#e0e0e0' : 'transparent',
                                    borderRadius: 1,
                                    '&:hover': {
                                        bgcolor: '#e0e0e0'
                                    }
                                }}
                            >
                                <ListItemText primary={department.departmentName} />
                                {Object.keys(department.subDepartments).length > 0 && (expandedTopDepartments.includes(department.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                            </ListItem>
                            {expandedTopDepartments.includes(department.id) && (
                                <List component="div" disablePadding>
                                    {Object.entries(department.subDepartments).map(([subKey, subDepartment]) => (
                                        <React.Fragment key={subDepartment.id}>
                                            <ListItem
                                                button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDepartmentSelect(subDepartment.id);
                                                }}
                                                sx={{
                                                    pl: 4,
                                                    py: 1,
                                                    bgcolor: expandedMidDepartments.includes(subDepartment.id) ? '#dee2e6' : 'transparent',
                                                    borderRadius: 1,
                                                    '&:hover': {
                                                        bgcolor: '#dee2e6'
                                                    }
                                                }}
                                            >
                                                <ListItemText primary={subDepartment.departmentName} />
                                                {Object.keys(subDepartment.subDepartments).length > 0 && (expandedMidDepartments.includes(subDepartment.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                                            </ListItem>
                                            {expandedMidDepartments.includes(subDepartment.id) && (
                                                <List component="div" disablePadding>
                                                    {Object.entries(subDepartment.subDepartments).map(([subSubKey, subSubDepartment]) => (
                                                        <ListItem
                                                            key={subSubDepartment.id}
                                                            button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDepartmentSelect(subSubDepartment.id);
                                                            }}
                                                            sx={{
                                                                pl: 6,
                                                                py: 1,
                                                                bgcolor: 'transparent',
                                                                '&:hover': {
                                                                    bgcolor: '#e9ecef'
                                                                }
                                                            }}
                                                        >
                                                            <ListItemText primary={subSubDepartment.departmentName} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Box>

            {/* Employee List */}
            <Box sx={{ flex: 2, bgcolor: '#fff', borderRadius: 1, p: 2, boxShadow: 1, overflowY: 'auto'}}>
                <Typography variant="h6" gutterBottom>직원 리스트</Typography>
                <Checkbox
                    checked={includeSubDepartments}
                    onChange={handleIncludeSubDepartmentsChange}
                />
                <Typography variant="body2" component="span">하위 부서 포함</Typography>
                {filteredEmployees.length > 0 ? (
                <Box sx={{ ml: 'auto' }}>
                    <Checkbox
                        checked={selectAllChecked}
                        onChange={handleSelectAllChange}
                        disabled={filteredEmployees.length === 0}
                    />
                    <Typography variant="body2" component="span">해당 부서 전체 선택</Typography>
                </Box>):('')}
                <Box sx={{ mb: 2 }}>
                    {selectedDepartmentNames.length > 0 && (
                        <Typography variant="subtitle1" gutterBottom>
                            {selectedDepartmentNames.join('<')}
                        </Typography>
                    )}
                </Box>
                <List>
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(employee => (
                            <ListItem
                                key={employee.id}
                                button
                                onClick={() => handleEmployeeSelect(employee)}
                            >
                                <ListItemIcon onChange={() => handleEmployeeSelect(employee)}>
                                    <Checkbox
                                        checked={selectedEmployees?.some(selected => selected.id === employee.id) || false}
                                        onChange={() => handleEmployeeSelect(employee)}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={employee.name}
                                    secondary={`${employee.position.rank} - ${employee.department.departmentName} - ${employee.email}`}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Typography variant="body2" color="textSecondary">직원이 없습니다</Typography>
                    )}
                </List>
            </Box>

            {/* Selected Employees */}
            <Box sx={{ flex: 2, bgcolor: '#fff', borderRadius: 1, p: 2, boxShadow: 1, overflowY: 'auto'}}>
                <Typography variant="h6" gutterBottom>선택된 직원 정보</Typography>
                {selectedEmployees ? (
                    selectedEmployees.map(employee => (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                py: 1,
                                px: 1,
                                mb: 2,
                                bgcolor: '#f9f9f9',
                                borderRadius: 2,
                                borderLeft: '5px solid #ffd454',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                    bgcolor: '#f0f0f0'
                                }
                            }}
                        >
                            <IconButton onClick={() => handleEmployeeSelect(employee)}>
                                <CloseIcon />
                            </IconButton>
                            <img
                                src={employee.profileFile}
                                alt={`${employee.name}의 프로필`}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    border: '2px solid #ddd',
                                    objectFit: 'cover',
                                    marginRight: '20px'
                                }}
                            />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{employee.name}</Typography>
                                <Typography variant="body2" color="textSecondary">직급: {employee.position.rank}</Typography>
                                <Typography variant="body2" color="textSecondary">이메일: {employee.email}</Typography>
                                <Typography variant="body2" color="textSecondary">전화번호: {employee.phoneNumber}</Typography>
                                <Typography variant="body2" color="textSecondary">부서: {employee.department.departmentName}</Typography>
                                <Typography variant="body2" color="textSecondary">입사일: {employee.firstDay ? employee.firstDay : '정보 없음'}</Typography>
                            </Box>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body2" color="textSecondary">직원을 선택하세요</Typography>
                )}
            </Box>
        </Box>
    );
};

const GroupModal = ({open, onClose, onSelect}) => {
    const [selectedEmployees, setselectedEmployees] = useState([]);

    const handleSave = () => {
        onSelect(selectedEmployees);
        console.log(selectedEmployees)
        handleClose();
    };

    const handleClose = () => {
        setselectedEmployees([]);
        onClose();
    };

    if (!open) return null;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '80%',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <IconButton
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                    onClick={handleClose}
                >
                    <CloseIcon />
                </IconButton>

                <OrganizationChart
                    selectedEmployees={selectedEmployees}
                    setselectedEmployees={setselectedEmployees}
                />

                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="contained" onClick={handleSave}>저장</Button>
                    <Button variant="outlined" onClick={handleClose}>취소</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default GroupModal;
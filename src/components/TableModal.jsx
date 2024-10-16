//결재 진행 상황
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableRow, TableCell, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const TableModal = ({ open, handleClose, approvalLines }) => {
  return (
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
          <DialogTitle>결재 진행 상황</DialogTitle>
          <DialogContent>
              <Table>
                  <TableBody>
                      {/* 직급 */}
                      <TableRow>
                          {approvalLines.map((approver, index) => (
                              <TableCell key={index} align="center">
                                  {approver.position}
                              </TableCell>
                          ))}
                      </TableRow>
                      {/* 이름 */}
                      <TableRow>
                          {approvalLines.map((approver, index) => (
                              <TableCell key={index} align="center">
                                  {approver.name}
                              </TableCell>
                          ))}
                      </TableRow>
                  </TableBody>
              </Table>
          </DialogContent>
          <DialogActions>
              <Button onClick={handleClose}>닫기</Button>
          </DialogActions>
      </Dialog>
  );
};

export default TableModal;
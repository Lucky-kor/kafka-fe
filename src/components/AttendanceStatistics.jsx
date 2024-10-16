import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

import { tokens } from "../theme";

const AttendanceStatistics = ({ employeeId, year }) => {
  const [statsType, setStatsType] = useState('weekly'); // 'weekly' or 'monthly'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    if (employeeId && year) {
      fetchData();
    }
  }, [statsType, employeeId, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8082/attendances/stats?employeeId=${employeeId}&year=${year}&sort=${statsType}`
      );
      const result = await response.json();
      if (response.ok) {
        setData(result);
      } else {
        console.error('API Error:', result);
        setData([]);
      }
    } catch (error) {
      console.error(`Error fetching ${statsType} attendance data:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box mt={2} component={Paper} p={3} elevation={3}  sx={{ backgroundColor: colors.gray[350] }}>
      <Typography variant="h6" mb={2}>
        근무 시간 통계
      </Typography>

      {/* Statistics Type Tabs */}
      <Tabs
        value={statsType}
        onChange={(e, newValue) => setStatsType(newValue)}
        TabIndicatorProps={{
          style: { backgroundColor: colors.blueAccent[500] },
        }}
        sx={{
          '& .MuiTab-root': { color: colors.gray[100] },
          '& .Mui-selected': { color: colors.blueAccent[500] },
        }}
      >
        <Tab label="주별 통계" value="weekly" />
        <Tab label="월별 통계" value="monthly" />
      </Tabs>

      {loading ? (
        <Typography>로딩 중...</Typography>
      ) : data && data.length > 0 ? (
        <>
          {/* Table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{statsType === 'weekly' ? '주차' : '월'}</TableCell>
                <TableCell align="right">총 근무 시간 (시간)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow
                  key={statsType === 'weekly' ? item.week : item.month}
                >
                  <TableCell>
                    {statsType === 'weekly'
                      ? `${item.week}주차`
                      : `${item.month}월`}
                  </TableCell>
                  <TableCell align="right">
                    {item.totalWorkingTime.toFixed(2)} 시간
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Chart */}
          <LineChart
            width={600}
            height={300}
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={statsType === 'weekly' ? 'week' : 'month'}
              label={{
                value: statsType === 'weekly' ? '주차' : '월',
                position: 'insideBottomRight',
                offset: -5,
              }}
            />
            <YAxis
              label={{
                value: '총 근무 시간 (시간)',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalWorkingTime"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </>
      ) : (
        <Typography>데이터가 없습니다.</Typography>
      )}
    </Box>
  );
};

export default AttendanceStatistics;

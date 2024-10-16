import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid"; 
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { tokens } from "../../theme";
import { Header } from "../../components";
import { formatDate } from "@fullcalendar/core";
import useModal from "./useModal";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMdDevices = useMediaQuery("(max-width:920px)");
  const isSmDevices = useMediaQuery("(max-width:600px)");
  const [currentEvents, setCurrentEvents] = useState([]);

  const fetchEvents = async () => {
    try {
        const response = await axios.get("http://localhost:8084/calendars", {
            params: {
              departmentId: 1,
            },
          });
      const data = response.data;

      const events = data
        .map((item) => {
          const start = new Date(item.startTime);
          const end = new Date(item.endTime);

          let backgroundColor = colors.greenAccent[500];
          if (item.carBookId) {
            backgroundColor = colors.redAccent[500];
          } else if (item.roomBookId) {
            backgroundColor = colors.blueAccent[500]; 
          }

          return {
            id: item.calendarId,
            title: item.title,
            start: start, 
            end: end,
            allDay: false, 
            content: item.content,
            backgroundColor, 
          };
        })
        .sort((a, b) => a.start - b.start);

      setCurrentEvents(events);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const { showModal, modal } = useModal(fetchEvents);

  const handleDateClick = async (selected) => {
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();
  
    const inputValues = await showModal(
      "일정 추가",
      "일정을 입력하세요:",
      "add"
    );
  
    if (inputValues) {
      const { title, start, end, content, isReservation, reservationType, selectedOption, purpose } = inputValues;
  
      if (!isReservation) {
        const newEvent = {
          title: title,
          content: content,
          startTime: new Date(start).toISOString(),
          endTime: new Date(end).toISOString(),
        };
  
        try {
          const response = await axios.post("http://localhost:8084/calendars?departmentId=1", newEvent);
  
          if (response.status === 201) {
            fetchEvents();
          } else {
            console.error("Error saving event to server.");
          }
        } catch (error) {
          console.error("Error making POST request:", error);
        }
      } else {
        let reservationUrl = "";
        let requestBody = {
          bookStart: new Date(start).toISOString(),
          bookEnd: new Date(end).toISOString(),
          purpose: purpose,
        };
  
        if (reservationType === "car") {
          reservationUrl = `http://localhost:8084/cars/${selectedOption}/books?employeeId=1&title=${title}&content=${content}`;
        }
        else if (reservationType === "room") {
          reservationUrl = `http://localhost:8084/rooms/${selectedOption}/books?employeeId=1&title=${title}&content=${content}`;
        }
  
        if (reservationUrl) {
          try {
            const response = await axios.post(reservationUrl, requestBody);
  
            if (response.status === 201) {
              fetchEvents();
            } else {
              console.error("Error saving reservation to server.");
            }
          } catch (error) {
            console.error("Error making POST request:", error);
          }
        }
      }
    }
  };

  const handleEventClick = async (selected) => {
    try {
      const response = await axios.get(`http://localhost:8084/calendars/${selected.event.id}`);
      const eventData = response.data.data;
  
      const userDepartmentId = 1;
      const isOwner = eventData.departmentId === userDepartmentId;
  
      const carBookId = eventData.carBookId || null;
      const roomBookId = eventData.roomBookId || null;
  
      await showModal(
        `${eventData.title}`, 
        "", 
        "view", 
        { 
          id: eventData.calendarId,
          ...eventData, 
          isOwner, 
          carBookId, 
          roomBookId 
        }
      );
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  return (
    <Box m="20px">
      <Header title="Calendar" subtitle="Full Calendar Interactive Page" />

      <Box display="flex" justifyContent="center" mb={2}>
        <Box display="flex" alignItems="center" mr={3}>
            <Box 
            width={20} 
            height={20} 
            bgcolor={colors.greenAccent[500]} 
            mr={1} 
            borderRadius="50%"
            />
            <Typography color={colors.gray[100]}>일반 일정</Typography>
        </Box>
        <Box display="flex" alignItems="center" mr={3}>
            <Box 
            width={20} 
            height={20} 
            bgcolor={colors.redAccent[500]} 
            mr={1} 
            borderRadius="50%" 
            />
            <Typography color={colors.gray[100]}>차량 예약</Typography>
        </Box>
        <Box display="flex" alignItems="center">
            <Box 
            width={20} 
            height={20} 
            bgcolor={colors.blueAccent[500]} 
            mr={1} 
            borderRadius="50%" 
            />
            <Typography color={colors.gray[100]}>회의실 예약</Typography>
        </Box>
      </Box>

      <Box display="flex" justifyContent="space-between" gap={2}>
        <Box
          display={`${isMdDevices ? "none" : "block"}`}
          flex="1 1 20%"
          bgcolor={colors.primary[400]}
          p="15px"
          borderRadius="4px"
        >
          <Typography variant="h5">Events</Typography>
          <List>
          {currentEvents
            .filter((event) => event.end > new Date())
            .map((event) => (
              <ListItem
                key={event.id}
                sx={{
                  bgcolor: `${event.backgroundColor}`, 
                  my: "10px",
                  borderRadius: "2px",
                }}
              >
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Typography>
                      {formatDate(event.start, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box
          flex="1 1 100%"
          sx={{
            "& .fc-list-day-cushion ": {
              bgcolor: `${colors.greenAccent[500]} !important`,
            },
          }}
        >
          <FullCalendar
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} 
            headerToolbar={{
              left: `${isSmDevices ? "prev,next" : "prev,next today"}`,
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay", 
            }}
            initialView="dayGridMonth" 
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            events={currentEvents} 
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: false,
            }}
          />
        </Box>
      </Box>
      {modal}
    </Box>
  );
};

export default Calendar;

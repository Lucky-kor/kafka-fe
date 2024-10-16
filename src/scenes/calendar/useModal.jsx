import React, { useState } from 'react';
import AddModal from "./addModal.jsx";
import DeleteModal from "./deleteModal.jsx";
import ViewModal from "./viewModal.jsx";
import UpdateModal from "./updateModal.jsx";
import axios from 'axios';

const useModal = (fetchEvents) => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvePromise, setResolvePromise] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  const [modalType, setModalType] = useState('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const showModal = (title, message, type = 'confirm', details = null) => {
    setEventDetails(details);
    setModalType(type);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const closeModal = () => {
    setIsOpen(false);
    setEventDetails(null);
    setIsDeleteModalOpen(false); 
    if (resolvePromise) resolvePromise(false);
  };

  const handleUpdate = () => {
    setModalType('update');
  };

  const handleUpdateSubmit = async (updatedData) => {
    try {
      const calendarId = eventDetails.id;
      const carBookId = eventDetails.carBookId;
      const roomBookId = eventDetails.roomBookId;
      const departmentId = 1;
  
      const ensureSeconds = (timeString) => {
        return timeString.includes(":") && timeString.split(":").length === 2 
          ? `${timeString}:00` 
          : timeString;
      };
  
      const updatedPayload = {
        title: updatedData.title,
        content: updatedData.content,
        startTime: ensureSeconds(updatedData.start),
        endTime: ensureSeconds(updatedData.end)
      };
  
      if (carBookId) {
        const carResponse = await axios.patch(`http://localhost:8084/car-books/${carBookId}`, {
          bookStart: updatedPayload.startTime,
          bookEnd: updatedPayload.endTime,
          purpose: updatedData.purpose, 
        }, {
          params: { 
            departmentId, 
            title: updatedPayload.title,
            content: updatedPayload.content
          }
        });
  
        if (carResponse.status !== 200) {
          console.error("Failed to update car reservation.");
          return;
        }
      }
  
      if (roomBookId) {
        const roomResponse = await axios.patch(`http://localhost:8084/room-books/${roomBookId}`, {
          bookStart: updatedPayload.startTime,
          bookEnd: updatedPayload.endTime,
          purpose: updatedData.purpose, 
        }, {
          params: { 
            departmentId, 
            title: updatedPayload.title,
            content: updatedPayload.content 
          }
        });

        if (roomResponse.status !== 200) {
          console.error("Failed to update room reservation.");
          return;
        }
      }
  
      if (!carBookId && !roomBookId) {
        const response = await axios.patch(`http://localhost:8084/calendars/${calendarId}`, updatedPayload, {
          params: { departmentId }
        });
  
        if (response.status !== 200) {
          console.error("Failed to update the calendar event.");
          return;
        }
      }
  
      setIsOpen(false);
  
      if (resolvePromise) resolvePromise(true);
  
      if (fetchEvents) {
        fetchEvents();
      }
      
    } catch (error) {
      console.error("Error occurred while updating the event:", error);
    }
  };
  

  const handleDelete = () => {
    setIsDeleteModalOpen(true); 
  };

  const handleDeleteSubmit = async () => {
    try {
      const calendarId = eventDetails.id;
      const carBookId = eventDetails.carBookId;
      const roomBookId = eventDetails.roomBookId;
      const departmentId = 1;
  
      if (carBookId) {
        const carResponse = await axios.delete(`http://localhost:8084/car-books/${carBookId}`, {
          params: { departmentId }
        });
        if (carResponse.status !== 204) {
          console.error("Failed to delete car reservation.");
          return;
        }
      }
  
      if (roomBookId) {
        const roomResponse = await axios.delete(`http://localhost:8084/room-books/${roomBookId}`, {
          params: { departmentId }
        });
        if (roomResponse.status !== 204) {
          console.error("Failed to delete room reservation.");
          return;
        }
      }
  
      if (!carBookId && !roomBookId) {
        const response = await axios.delete(`http://localhost:8084/calendars/${calendarId}`, {
          params: { departmentId }
        });
  
        if (response.status !== 204) {
          console.error("Failed to delete the calendar event.");
          return;
        }
      }
  
      setIsDeleteModalOpen(false);
      setIsOpen(false);
  
      if (resolvePromise) resolvePromise(true);
  
      if (fetchEvents) {
        fetchEvents();
      }
  
    } catch (error) {
      console.error("Error occurred while deleting the event:", error);
    }
  };

  const handleSubmit = (data) => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise(data);
  };

  const modal = (() => {
    if (modalType === 'add') {
      return (
        <AddModal
          isOpen={isOpen}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      );
    }
    if (modalType === 'update') {
      return (
        <UpdateModal
          isOpen={isOpen}
          eventDetails={eventDetails}
          onCancel={closeModal}
          onSubmit={handleUpdateSubmit}
        />
      );
    }
    return (
      <>
        <ViewModal
          isOpen={isOpen}
          eventDetails={eventDetails}
          onCancel={closeModal}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
        {isDeleteModalOpen && (
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onCancel={() => setIsDeleteModalOpen(false)}
            onSubmit={handleDeleteSubmit}
            title="정말 삭제하시겠습니까?"
          />
        )}
      </>
    );
  })();

  return { showModal, closeModal, modal };
};

export default useModal;

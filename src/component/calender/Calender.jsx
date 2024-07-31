// src/Calendar.js
import  { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calender.css';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const response = await fetch('http://52.35.66.255:8000/calendar_app/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_date: '2024-04-01',
        to_date: '2024-04-30',
      }),
    });
    const data = await response.json();
    setEvents(data);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />
      {selectedEvent && (
        <div className="calendar-popup">
          <h3>{selectedEvent.title}</h3>
          <p><strong>Interview With:</strong> {selectedEvent.extendedProps.interviewer}</p>
          <p><strong>Position:</strong> {selectedEvent.extendedProps.position}</p>
          <p><strong>Created By:</strong> {selectedEvent.extendedProps.created_by}</p>
          <p><strong>Interview Date:</strong> {selectedEvent.start.toDateString()}</p>
          <p><strong>Interview Time:</strong> {selectedEvent.start.toLocaleTimeString()}</p>
          <p><strong>Interview Via:</strong> {selectedEvent.extendedProps.via}</p>
          <div className="document-links">
            <a href={selectedEvent.extendedProps.resume} download="Resume.docx">Resume.docx</a>
            <a href={selectedEvent.extendedProps.aadhar} download="Aadharcard">Aadharcard</a>
          </div>
          <button onClick={() => setSelectedEvent(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Calendar;

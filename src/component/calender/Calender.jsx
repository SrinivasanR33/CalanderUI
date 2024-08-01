import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import './Calender.css';
import image from "../../assets/googlemeet.png"
import { BsDownload, BsEye } from 'react-icons/bs';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    const today = new Date();
    fetchEventsForDateRange(today, today);
  }, []);

  const fetchEventsForDateRange = async (start, end) => {
    // const fromDate = start.toISOString().split('T')[0];
    const toDate = end.toISOString().split('T')[0];
    try {
      const response = await axios.get('http://52.35.66.255:8000/calendar_app/api/calendar', {
        params: {
          from_date: "2024-01-23",
          to_date: toDate,
        },
      });
      const data = response.data;
      setEvents(data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })));
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await axios.get('http://52.35.66.255:8000/calendar_app/api/calendar_meeting', {
        params: {
          id: eventId,
        },
      });
      setEventDetails(response.data);
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  const handleEventClick = (clickInfo) => {
    const eventId = clickInfo.event.id;
    setSelectedEvent(clickInfo.event);
    fetchEventDetails(eventId);
  };

  const handleDatesSet = (arg) => {
    fetchEventsForDateRange(arg.start, arg.end);
  };

  return (
    <div className="calendar-container">
      <div className='calendar-insert'>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={events}
          height="100%"
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          allDaySlot={false}

          views={{
            timeGridWeek: {
              titleFormat: { month: 'long', day: '2-digit', }, // Custom title format for week view
            }
          }}
          headerToolbar={{
            left: 'prev,next',
            center: 'title',
            right: 'today dayGridMonth,timeGridWeek,timeGridDay',
          }}
        />
      </div>
      {selectedEvent && eventDetails && (
        <div className="calendar-popup">
          <div className='popup_container'>
            <div className='popup-item1'>
              <h3>Interview With: {eventDetails.user_det.candidate.candidate_firstName} {eventDetails.user_det.candidate.candidate_lastName}</h3>
              <p><strong>Position:</strong> {eventDetails.job_id.jobRequest_Role}</p>
              <p><strong>Created By:</strong> {eventDetails.user_det.handled_by.firstName} {eventDetails.user_det.handled_by.lastName}</p>
              <p><strong>Interview Date:</strong> {new Date(eventDetails.start).toDateString()}</p>
              <p><strong>Interview Time:</strong> {new Date(eventDetails.start).toLocaleTimeString()} - {new Date(eventDetails.end).toLocaleTimeString()}</p>
              <p><strong>Interview Via:</strong> <a href={eventDetails.link} target="_blank" rel="noopener noreferrer">Google Meet</a></p>
              <div className="document-links">
                <a href={eventDetails.candidate_resume} download="Resume.docx"><div className='iconCantainer'>
                  <div className='iconLabel'>Resume.docx</div>
                  <div className='iconI'><BsEye /></div>
                  <div className='iconD'><BsDownload /></div>
                </div></a>
                <a href={eventDetails.candidate?.aadhar} download="Aadharcard"><div className='iconCantainer'>
                  <div className='iconLabel'>Aadharcard</div>
                  <div className='iconI'><BsEye /></div>
                  <div className='iconD'><BsDownload /></div>
                </div></a>
              </div>
            </div>
            <div>
              <div className="calendar-popup-center">
                <img src={image} alt="Google Meet" className="calendar-popup-logo" />
                <a href={eventDetails.link} target="_blank" rel="noopener noreferrer" className="calendar-popup-join-button">JOIN</a>
              </div>
            </div>
          </div>
          <button onClick={() => setSelectedEvent(null)} className="calendar-popup-close-button">Close</button>
        </div>
      )}
    </div>
  );
};

export default Calendar;

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import "./Calender.css";
import image from "../../assets/googlemeet.png";
import { BsDownload, BsEye } from "react-icons/bs";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);

  // Function to aggregate events by date and return a formatted array
  const aggregateEvents = (events) => {
    const eventsByDate = {};

    events.forEach((event) => {
      const date = new Date(event.start).toDateString();
      if (!eventsByDate[date]) {
        eventsByDate[date] = { count: 0, events: [] };
      }
      eventsByDate[date].count += 1;
      eventsByDate[date].events.push(event);
    });

    return Object.keys(eventsByDate).map((date) => {
      const { count, events } = eventsByDate[date];
      return {
        ...events[0], // Take the first event
        extendedProps: {
          ...events[0].extendedProps,
          count,
          events,
        },
      };
    });
  };

  const fetchEventsForDateRange = async (start, end) => {
    const fromDate = start.toISOString().split("T")[0];
    const toDate = end.toISOString().split("T")[0];
    try {
      const response = await axios.get(
        "http://52.35.66.255:8000/calendar_app/api/calendar",
        {
          params: {
            from_date: fromDate,
            to_date: toDate,
          },
        }
      );
      const data = response.data;
      const aggregatedEvents = aggregateEvents(data);
      setEvents(aggregatedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      const response = await axios.get(
        "http://52.35.66.255:8000/calendar_app/api/calendar_meeting",
        {
          params: {
            id: eventId,
          },
        }
      );
      setEventDetails(response.data);
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const renderEventContent = (event) => {
    const res = event.event.extendedProps;
    return (
      <div className="event_contain">
        <div className="event_label">
          <p> {res.job_id.jobRequest_Role}</p>
          {res.count > 1 && (
            <p className="event_count">+{res.count - 1} more</p>
          )}
          <p>
            <strong>Interviewer:</strong> {res.user_det.handled_by.firstName}{" "}
            {res.user_det.handled_by.lastName}
          </p>
        </div>
      </div>
    );
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
      <div className="calendar-insert">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={events}
          height="100%"
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          eventContent={renderEventContent}
          allDaySlot={false}
          views={{
            timeGridWeek: {
              titleFormat: { month: "long", day: "2-digit" },
            },
          }}
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "today dayGridMonth,timeGridWeek,timeGridDay",
          }}
        />
      </div>
      {selectedEvent && eventDetails && (
        <div className="calendar-popup">
          <div className="popup_container">
            <div className="popup-item1">
              <h3>
                Interview With:{" "}
                {eventDetails.user_det.candidate.candidate_firstName}{" "}
                {eventDetails.user_det.candidate.candidate_lastName}
              </h3>
              <p>
                <strong>Position:</strong> {eventDetails.job_id.jobRequest_Role}
              </p>
              <p>
                <strong>Created By:</strong>{" "}
                {eventDetails.user_det.handled_by.firstName}{" "}
                {eventDetails.user_det.handled_by.lastName}
              </p>
              <p>
                <strong>Interview Date:</strong>{" "}
                {new Date(eventDetails.start).toDateString()}
              </p>
              <p>
                <strong>Interview Time:</strong>{" "}
                {new Date(eventDetails.start).toLocaleTimeString()} -{" "}
                {new Date(eventDetails.end).toLocaleTimeString()}
              </p>
              <p>
                <strong>Interview Via:</strong>{" "}
                <a
                  href={eventDetails.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Meet
                </a>
              </p>
              <div className="document-links">
                <a href={eventDetails.candidate_resume} download="Resume.docx">
                  <div className="iconCantainer">
                    <div className="iconLabel">Resume.docx</div>
                    <div className="iconI">
                      <BsEye />
                    </div>
                    <div className="iconD">
                      <BsDownload />
                    </div>
                  </div>
                </a>
                <a href={eventDetails.candidate?.aadhar} download="Aadharcard">
                  <div className="iconCantainer">
                    <div className="iconLabel">Aadharcard</div>
                    <div className="iconI">
                      <BsEye />
                    </div>
                    <div className="iconD">
                      <BsDownload />
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <div>
              <div className="calendar-popup-center">
                <img
                  src={image}
                  alt="Google Meet"
                  className="calendar-popup-logo"
                />
                <a
                  href={eventDetails.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="calendar-popup-join-button"
                >
                  JOIN
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedEvent(null)}
            className="calendar-popup-close-button"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;

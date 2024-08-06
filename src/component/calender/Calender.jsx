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
  const [eventList, setEventList] = useState([]);
  const [openEventList, setOpenEventList] = useState(false);

  // Function to aggregate events by date and return a formatted array
  const aggregateEvents = (events, viewType) => {
    const eventsGrouped = {};
    console.log(viewType);
    events.forEach((event) => {
      const key =
        viewType === "dayGridMonth"
          ? new Date(event.start).toDateString()
          : new Date(event.start).toISOString();

      if (!eventsGrouped[key]) {
        eventsGrouped[key] = { count: 0, events: [] };
      }
      eventsGrouped[key].count += 1;
      eventsGrouped[key].events.push(event);
    });

    return Object.keys(eventsGrouped).map((key) => {
      const { count, events } = eventsGrouped[key];
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

  const fetchEventsForDateRange = async (start, end, type) => {
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
      const aggregatedEvents = aggregateEvents(data, type);
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
      <div>
        {openEventList && res.count > 1 ? (
          <div className={"event-list-special"}>
            {res.count > 1 && (
              <div className="count_contain">
                <p className="event_count">{res.count}</p>
              </div>
            )}
            <div className="event_label">
              <p> {res.job_id?.jobRequest_Role}</p>
              <p>
                <strong>Interviewer:</strong>{" "}
                {res.user_det.handled_by.firstName}{" "}
                {res.user_det.handled_by.lastName}
              </p>
            </div>
          </div>
        ) : (
          <div className={openEventList ? "event-list" : "event_contain"}>
            {res.count > 1 && (
              <div className="count_contain">
                <p className="event_count">{res.count}</p>
              </div>
            )}
            <div className="event_label">
              <p> {res.job_id?.jobRequest_Role}</p>

              <p>
                <strong>Interviewer:</strong>{" "}
                {res.user_det.handled_by.firstName}{" "}
                {res.user_det.handled_by.lastName}
              </p>
            </div>
          </div>
        )}
        <div className="map-position">
          <div className="map-list">
            {eventList?.length > 1 &&
              res.count > 1 &&
              eventList.map((val) => (
                <div
                  className="event_contain"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event from propagating to the parent
                    handelOpen(val);
                  }}
                  key={val.id}
                >
                  <div className="event_label">
                    <p> {val.job_id?.jobRequest_Role}</p>
                    {val.count > 1 && (
                      <p className="event_count">+{val.count - 1} more</p>
                    )}
                    <p>
                      <strong>Interviewer:</strong>{" "}
                      {val.user_det.handled_by.firstName}{" "}
                      {val.user_det.handled_by.lastName}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };
  const handelOpen = (event) => {
    console.log(event);
    const eventId = event.id;
    setSelectedEvent(event); // Set the selected event
    fetchEventDetails(eventId); // Fetch event details
  };
  const handleEventClick = (clickInfo) => {
    const eventId = clickInfo.event.id;
    const event = clickInfo.event?.extendedProps;

    // console.log(clickInfo, eventId, "hi");

    if (openEventList) {
      // If event list is open, empty the event list
      setEventList([]);
      setOpenEventList(false); // Toggle the event list visibility
    }

    if (!openEventList && event?.count > 1) {
      setOpenEventList(!openEventList); // Toggle the event list visibility
      setEventList(event.events || []); // Update event list
      setSelectedEvent(null); // Set to null or false as needed
    } else {
      if (event?.count === 1) {
        setOpenEventList(false); // Close the event list
        setEventList([]); // Clear the event list
        setSelectedEvent(clickInfo.event); // Set the selected event
        fetchEventDetails(eventId);
      } // Fetch event details
    }
  };

  const handleDatesSet = (arg) => {
    console.log(arg);
    fetchEventsForDateRange(arg.start, arg.end, arg.view.type);
  };

  return (
    <div
      className={
        openEventList ? "calendar-container-blur" : "calendar-container"
      }
    >
      <div
        className={openEventList ? "calendar-insert-blur" : "calendar-insert"}
      >
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
          headerToolbar={
            openEventList
              ? false // Hide header toolbar when openEventList is true
              : {
                  left: "prev,next",
                  center: "title",
                  right: "today dayGridMonth,timeGridWeek,timeGridDay",
                }
          }
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
                <strong>Position:</strong>{" "}
                {eventDetails.job_id?.jobRequest_Role}
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

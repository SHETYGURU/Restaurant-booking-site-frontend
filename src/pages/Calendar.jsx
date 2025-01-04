import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import BookingForm from "@/pages/BookingForm";
import { realtimeDb } from "@/connection.db";
import { ref, onValue } from "firebase/database";
import { MdOutlineEventAvailable, MdCheckCircle } from "react-icons/md";
import Navbar from "./Navbar";

const slots = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"];

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [slotStatus, setSlotStatus] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const currentDateTime = new Date();

  useEffect(() => {
    if (selectedDate) {
      const dateKey = new Date(
        selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      const slotsRef = ref(realtimeDb, `reservations/${dateKey}`);

      const unsubscribe = onValue(
        slotsRef,
        (snapshot) => {
          const data = snapshot.val() || {};
          setBookedSlots((prev) => ({
            ...prev,
            [dateKey]: Object.keys(data),
          }));

          const newSlotStatus = {};
          slots.forEach((slot) => {
            const slotData = data[slot] || {};
            newSlotStatus[slot] = {
              table1Booked: !!slotData.table1,
              table2Booked: !!slotData.table2,
              isFullyBooked: !!slotData.table1 && !!slotData.table2,
            };
          });
          setSlotStatus(newSlotStatus);
        },
        (error) => {
          console.error("Error fetching slot data:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowSlots(true);
    setShowForm(false);
    setErrorMessage(null); 
  };

  const handleSlotClick = (slot) => {
    const isSlotFullyBooked = slotStatus[slot]?.isFullyBooked;
    if (isSlotFullyBooked) return;

    const selectedSlotDate = new Date(selectedDate);
    const [hours, minutes] = slot.split(":");
    selectedSlotDate.setHours(hours);
    selectedSlotDate.setMinutes(minutes);

    const timeDifference = selectedSlotDate - currentDateTime;

    // Ensure slot is at least 1 hour ahead
    if (timeDifference <= 0 || timeDifference < 3600000) {
      setErrorMessage("Please select a time that is at least 1 hour ahead.");
      return;
    }

    setSelectedSlot(slot);
    setShowForm(true);
  };

  const handleBookingComplete = () => {
    setShowForm(false);
    setSelectedSlot(null);
    setShowDialog(true);

    setTimeout(() => {
      setShowDialog(false);
    }, 2000);
  };

  const isDateDisabled = (date) => {
    const selectedDateTime = new Date(date);
    return selectedDateTime < currentDateTime;
  };

  return (
    <div>
      <Navbar />

      <div
        className="p-6 flex flex-col items-center min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: 'url(/assets/bg.png)', 
        }}
      >
        {!showCalendar && (
          <div className="text-center flex flex-col items-center justify-center min-h-screen">
            <img
              src="/assets/logo.png"
              alt="Restaurant Logo"
              className="w-32 h-32 mb-4"
            />
            <h1 className="text-3xl font-bold mb-2">Welcome to Our Restaurant</h1>
            <p className="text-gray-600 mb-6">
              Book your table now and enjoy a delightful dining experience!
            </p>
            <button
              onClick={() => setShowCalendar(true)}
              className="px-4 py-2 text-sm sm:text-base bg-white text-black font-bold rounded-lg shadow-md hover:bg-gray-700 hover:text-white  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white transition-transform duration-200 ease-in-out"
            >
              <MdOutlineEventAvailable size={24} className="inline mr-2" />
              Book Your Table
            </button>
          </div>
        )}

        {showCalendar && (
          <div className="w-full max-w-6xl mt-6 flex flex-col md:flex-row gap-8">
            {/* Calendar Section */}
            <div className="flex-1">
              <h2 className="text-lg font-bold mb-4">Select a Date</h2>
              <div className="rounded-lg overflow-hidden transition-all duration-300 ease-in-out hover:scale-105">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileDisabled={({ date }) => isDateDisabled(date)} // Disable past dates
                  tileClassName={({ date }) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    if (isToday) {
                      return "border-2 border-green-500 bg-opacity-50 rounded-lg";
                    }
                    if (isDateDisabled(date)) {
                      return "opacity-50 cursor-not-allowed";
                    }
                    return "rounded-lg";
                  }}
                />
              </div>
            </div>

            <div className="flex-1">
              {showSlots && selectedDate && (
                <>
                  <h3 className="text-md font-bold mb-4">
                    Available Slots for {selectedDate.toDateString()}
                  </h3>
                  {Object.keys(slotStatus).length === 0 ? (
                    <p className="text-gray-500">No slots available for this date.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {slots.map((slot) => {
                        const { isFullyBooked } = slotStatus[slot] || {};
                        return (
                          <button
                            key={slot}
                            className={`p-3 sm:p-4 text-black rounded border focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-300 ease-in-out hover:scale-105`}
                            style={{
                              backgroundColor: isFullyBooked
                                ? "rgba(255, 99, 71, 0.1)"
                                : "rgba(144, 238, 144, 0.1)",
                              borderColor: isFullyBooked
                                ? "rgba(255, 99, 71, 1.0)"
                                : "rgba(144, 238, 144, 1.0)",
                              borderWidth: isFullyBooked ? "2px" : "1px",
                            }}
                            onClick={() => handleSlotClick(slot)}
                            disabled={isFullyBooked}
                            title={isFullyBooked ? "Fully booked" : "Available"}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {errorMessage && (
                    <p className="text-red-500 mt-4">{errorMessage}</p>
                  )}
                </>
              )}
              {showForm && selectedDate && selectedSlot && (
                <BookingForm
                  selectedSlot={selectedSlot}
                  selectedDate={selectedDate}
                  onBookingComplete={handleBookingComplete}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {showDialog && (
       <div
       className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50"
       style={{ animation: "fadeIn 1s ease-out" }}
     >
       <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
         <div className="flex items-center justify-center mb-4 space-x-2">
           <MdCheckCircle size={24} className="text-green-500" />
           <h3 className="text-xl font-semibold text-gray-800">Booking Confirmed!</h3>
         </div>
         <p className="text-gray-600">Your table has been successfully booked.</p>
         <p className="text-gray-600">For details , please vist <b>Profile</b></p>

       </div>
     </div>
     
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { realtimeDb } from "@/connection.db";
import { ref, onValue, remove } from "firebase/database";
import Navbar from "./Navbar";
import { FaEye, FaTrashAlt } from "react-icons/fa";

export default function ProfilePage() {
  const [userEmail, setUserEmail] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("email");

    if (!email) {
      console.error("User email not found in localStorage.");
      return;
    }

    setUserEmail(email);

    const reservationsRef = ref(realtimeDb, "reservations");

    onValue(
      reservationsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const allData = snapshot.val();
          const userBookings = [];

          for (const date in allData) {
            const dateData = allData[date];
            for (const slot in dateData) {
              const slotData = dateData[slot];
              for (const table in slotData) {
                const booking = slotData[table];
                const correctedEmail = booking.bookedBy.replace(/_/g, ".");
                if (correctedEmail === email) {
                  userBookings.push({
                    table: table,
                    date: date,
                    slot: slot,
                    guests: booking.guests,
                    name: booking.name,
                    contact: booking.contact,
                  });
                }
              }
            }
          }

          setBookings(userBookings);
        } else {
          setBookings([]);
        }
      },
      (error) => {
        console.error("Error fetching bookings: " + error.message);
      }
    );
  }, []);

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowPopup(true);
  };

  const handleDeleteConfirmation = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    const booking = bookingToDelete;
    if (booking) {
      const bookingRef = ref(realtimeDb, `reservations/${booking.date}/${booking.slot}/${booking.table}`);
      remove(bookingRef)
        .then(() => {
          setBookings((prev) =>
            prev.filter((b) => b.table !== booking.table || b.date !== booking.date || b.slot !== booking.slot)
          );
          setShowDeleteDialog(false);
        })
        .catch((error) => {
          console.error("Error deleting booking:", error);
          setShowDeleteDialog(false);
        });
    }
  };

  return (
    <div>
      <Navbar />
      <div className="relative min-h-screen bg-gray-50 p-6 flex flex-col items-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: "url('/assets/bg.png')" }}
        ></div>

        <div className="relative z-10 w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Your Bookings</h2>
          {bookings.length > 0 ? (
            <table className="min-w-full table-auto border-collapse shadow-lg rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-4 py-2 border-t border-l border-gray-300 text-left rounded-tl-lg">Table No</th>
                  <th className="px-4 py-2 border-t border-gray-300 text-left">Date</th>
                  <th className="px-4 py-2 border-t border-gray-300 text-left">Slot</th>
                  <th className="px-4 py-2 border-t border-r border-gray-300 text-left rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{booking.table}</td>
                    <td className="px-4 py-2">{booking.date}</td>
                    <td className="px-4 py-2">{booking.slot}</td>
                    <td className="px-4 py-2 flex space-x-4">
                      <button
                        onClick={() => handleView(booking)}
                        className="hover:scale-110 transform transition duration-200"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDeleteConfirmation(booking)}
                        className="hover:scale-110 transform transition duration-200"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-2 border-b border-l border-r border-gray-300 rounded-bl-lg rounded-br-lg"
                  ></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="text-gray-500">No bookings found for your account.</p>
          )}
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-6 text-center">Are you sure you want to delete this booking?</h3>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-black transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-black transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-6 text-center">Booking Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Table No:</strong> {selectedBooking.table}
              </p>
              <p>
                <strong>Date:</strong> {selectedBooking.date}
              </p>
              <p>
                <strong>Slot:</strong> {selectedBooking.slot}
              </p>
              <p>
                <strong>Guests:</strong> {selectedBooking.guests}
              </p>
              <p>
                <strong>Name:</strong> {selectedBooking.name}
              </p>
              <p>
                <strong>Contact:</strong> {selectedBooking.contact}
              </p>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-1 text-sm bg-white text-black border border-black rounded hover:bg-black hover:text-white transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

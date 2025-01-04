import { useState, useEffect } from "react";
import { realtimeDb } from "@/connection.db";
import { ref, set, get, update } from "firebase/database";

export default function BookingForm({ selectedSlot, selectedDate, onBookingComplete }) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    guests: "",
    date: "",
    slot: "",
    tableNumber: "",
  });

  const [tableStatus, setTableStatus] = useState({
    table1: false, 
    table2: false, 
  });

  const [isOpen, setIsOpen] = useState(true); 
  const [dialogMessage, setDialogMessage] = useState(""); 
  const [showDialog, setShowDialog] = useState(false); 

  const email = localStorage.getItem("email");

  useEffect(() => {
    if (selectedDate && selectedSlot) {
      const formattedDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0]; 
  
      setFormData((prev) => ({
        ...prev,
        date: formattedDate,
        slot: selectedSlot,
      }));
  
      const fetchTableStatus = async () => {
        const bookingRef = ref(realtimeDb, `reservations/${formattedDate}/${selectedSlot}`);
        const snapshot = await get(bookingRef);
  
        if (snapshot.exists()) {
          const data = snapshot.val();
          setTableStatus({
            table1: !!data?.table1,
            table2: !!data?.table2,
          });
        } else {
          setTableStatus({ table1: false, table2: false });
        }
      };
      fetchTableStatus();
    }
  }, [selectedDate, selectedSlot]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; 
    } else {
      document.body.style.overflow = "auto"; 
    }

    return () => {
      document.body.style.overflow = "auto"; 
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableSelection = (table) => {
    if (!tableStatus[table]) {
      setFormData((prev) => ({ ...prev, tableNumber: table }));
    } else {
      setDialogMessage(`${table} is already booked. Please choose another table.`);
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setDialogMessage("User not logged in.");
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 1500);
      return;
    }

    // Sanitize email for Firebase
    const sanitizedEmail = email.replace(/\./g, "_").replace(/\#/g, "").replace(/\$/g, "").replace(/\[/g, "").replace(/\]/g, "");

    try {
      const dateKey = formData.date;
      const tableKey = formData.tableNumber; 

      if (!tableKey) {
        setDialogMessage("Please select a table before proceeding.");
        setShowDialog(true);
        setTimeout(() => setShowDialog(false), 1500);
        return;
      }

      const tableRef = ref(realtimeDb, `reservations/${dateKey}/${selectedSlot}/${tableKey}`);
      const snapshot = await get(tableRef);

      if (snapshot.exists()) {
        setDialogMessage(`${tableKey} is already booked. Please choose another table.`);
        setShowDialog(true);
        setTimeout(() => setShowDialog(false), 1500);
        return;
      }

      const bookingData = {
        name: formData.name,
        contact: formData.contact,
        guests: formData.guests,
        tableNumber: formData.tableNumber,
        date: formData.date,
        slot: formData.slot,
      };

      await set(tableRef, {
        bookedBy: sanitizedEmail,
        ...bookingData,
      });

setTableStatus((prev) => ({
        ...prev,
        [tableKey]: true,
      }));

      onBookingComplete(selectedSlot);

      setIsOpen(false);
    } catch (error) {
      console.error("Error during booking:", error);
      setDialogMessage("Failed to book the table.");
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 1500);
    }
  };

  const closeModal = () => setIsOpen(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 shadow-xl rounded-lg relative w-full md:w-1/2 max-h-[80vh] overflow-y-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transform hover:scale-105 transition-all duration-200"
        >
          close x 
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Booking Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4 flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500 transition-all duration-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">Contact</label>
              <input
                type="text"
                name="contact"
                required
                value={formData.contact}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>
          <div className="mb-4 flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Number of Guests</label>
              <input
                type="number"
                name="guests"
                required
                value={formData.guests}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500 transition-all duration-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">Date</label>
              <input
                type="text"
                name="date"
                value={formData.date || ""}
                readOnly
                className="w-full p-2 border rounded bg-white"
              />
            </div>
          </div>
          <div className="mb-4 flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Time Slot</label>
              <input
                type="text"
                name="slot"
                value={formData.slot || ""}
                readOnly
                className="w-full p-2 border rounded bg-white"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Select Table</label>
            <div className="flex space-x-4">
              <button
                type="button"
                className={`w-1/2 p-4 border rounded focus:outline-none focus:border-green-500 transform hover:scale-105 transition-all duration-200 ${tableStatus.table1 ? "bg-opacity-10 text-black border-red-500" : "bg-opacity-100 text-black"}`}
                onClick={() => handleTableSelection("table1")}
              >
                {tableStatus.table1 ? "Booked" : "Table 1"}
              </button>
              <button
                type="button"
                className={`w-1/2 p-4 border rounded focus:outline-none focus:border-green-500 transform hover:scale-105 transition-all duration-200 ${tableStatus.table2 ? "bg-opacity-10 text-black border-red-500" : "bg-opacity-100 text-black"}`}
                onClick={() => handleTableSelection("table2")}
              >
                {tableStatus.table2 ? "Booked" : "Table 2"}
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <button type="submit" className="w-1/2 bg-gray-700 text-white py-2 rounded mt-4 hover:bg-black hover:shadow-lg transition-all duration-300 hover:scale-105">
              Confirm Booking
            </button>
          </div>
        </form>
        {showDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-lg text-center">
              <p>{dialogMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

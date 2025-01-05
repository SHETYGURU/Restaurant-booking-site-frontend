import { useState, useEffect } from "react";
import { realtimeDb } from "@/connection.db";
import { ref, set, get } from "firebase/database";

export default function BookingForm({ selectedSlot, selectedDate, onBookingComplete }) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    guests: "",
    date: "",
    slot: "",
    tableNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [tableStatus, setTableStatus] = useState({
    table1: false,
    table2: false,
  });
  const [isOpen, setIsOpen] = useState(true);
  const [dialogMessage, setDialogMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("email");
      setEmail(storedEmail || "");
    }
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate individual fields
    const newErrors = { ...errors };
    if (name === "name" && !value.trim()) {
      newErrors.name = "Name is required.";
    } else if (name === "contact" && !/^\d{10}$/.test(value)) {
      newErrors.contact = "Contact must be a 10-digit number.";
    } else if (name === "guests" && (isNaN(value) || value < 1 || value > 6)) {
      newErrors.guests = "Guests must be between 1 and 6.";
    } else {
      delete newErrors[name];
    }
    setErrors(newErrors);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (!formData[name] && name !== "tableNumber") {
      setErrors((prev) => ({
        ...prev,
        [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const requiredFields = ["name", "contact", "guests", "date", "slot", "tableNumber"];
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
      }
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setDialogMessage("Please correct the errors before submitting.");
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 1500);
      return;
    }

    try {
      const sanitizedEmail = email.replace(/\./g, "_").replace(/\#/g, "").replace(/\$/g, "").replace(/\[/g, "").replace(/\]/g, "");
      const dateKey = formData.date;
      const tableKey = formData.tableNumber;

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

      onBookingComplete(selectedSlot);
      setIsOpen(false);
    } catch (error) {
      console.error("Error during booking:", error);
      setDialogMessage("Failed to book the table.");
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 shadow-xl rounded-lg relative w-full md:w-1/2 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-center">Booking Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4 flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500 transition-all duration-300"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              {!errors.name && formData.name && <p className="text-green-500 text-sm">✔</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full p-2 border rounded focus:outline-none focus:border-blue-500 transition-all duration-300"
              />
              {errors.contact && <p className="text-red-500 text-sm">{errors.contact}</p>}
              {!errors.contact && formData.contact && <p className="text-green-500 text-sm">✔</p>}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Number of Guests</label>
            <input
              type="number"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500 transition-all duration-300"
            />
            {errors.guests && <p className="text-red-500 text-sm">{errors.guests}</p>}
            {!errors.guests && formData.guests && <p className="text-green-500 text-sm">✔</p>}
          </div>
          {/* Other fields remain unchanged */}
          <button
            type="submit"
            className="w-1/2 bg-gray-700 text-white py-2 rounded mt-4 hover:bg-black hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Confirm Booking
          </button>
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

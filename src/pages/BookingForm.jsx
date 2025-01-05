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

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
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
      const formattedDate = new Date(
        selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
      )
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

  const validateField = (name, value) => {
    let error = "";
    if (name === "name" && !value.trim()) {
      error = "Name is required.";
    } else if (name === "contact" && !/^\d{10}$/.test(value)) {
      error = "Enter a valid 10-digit phone number.";
    } else if (name === "guests" && (value < 1 || value > 6)) {
      error = "Guests must be between 1 and 6.";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
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
    const hasErrors = Object.values(formErrors).some((error) => error);

    if (hasErrors || !formData.tableNumber) {
      setDialogMessage("Please fix errors before submitting.");
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 1500);
      return;
    }

    if (!email) {
      setDialogMessage("User not logged in.");
      setShowDialog(true);
      setTimeout(() => setShowDialog(false), 1500);
      return;
    }

    try {
      const sanitizedEmail = email.replace(/[.#$\[\]]/g, "_");
      const tableRef = ref(
        realtimeDb,
        `reservations/${formData.date}/${selectedSlot}/${formData.tableNumber}`
      );
      const snapshot = await get(tableRef);

      if (snapshot.exists()) {
        setDialogMessage(`${formData.tableNumber} is already booked. Please choose another table.`);
        setShowDialog(true);
        setTimeout(() => setShowDialog(false), 1500);
        return;
      }

      await set(tableRef, {
        bookedBy: sanitizedEmail,
        ...formData,
      });

      setTableStatus((prev) => ({
        ...prev,
        [formData.tableNumber]: true,
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
          Close x
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Booking Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`border ${
                formErrors.name ? "border-red-500" : "border-gray-300"
              } rounded`}
            />
            {touchedFields.name && (
              <span className="text-sm">
                {formErrors.name ? (
                  <span className="text-red-500">{formErrors.name}</span>
                ) : (
                  "✔"
                )}
              </span>
            )}
          </div>
          <div>
            <label>Contact</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`border ${
                formErrors.contact ? "border-red-500" : "border-gray-300"
              } rounded`}
            />
            {touchedFields.contact && (
              <span className="text-sm">
                {formErrors.contact ? (
                  <span className="text-red-500">{formErrors.contact}</span>
                ) : (
                  "✔"
                )}
              </span>
            )}
          </div>
          <div>
            <label>Guests</label>
            <input
              type="number"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`border ${
                formErrors.guests ? "border-red-500" : "border-gray-300"
              } rounded`}
            />
            {touchedFields.guests && (
              <span className="text-sm">
                {formErrors.guests ? (
                  <span className="text-red-500">{formErrors.guests}</span>
                ) : (
                  "✔"
                )}
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleTableSelection("table1")}
              className={`p-2 border rounded ${
                formData.tableNumber === "table1" ? "bg-green-500 text-white" : ""
              }`}
            >
              Table 1
            </button>
            <button
              type="button"
              onClick={() => handleTableSelection("table2")}
              className={`p-2 border rounded ${
                formData.tableNumber === "table2" ? "bg-green-500 text-white" : ""
              }`}
            >
              Table 2
            </button>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
        {showDialog && (
          <div className="mt-4 text-center text-red-500">{dialogMessage}</div>
        )}
      </div>
    </div>
  );
}

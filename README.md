
# Restaurant Table Booking System

This is a table booking system for a restaurant, allowing customers to select a date, time slot, and book a table. It integrates with Firebase to store reservation data and offers a user-friendly interface built with React.js, styled with Tailwind CSS.

##Live Demo
 [Live Demo](https://neina.netlify.app)
## Features

- **Calendar Interface**: Users can select a date and check available slots for booking.
- **Slot Availability**: Displays available and fully-booked time slots.
- **Booking Form**: After selecting a time slot, users can fill out a booking form.
- **Confirmation Dialog**: After successfully booking a table, a confirmation dialog appears.
- **Responsive Design**: The system is responsive and works on mobile and desktop devices.

## Technologies Used

- **Frontend**:
  - React.js
  - Tailwind CSS
  - React Calendar
  - Firebase Realtime Database
  - React Icons
  
- **Backend**:
  - Firebase Realtime Database for storing reservations

## Setup Instructions

### Prerequisites

- Node.js (v16 or above)
- Firebase project (with Realtime Database set up)

### Installation

1. Clone the repository:

   

2. Navigate into the project directory:

   ```bash
   cd restaurant-table-booking
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up Firebase:

   - Create a Firebase project [here](https://console.firebase.google.com/).
   - Set up Firebase Realtime Database and get your Firebase credentials.
   - Add your `firebase-config.js` with the credentials to the `src/connection.db.js` file (refer to Firebase documentation for details on setting up the config).

5. Start the development server:

   ```bash
   npm run dev
   ```

6. The application will be running on [http://localhost:3000](http://localhost:3000).


## How it Works

1. **Landing Page**: When the user opens the app, they see a landing page with a "Book Your Table" button. Upon clicking, the calendar interface is displayed.
2. **Calendar**: Users can select a date, and available slots are shown for that date.
3. **Slot Selection**: Users can select a time slot. If the slot is available, a form is displayed for them to complete their booking.
4. **Booking Confirmation**: After completing the form and submitting the booking, a confirmation dialog is shown, and the booking is stored in Firebase.



### Key sections:
- **Features**: Lists key functionalities of the system.
- **Technologies Used**: Lists the tech stack used in the project.
- **Setup Instructions**: Provides a step-by-step guide for setting up the project locally.
- **File Structure**: Shows the structure of the codebase.
- **How it Works**: Explains the workflow from the landing page to booking confirmation.
- **Contributing**: Encourages others to contribute to the project.
- **License**: Specifies the project's open-source license (MIT).


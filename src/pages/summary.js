import { useRouter } from "next/router";

export default function Summary() {
  const router = useRouter();
  const { name, date, time, guests } = router.query;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Booking Summary</h1>
        <p className="mb-2">Thank you for your reservation, {name}!</p>
        <p className="mb-2">Date: {date}</p>
        <p className="mb-2">Time: {time}</p>
        <p className="mb-2">Number of Guests: {guests}</p>
        <button
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => router.push("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

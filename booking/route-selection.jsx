import BookingForm from '@/components/home/BookingForm';

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <BookingForm />
      </div>
    </div>
  );
}

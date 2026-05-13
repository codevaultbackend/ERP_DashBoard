type ErrorAlertProps = {
  message: string;
};

export default function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="mb-5 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
      {message}
    </div>
  );
}
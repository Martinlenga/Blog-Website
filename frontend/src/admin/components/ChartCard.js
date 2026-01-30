export default function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col">
      <h3 className="text-gray-500 font-medium mb-4">{title}</h3>
      <div className="flex-1">{children}</div>
    </div>
  );
}

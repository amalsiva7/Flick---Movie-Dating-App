const StatCard = ({ title, value, icon, onClick }) => {
    return (
      <button onClick={onClick} className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md w-full text-left">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="rounded-lg bg-[#B5F0F5] p-3">{icon}</div>
        </div>
      </button>
    );
  };
  
  export default StatCard;
  
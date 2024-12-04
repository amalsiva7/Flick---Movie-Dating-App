import React from "react";

const MetricCard = ({ color, title, value }) => {
  return (
    <div
      className={`rounded-lg shadow-lg p-6 ${color} flex flex-col justify-center items-center`}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
};

export default MetricCard;

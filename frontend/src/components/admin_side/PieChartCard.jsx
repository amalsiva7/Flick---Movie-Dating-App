import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const PieChartCard = ({ title, percentage, color, lightColor }) => {
  const data = [
    { name: "Value", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ]

  return (
    <div className="flex flex-col items-center space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <div className="relative h-32 w-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={40}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell key={`cell-0`} fill={color} />
              <Cell key={`cell-1`} fill={lightColor} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-800">{percentage}%</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
    </div>
  )
}

export default PieChartCard

import { useEffect, useState } from "react"
import StatCard from "./StatCard"
import PieChartCard from "./PieChartCard"
import WeeklyChart from "./WeeklyChart"
import { Users, CreditCard, PlayCircle, DollarSign, Loader2 } from "lucide-react"
import axiosInstance from "../../utils/axiosConfig"
import { useNavigate } from 'react-router-dom';


const SubscriptionDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
    totalPlans: 0,
    totalSubscribers: 0,
    ongoingPlans: 0,
    totalRevenue: 0,
  })

  const [subscriberData, setSubscriberData] = useState({
    totalPercentage: 0,
    malePercentage: 0,
    femalePercentage: 0,
  })

  const [weeklyData, setWeeklyData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await axiosInstance.get('user-admin/subscription-stats/');

        // For now, we'll use dummy data
        setStats({
            totalPlans: statsResponse.data.total_plans,
          totalSubscribers: 1250,
          ongoingPlans: statsResponse.data.active_plans,
          totalRevenue: 45750,
        })

        setSubscriberData({
          totalPercentage: 81, // 81% of active users are subscribers
          malePercentage: 62, // 62% of subscribers are male
          femalePercentage: 22, // 22% of subscribers are female
        })

        setWeeklyData([
          { day: "Mon", subscriptions: 12 },
          { day: "Tue", subscriptions: 18 },
          { day: "Wed", subscriptions: 25 },
          { day: "Thu", subscriptions: 20 },
          { day: "Fri", subscriptions: 30 },
          { day: "Sat", subscriptions: 22 },
          { day: "Sun", subscriptions: 15 },
        ])

        setLoading(false)
      } catch (error) {
        console.error("Error fetching subscription data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])


  return (
    <div className="h-full bg-white relative shadow-md rounded-lg ">
        <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Subscription Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Subscription Plans"
         value={stats.totalPlans} 
         icon={<CreditCard className="h-8 w-8" />}
         onClick={()=> navigate('/admin/subscription-plan-list')} />
         
        <StatCard title="Total Subscribers" value={stats.totalSubscribers} icon={<Users className="h-8 w-8" />} />

        <StatCard title="Ongoing Plans" value={stats.ongoingPlans} icon={<PlayCircle className="h-8 w-8" />} />
        
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-8 w-8" />}
        />
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie Charts */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold">Subscriber Analytics</h2>
          <div className="grid grid-cols-3 gap-4">
            <PieChartCard
              title="Total Subscribers"
              percentage={subscriberData.totalPercentage}
              color="#FF6B6B"
              lightColor="#FFE2E2"
            />
            <PieChartCard
              title="Female Subscribers"
              percentage={subscriberData.femalePercentage}
              color="#00B894"
              lightColor="#E0F5F0"
            />
            <PieChartCard
              title="Male Subscribers"
              percentage={subscriberData.malePercentage}
              color="#3498DB"
              lightColor="#E1F0FA"
            />
          </div>
        </div>

        {/* Weekly Subscription Graph */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-6 text-xl font-semibold">Weekly Subscription Trend</h2>
          <WeeklyChart data={weeklyData} />
        </div>
      </div>
    </div>
    </div>
    
  )
}

export default SubscriptionDashboard


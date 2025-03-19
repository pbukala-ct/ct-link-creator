// src/components/Dashboard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  ComposedChart
} from 'recharts';
import { Loader2 } from 'lucide-react';

interface DashboardData {
  metrics: {
    totalLinks: number;
    totalOrders: number;
    conversionRate: number;
    averageOrderValue: number;
    totalRevenue: number;
    averageTimeToConversion: number;
  };
  timeSeriesData: {
    dates: string[];
    links: number[];
    conversions: number[];
  };
  productsData: Array<{
    name: string;
    orders: number;
    quantity: number;
    revenue: number;
  }>;
  conversionFlowData: {
    Converted: number;
    'Not Converted': number;
  };
  cartHistory: Array<{
    linkId: string;
    createdAt: string;
    customerEmail: string,
    cartValue: number;
    isConverted: boolean;
    hoursAge: number;
    discountCode: string,
    discountValue: number,
    conversionTimeMinutes: number

  }>;
  discountAnalysis: Array<{
    discountCategory: string;
    count: number;
    averageDiscount: number;
    totalDiscount: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/metrics');
      const responseData = await response.json();
      
      if (!response.ok) throw new Error(responseData.error);
      
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#6359ff]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-red-600">
        Error loading dashboard: {error}
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'AUD' }).format(value);

  // Format date
  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Prepare time series data for chart
  const timeSeriesChartData = data.timeSeriesData.dates.map((date, index) => ({
    date,
    'Links Created': data.timeSeriesData.links[index],
    'Orders': data.timeSeriesData.conversions[index]
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#191741] mb-8">Links Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        

        <Card className="border border-[#191741]">
          <CardHeader className="bg-[#F7F2EA]">
            <CardTitle className="text-lg text-[#191741]">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-[#6359ff]">
              {data.metrics.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-[#191741] mt-2">
              {data.metrics.totalOrders} orders from {data.metrics.totalLinks} links
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#191741]">
          <CardHeader className="bg-[#F7F2EA]">
            <CardTitle className="text-lg text-[#191741]">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-[#6359ff]">
              {formatCurrency(data.metrics.averageOrderValue)}
            </div>
            <div className="text-sm text-[#191741] mt-2">
              Total Revenue: {formatCurrency(data.metrics.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#191741]">
          <CardHeader className="bg-[#F7F2EA]">
            <CardTitle className="text-lg text-[#191741]">Time to Convert</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-[#6359ff]">
              {(data.metrics.averageTimeToConversion / 3600).toFixed(1)}h
            </div>
            <div className="text-sm text-[#191741] mt-2">
              Average conversion time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversions Over Time */}
      <Card className="border border-[#191741]">
        <CardHeader className="bg-[#F7F2EA]">
          <CardTitle className="text-lg text-[#191741]">Conversions Over Time</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#191741"
                />
                <YAxis stroke="#191741" />
                <Tooltip 
                  labelFormatter={formatDate}
                  contentStyle={{ backgroundColor: '#1f1e1d', border: '1px solid #191741' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Links Created" 
                  stroke="#6359ff" 
                  strokeWidth={2}
                  dot={{ fill: '#6359ff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Orders" 
                  stroke="#0bbfbf" 
                  strokeWidth={2}
                  dot={{ fill: '#0bbfbf' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Products Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-[#191741]">
          <CardHeader className="bg-[#F7F2EA]">
            <CardTitle className="text-lg text-[#191741]">Top Products by Orders</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.productsData.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#191741" />
                  <YAxis stroke="#191741" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f1e1d', border: '1px solid #191741' }}
                  />
                  <Bar dataKey="orders" fill="#6359ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Flow */}
        <Card className="border border-[#191741]">
          <CardHeader className="bg-[#F7F2EA]">
            <CardTitle className="text-lg text-[#191741]">Cart Conversion Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Converted', value: data.conversionFlowData.Converted },
                      { name: 'Not Converted', value: data.conversionFlowData['Not Converted'] }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#6359ff" />
                    <Cell fill="#0bbfbf" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#f0f0f0', border: '1px solid #191741' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
      <Card className="border border-[#191741]">
  <CardHeader className="bg-[#F7F2EA]">
    <CardTitle className="text-lg text-[#191741]">Discount Distribution in Links (Carts)</CardTitle>
  </CardHeader>
  <CardContent className="pt-6">
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data.discountAnalysis}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="discountCategory" 
            stroke="#191741"
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left" 
            stroke="#191741"
            label={{ value: 'Number of Carts', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#6359ff"
            label={{ value: 'Average Discount ($)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f1e1d', border: '1px solid #191741' }}
            formatter={(value, name) => {
              if (name === 'Count') return [value, 'Carts'];
              return [`$${value}`, name];
            }}
          />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="count" 
            fill="#6359ff" 
            name="Count"
            barSize={60}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="averageDiscount" 
            stroke="#0bbfbf" 
            name="Average Discount"
            strokeWidth={2}
            dot={{ fill: '#0bbfbf' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  </CardContent>
</Card>
<div className="mt-8"></div>
      <Card className="border border-[#191741]">
        <CardHeader className="bg-[#F7F2EA] pt-6">
          <CardTitle className="text-lg text-[#191741]">Recent Cart History</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#191741] text-[#191741] font-semibold">
                  <th className="text-left p-3">Created</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Age</th>
                  <th className="text-left p-3">Cart Value</th>
                  <th className="text-left p-3">Discount</th>
                  <th className="text-left p-3">Conversion Time</th>
                  <th className="text-left p-3">Checkout Link</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-[#191741]">
                {data.cartHistory.map((cart) => (
                  <tr key={cart.linkId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-medium">
                      {new Date(cart.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3 font-medium">
                      {cart.customerEmail }
                    </td>
                    <td className="p-3">
                      {cart.hoursAge >= 24 
                        ? `${Math.floor(cart.hoursAge / 24)} days` 
                        : `${cart.hoursAge}h`}
                    </td>
                    <td className="p-3 font-medium">
                      {cart.cartValue > 0 ? formatCurrency(cart.cartValue) : 'N/A'}
                    </td>
                    
                    <td className="p-3">
                    {cart.discountValue > 0 ? (
                        <div>
                        <span className="font-medium">{formatCurrency(cart.discountValue)}</span>
                        {cart.discountCode && (
                            <span className="ml-2 text-sm text-gray-600">({cart.discountCode})</span>
                        )}
                        </div>
                    ) : 'No discount'}
                    </td>
                                <td className="p-3">
                    {cart.isConverted 
                        ? `${cart.conversionTimeMinutes} min` 
                        : '-'}
                    </td>
                    <td className="p-3">
                        <a 
                            href={`https://ct-link-generator.netlify.app/checkout/${cart.linkId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            {cart.linkId}
                        </a>
                        </td>
                    
                    <td className="p-3">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          cart.isConverted 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {cart.isConverted ? 'Converted' : 'Pending'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
};

export default Dashboard;
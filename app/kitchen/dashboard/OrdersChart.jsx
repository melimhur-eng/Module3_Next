"use client"; // charts measure the page to size themselves, so they run in the browser

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function OrdersChart({ data }) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" interval="preserveStartEnd" />
          <YAxis allowDecimals={false} width={40} domain={[0, "auto"]} />
          <Tooltip formatter={(value) => [value, "Orders"]} />
          {/* dots on each day, so the points can be read without colour */}
          <Line type="monotone" dataKey="orders" stroke="#b5402a" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

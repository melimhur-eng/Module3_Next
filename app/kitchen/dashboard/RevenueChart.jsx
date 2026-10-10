"use client"; // charts measure the page to size themselves, so they run in the browser

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { etb } from "@/lib/format";

// Receives four summary rows from the server. The bars start at zero and each
// carries its value as a label, so it can be read without relying on colour.
export default function RevenueChart({ data }) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="area" />
          <YAxis tickFormatter={etb} width={90} domain={[0, "auto"]} />
          <Tooltip formatter={(value) => [etb(value), "Revenue"]} />
          <Bar dataKey="revenue" fill="#b5402a">
            <LabelList dataKey="revenue" position="top" formatter={etb} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

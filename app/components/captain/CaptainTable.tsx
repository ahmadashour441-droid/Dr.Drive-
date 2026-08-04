"use client";

type Captain = {
  id: number;
  full_name: string;
  phone: string;
  login_code: string;
  vehicle_type: string;
  vehicle_number: string;
  status: boolean;
};

type CaptainTableProps = {
  captains: Captain[];
};

export default function CaptainTable({
  captains,
}: CaptainTableProps) {
  if (captains.length === 0) {
    return <p>لا يوجد كباتن.</p>;
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <thead>
        <tr style={{ background: "#f5f5f5" }}>
          <th style={th}>#</th>
          <th style={th}>الاسم</th>
          <th style={th}>الهاتف</th>
          <th style={th}>كود الدخول</th>
          <th style={th}>نوع المركبة</th>
          <th style={th}>رقم المركبة</th>
          <th style={th}>الحالة</th>
        </tr>
      </thead>

      <tbody>
        {captains.map((captain) => (
          <tr key={captain.id}>
            <td style={td}>{captain.id}</td>
            <td style={td}>{captain.full_name}</td>
            <td style={td}>{captain.phone}</td>
            <td style={td}>{captain.login_code}</td>
            <td style={td}>{captain.vehicle_type}</td>
            <td style={td}>{captain.vehicle_number}</td>
            <td style={td}>
              {captain.status ? "🟢 نشط" : "🔴 غير نشط"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center",
};

const td: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "center",
};
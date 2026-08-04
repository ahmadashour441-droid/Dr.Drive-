type User = {
  id?: number;
  full_name: string;
  phone: string;
  login_code: string;
  is_admin: boolean;
  is_captain: boolean;
  is_producer: boolean;
  vehicle_type: string | null;
  vehicle_number: string | null;
  status: boolean;
};

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
}: Props) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
        لا يوجد مستخدمون
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-right">الاسم</th>
            <th className="p-4 text-center">الهاتف</th>
            <th className="p-4 text-center">كود الدخول</th>
            <th className="p-4 text-center">الصلاحية</th>
            <th className="p-4 text-center">المركبة</th>
            <th className="p-4 text-center">الحالة</th>
            <th className="p-4 text-center">الإجراءات</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            let role = "مستخدم";
            let roleColor = "bg-gray-100 text-gray-700";

            if (user.is_admin) {
              role = "مدير";
              roleColor = "bg-red-100 text-red-700";
            } else if (user.is_producer) {
              role = "منتج";
              roleColor = "bg-blue-100 text-blue-700";
            } else if (user.is_captain) {
              role = "كابتن";
              roleColor = "bg-green-100 text-green-700";
            }

            return (
              <tr
                key={user.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-4 font-medium">
                  {user.full_name}
                </td>

                <td className="p-4 text-center">
                  {user.phone}
                </td>

                <td className="p-4 text-center">
                  {user.login_code}
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${roleColor}`}
                  >
                    {role}
                  </span>
                </td>

                <td className="p-4 text-center">
                  {user.vehicle_type
                    ? `${user.vehicle_type} - ${user.vehicle_number}`
                    : "-"}
                </td>

                <td className="p-4 text-center">
                  {user.status ? (
                    <span className="text-green-600 font-semibold">
                      نشط
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      غير نشط
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() => onDelete(user)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
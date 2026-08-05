"use client";

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";


type User = {
  id: number;
  full_name: string;
  phone: string;
  login_code: string;
  is_admin: boolean;
  is_captain: boolean;
  is_producer: boolean;
  vehicle_type: string;
  vehicle_number: string;
  status: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);

    const { data } = await supabase
      .from("Users")
      .select("*")
      .order("id", {
        ascending: false,
      });

    setUsers((data as User[]) || []);

    setLoading(false);
  }

  async function deleteUser(id: number) {

  const confirmDelete = confirm(
    "هل تريد حذف المستخدم؟"
  );

  if (!confirmDelete) return;

  const response = await fetch(
    "/api/users/delete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    alert(result.error);
    return;
  }

  alert("تم حذف المستخدم");

  loadUsers();

}

  async function toggleStatus(
    id: number,
    value: boolean
  ) {
    await supabase
      .from("Users")
      .update({
        status: !value,
      })
      .eq("id", id);

    loadUsers();
  }

  const filteredUsers = useMemo(() => {
    if (!search) return users;

    return users.filter((user) => {
      return (
        user.full_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        user.phone
          ?.includes(search)
      );
    });
  }, [users, search]);
   return (

  <div className="p-8">

    <main>

          <div className="bg-white rounded-2xl shadow p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

              <h1 className="text-3xl font-bold">
                إدارة المستخدمين
              </h1>

              <div className="flex gap-3">

                <input
                  type="text"
                  placeholder="بحث بالاسم أو الهاتف..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="border rounded-xl px-4 py-2 w-72"
                />

                <Link
  href="/admin/users/add"
  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
>
  إضافة مستخدم
</Link>

                

              </div>

            </div>

            {loading ? (

              <div className="text-center py-20">
                Loading...
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="min-w-[1100px]">

                  <thead className="bg-slate-100">

                    <tr className="text-right">

                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">الاسم</th>
                      <th className="px-4 py-3">الهاتف</th>
                      <th className="px-4 py-3">رمز الدخول</th>
                      <th className="px-4 py-3">الصلاحية</th>
                      <th className="px-4 py-3">المركبة</th>
                      <th className="px-4 py-3">اللوحة</th>
                      <th className="px-4 py-3">الحالة</th>
                      <th className="px-4 py-3">الإجراءات</th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredUsers.map((user) => (

                      <tr
                        key={user.id}
                        className="border-b hover:bg-slate-50"
                      >

                        <td className="px-4 py-4">
                          #{user.id}
                        </td>

                        <td className="px-4 py-4 font-semibold">
                          {user.full_name}
                        </td>

                        <td className="px-4 py-4">
                          {user.phone || "-"}
                        </td>

                        <td className="px-4 py-4">
                          {user.login_code}
                        </td>
                                                <td className="px-4 py-4">

                          {user.is_admin ? (
                            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                              مدير
                            </span>
                          ) : user.is_captain ? (
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                              كابتن
                            </span>
                          ) : user.is_producer ? (
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700">
                              منتج
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                              مستخدم
                            </span>
                          )}

                        </td>

                        <td className="px-4 py-4">
                          {user.vehicle_type || "-"}
                        </td>

                        <td className="px-4 py-4">
                          {user.vehicle_number || "-"}
                        </td>

                        <td className="px-4 py-4">

                          <button
                            onClick={() =>
                              toggleStatus(
                                user.id,
                                user.status
                              )
                            }
                            className={`px-4 py-2 rounded-lg text-white ${
                              user.status
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                          >
                            {user.status
                              ? "نشط"
                              : "موقوف"}
                          </button>

                        </td>

                        <td className="px-4 py-4">

                          <div className="flex gap-2">

                            <Link
  href={`/admin/users/edit/${user.id}`}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
>
  تعديل
</Link>

                            <button
                              onClick={() =>
                                deleteUser(user.id)
                              }
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            >
                              حذف
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                    {filteredUsers.length === 0 && (

                      <tr>

                        <td
                          colSpan={9}
                          className="text-center py-12 text-gray-500"
                        >
                          لا يوجد مستخدمون
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

              </main>

  </div>

  );
}

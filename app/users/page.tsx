"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

import Header from "../components/layout/Header";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import TableCard from "../components/ui/TableCard";
import EmptyState from "../components/ui/EmptyState";

import {
  Car,
  Package,
  Wallet,
  BadgeDollarSign,
  CircleDollarSign,
} from "lucide-react";

export default function CaptainPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [takenOrders, setTakenOrders] = useState<any[]>([]);
  const [producedOrders, setProducedOrders] = useState<any[]>([]);

  const [commissionDue, setCommissionDue] = useState(0);
  const [producerBalance, setProducerBalance] = useState(0);
  const [netDue, setNetDue] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      router.push("/");
      return;
    }

    const parsedUser = JSON.parse(savedUser);

    if (parsedUser.is_admin) {
      router.push("/admin");
      return;
    }

    if (!parsedUser.is_captain) {
      router.push("/");
      return;
    }

    setUser(parsedUser);
    loadOrders(parsedUser.id);
  }, [router]);

  async function loadOrders(captainId: number) {
    const { data, error } = await supabase
      .from("Orders")
      .select(`
  *,
  producer:producer_id(full_name)
`)
      .or(`captain_id.eq.${captainId},producer_id.eq.${captainId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const allOrders = data || [];
    const { data: balances } = await supabase
  .from("BalanceTransactions")
  .select("amount")
  .eq("user_id", captainId);

const floorBalance =
  balances?.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  ) ?? 0;

    const taken = allOrders.filter(
      (order) => order.captain_id === captainId
    );

    const produced = allOrders.filter(
      (order) => order.producer_id === captainId
    );

    setTakenOrders(taken);
    setProducedOrders(produced);

    let captainTotal = 0;
    let producerTotal = 0;

    taken.forEach((order) => {
      captainTotal += Number(order.captain_due || 0);
    });

    produced.forEach((order) => {
      producerTotal += Number(order.net_producer_commission || 0);
    });

    setCommissionDue(captainTotal + floorBalance);
    setProducerBalance(producerTotal);
    setNetDue(captainTotal - producerTotal);
  }

  function logout() {
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }
  return (
  <main className="min-h-screen bg-slate-100 px-8 py-8 max-w-[1700px] mx-auto">

    <div className="space-y-10">

      <Header
  title={`Welcome, ${user.full_name}`}
  subtitle="Captain Dashboard"
/>

      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8">

        <StatCard
          title="Taken Orders"
          value={takenOrders.length}
          icon={<Car size={24} />}
          color="bg-blue-500"
        />

        <StatCard
          title="Produced Orders"
          value={producedOrders.length}
          icon={<Package size={24} />}
          color="bg-purple-500"
        />

        <StatCard
          title="Commission Due"
          value={`${commissionDue.toFixed(2)} JD`}
          icon={<BadgeDollarSign size={24} />}
          color="bg-red-500"
        />

        <StatCard
          title="Producer Balance"
          value={`${producerBalance.toFixed(2)} JD`}
          icon={<Wallet size={24} />}
          color="bg-green-500"
        />

        <StatCard
          title="Net Due"
          value={`${netDue.toFixed(2)} JD`}
          icon={<CircleDollarSign size={24} />}
          color="bg-orange-500"
        />

      </div>

      {/* Main Layout */}

      <div className="grid grid-cols-12 gap-7 items-start">

        {/* Tables */}

        <div className="col-span-12 xl:col-span-9 space-y-7">

          <TableCard title="Taken Orders">

            {takenOrders.length === 0 ? (

              <EmptyState title="No taken orders" />

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
  Producer
</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
  Type
</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
  Amount
</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
  Commission
</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
  Status
</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
  Date
</th>

                    </tr>

                  </thead>

                  <tbody>

                    {takenOrders.map((order) => (

                      <tr
                        key={order.id}
                        className="border-t hover:bg-slate-50"
                      >

                        <td className="px-6 py-4 border-t border-slate-100">
  {order.producer?.full_name ?? "-"}
</td>

<td className="px-6 py-4 border-t border-slate-100">
  {order.order_type}
</td>

<td className="px-6 py-4 border-t border-slate-100">
  {order.amount} JD
</td>

<td className="px-6 py-4 border-t border-slate-100 font-semibold text-red-600">
  {Number(order.captain_due).toFixed(2)} JD
</td>

<td className="px-6 py-4 border-t border-slate-100">
  <Badge status={order.status} />
</td>

<td className="px-6 py-4 border-t border-slate-100">
  {new Date(order.created_at).toLocaleDateString()}
</td>
                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </TableCard>
                    <TableCard title="Produced Orders">

            {producedOrders.length === 0 ? (

              <EmptyState title="No produced orders" />

            ) : (

              <div className="overflow-x-auto">

                <table className="min-w-full">

                  <thead className="bg-slate-100">

                    <tr>

                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">My Balance</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Date</th>

                    </tr>

                  </thead>

                  <tbody>

                    {producedOrders.map((order) => (

                      <tr
                        key={order.id}
                        className="border-t hover:bg-slate-50"
                      >

                        <td className="p-3">
                          {order.order_type}
                        </td>

                        <td className="p-3">
                          {order.amount} JD
                        </td>

                        <td className="p-3 font-semibold text-green-600">
                          {Number(order.net_producer_commission).toFixed(2)} JD
                        </td>

                        <td className="p-3">
                          <Badge status={order.status} />
                        </td>

                        <td className="p-3">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </TableCard>

        </div>

        {/* Right Side */}

        <div className="col-span-12 xl:col-span-3">

          <Card className="sticky top-6">

            <h2 className="text-xl font-bold mb-6">
              Captain Information
            </h2>

            <div className="space-y-4">

              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="font-semibold">{user.full_name}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-semibold">{user.phone}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Login Code</p>
                <p className="font-semibold">{user.login_code}</p>
              </div>

            </div>

            <div className="mt-8">

              <Button
                variant="danger"
                onClick={logout}
              >
                Logout
              </Button>

            </div>

          </Card>

        </div>

      </div>

    </div>

  </main>
);
}
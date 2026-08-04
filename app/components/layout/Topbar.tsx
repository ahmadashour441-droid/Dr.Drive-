import { LogOut } from "lucide-react";
import Button from "../ui/Button";

interface TopbarProps {
  name: string;
  role: string;
  onLogout: () => void;
}

export default function Topbar({
  name,
  role,
  onLogout,
}: TopbarProps) {
  return (
    <div className="dashboard-card mb-6 px-8 py-5">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        {/* Left */}

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl text-white shadow-lg">

            🚗

          </div>

          <div>

            <h1 className="text-2xl font-bold text-slate-800">
              Dr.Drive وصلني الآن
            </h1>

            <p className="text-sm text-slate-500">
              Captain & Dispatch Management System
            </p>

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-5">

          <div className="text-right">

            <h3 className="font-bold text-slate-800">
              {name}
            </h3>

            <span className="text-sm text-blue-600">
              {role}
            </span>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-bold text-white">

            {name.charAt(0).toUpperCase()}

          </div>

          <Button
            variant="danger"
            onClick={onLogout}
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>

        </div>

      </div>

    </div>
  );
}
"use client";

export type User = {
  id?: number;
  full_name: string;
};

interface Props {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  open,
  user,
  onClose,
  onConfirm,
}: Props) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          حذف المستخدم
        </h2>

        <p className="text-gray-700 leading-7">
          هل أنت متأكد من حذف المستخدم
          <span className="font-bold"> {user.full_name} </span>؟
        </p>

        <p className="text-sm text-gray-500 mt-2">
          لا يمكن التراجع عن هذه العملية.
        </p>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            إلغاء
          </button>

          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
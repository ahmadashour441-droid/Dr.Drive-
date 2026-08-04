export default function Hero() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-8 text-white">

      <div className="relative z-10 max-w-2xl">

        <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm">
          Dr.Drive وصلني الآن
        </span>

        <h1 className="mt-5 text-4xl font-bold">
          مرحباً بك في لوحة التحكم
        </h1>

        <p className="mt-4 text-blue-100 leading-8">
          إدارة الطلبات، السائقين، المنتجين، والأرصدة من مكان واحد.
        </p>

      </div>

      <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10"></div>

      <div className="absolute -bottom-20 left-10 h-60 w-60 rounded-full bg-white/10"></div>

    </div>
  );
}
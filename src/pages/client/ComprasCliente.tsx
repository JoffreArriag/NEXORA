export default function ComprasCliente() {
  return (
    <div>
      <h1 className="text-5xl font-black text-slate-800">Compras</h1>
      <p className="mt-4 text-lg text-slate-700">
        Aquí puedes ver el historial de tus compras y el estado de tus pedidos.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar compra..."
          className="flex-1 p-4 rounded-2xl border border-slate-300 text-lg outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all"
        />
        <select className="w-64 p-4 rounded-2xl border border-slate-300 text-lg outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all">
          <option value="">Filtrar por estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Compra #{1000+i}</h2>
              <p className="text-slate-600 mb-2">Fecha: 2026-01-10</p>
              <p className="text-slate-600 mb-4">Estado: <span className="font-semibold text-cyan-600">Pendiente</span></p>
              <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-2xl font-semibold transition-colors">
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

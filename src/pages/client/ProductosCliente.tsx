export default function ProductosCliente() {
  return (
    <div>
      <h1 className="text-5xl font-black text-slate-800">Productos</h1>
      <p className="mt-4 text-lg text-slate-700">
        Explora nuestros productos disponibles para ti.
      </p>

      {/* Buscador y filtro */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="flex-1 p-4 rounded-2xl border border-slate-300 text-lg outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all"
        />
        <select className="w-64 p-4 rounded-2xl border border-slate-300 text-lg outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all">
          <option value="">Filtrar por categoría</option>
          <option value="categoria1">Categoría 1</option>
          <option value="categoria2">Categoría 2</option>
          <option value="categoria3">Categoría 3</option>
        </select>
      </div>

      {/* Grid de productos */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
            <div className="bg-cyan-100 h-48 flex items-center justify-center text-6xl font-extrabold text-cyan-600">
              Img
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Producto {i + 1}</h2>
              <p className="text-slate-600 mb-4">Descripción breve del producto.</p>
              <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-2xl font-semibold transition-colors">
                Comprar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

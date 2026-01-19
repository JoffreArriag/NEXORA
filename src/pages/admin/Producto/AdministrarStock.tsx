import { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Producto {
  id?: string;
  nombre: string;
  descripcion: string;
  precioUnitario: string;
  precioMayor: string;
  stock: string;
  categoria: string;
  marca: string;
  visible: boolean;
  imagenUrl: string;
}

interface Categoria {
  id: string;
  nombre: string;
}

export default function AdministrarStock() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [nuevoStock, setNuevoStock] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Cargar productos y categorías desde Firestore
  useEffect(() => {
    const fetchCategorias = async () => {
      const snapshot = await getDocs(collection(db, "categorias"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, nombre: doc.data().nombre }));
      setCategorias(data);
    };

    const fetchProductos = async () => {
      const snapshot = await getDocs(collection(db, "productos"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Producto) }));
      setProductos(data);
    };

    fetchCategorias();
    fetchProductos();
  }, []);

  // Función para actualizar stock
  const guardarStock = async () => {
    if (!productoSeleccionado || !productoSeleccionado.id) return;

    try {
      await updateDoc(doc(db, "productos", productoSeleccionado.id), { stock: nuevoStock });
      setProductos(prev =>
        prev.map(p =>
          p.id === productoSeleccionado.id ? { ...p, stock: nuevoStock } : p
        )
      );
      setToastMessage(`Stock de "${productoSeleccionado.nombre}" actualizado a ${nuevoStock}`);
      setToastType("success");
      setProductoSeleccionado(null);
      setNuevoStock("");
    } catch (error) {
      console.error(error);
      setToastMessage("Ocurrió un error al actualizar el stock");
      setToastType("error");
    }
  };

  // Filtrado por nombre y categoría
  const sugerencias = productos.filter(
    p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (categoriaFiltro === "" || p.categoria === categoriaFiltro)
  );

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Administrar Stock</h2>

      {/* Buscador + filtro categoría */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={productoSeleccionado ? productoSeleccionado.nombre : busqueda}
          onChange={e => {
            setBusqueda(e.target.value);
            setProductoSeleccionado(null);
            setNuevoStock("");
          }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <select
          value={categoriaFiltro}
          onChange={e => setCategoriaFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-4 overflow-y-auto">
        {!productoSeleccionado && sugerencias.length > 0 ? (
          // Lista de productos
          sugerencias.map(p => (
            <div
              key={p.id}
              className="p-4 rounded-xl border border-gray-300 hover:bg-red-100 cursor-pointer flex justify-between items-center"
              onClick={() => {
                setProductoSeleccionado(p);
                setNuevoStock(p.stock);
              }}
            >
              <div>
                <p className="font-semibold text-neutral-950">{p.nombre}</p>
                <p className="text-sm text-neutral-700">{p.categoria} - {p.marca}</p>
              </div>
              <p className="font-semibold text-neutral-950">Stock: {p.stock}</p>
            </div>
          ))
        ) : productoSeleccionado ? (
          // Formulario estilo EditarProducto con stock editable
          <form className="flex flex-col gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Nombre del Producto</label>
              <input type="text" value={productoSeleccionado.nombre} readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed" />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Descripción</label>
              <textarea value={productoSeleccionado.descripcion} readOnly rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed" />
            </div>

            {/* Precios y stock editable */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Precio Unitario</label>
                <input type="number" value={productoSeleccionado.precioUnitario} readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Precio por Mayor</label>
                <input type="number" value={productoSeleccionado.precioMayor} readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Stock</label>
                <input type="number" value={nuevoStock}
                  onChange={e => setNuevoStock(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>

            {/* Categoría, Marca, Imagen */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Categoría</label>
                <input type="text" value={productoSeleccionado.categoria} readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">Marca</label>
                <input type="text" value={productoSeleccionado.marca} readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-neutral-950 font-semibold mb-2">URL de Imagen</label>
                <input type="text" value={productoSeleccionado.imagenUrl} readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed" />
              </div>
            </div>

            {/* Visible */}
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={productoSeleccionado.visible} readOnly
                className="w-4 h-4 accent-red-500 cursor-not-allowed" />
              <span className="text-neutral-950 font-medium">Visible en la tienda</span>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={guardarStock}
                className="bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors">
                Guardar Cambios
              </button>
              <button type="button" onClick={() => setProductoSeleccionado(null)}
                className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <p className="text-neutral-950 text-lg">No se encontraron productos</p>
        )}
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}

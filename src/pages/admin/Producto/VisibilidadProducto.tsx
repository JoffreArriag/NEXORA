import { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Producto {
  id?: string;
  nombre: string;
  categoria: string;
  marca: string;
  visible: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
}

export default function VisibilidadProducto() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
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

  // Toggle de visibilidad
  const toggleVisibilidad = async (producto: Producto) => {
    if (!producto.id) return;

    try {
      const nuevoEstado = !producto.visible;
      await updateDoc(doc(db, "productos", producto.id), { visible: nuevoEstado });

      setProductos(prev =>
        prev.map(p => (p.id === producto.id ? { ...p, visible: nuevoEstado } : p))
      );

      setToastMessage(
        `Producto "${producto.nombre}" ahora está ${nuevoEstado ? "visible" : "oculto"}`
      );
      setToastType("success");
    } catch (error) {
      console.error(error);
      setToastMessage("Ocurrió un error al cambiar la visibilidad");
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
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Visibilidad de Productos</h2>

      {/* Buscador y filtro categoría */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      {/* Listado de productos con toggle */}
      <div className="bg-white/10 p-6 rounded-3xl min-h-[400px] flex flex-col gap-4 overflow-y-auto">
        {sugerencias.length > 0 ? (
          sugerencias.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-4 rounded-xl border border-gray-300"
            >
              <div>
                <p className="font-semibold text-neutral-950">{p.nombre}</p>
                <p className="text-sm text-neutral-700">{p.categoria} - {p.marca}</p>
              </div>

              {/* Toggle de visibilidad */}
              <button
                onClick={() => toggleVisibilidad(p)}
                className={`w-16 h-8 rounded-full transition-colors relative ${
                  p.visible ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                    p.visible ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))
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

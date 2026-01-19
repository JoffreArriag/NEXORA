import { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Categoria {
  id?: string; // ID de Firestore
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  visible: boolean;
  prioridad: number;
}

export default function EliminarCategoria() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);

  // Traer categorías desde Firestore
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categorias"));
        const cats: Categoria[] = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Categoria, "id">),
        }));
        setCategorias(cats);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        setToastMessage("Ocurrió un error al cargar las categorías");
        setToastType("error");
      }
    };

    fetchCategorias();
  }, []);

  // Filtrado por nombre
  const sugerencias = categorias.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminarCategoria = async () => {
    if (!categoriaSeleccionada || !categoriaSeleccionada.id) return;

    setLoading(true);
    try {
      const categoriaRef = doc(db, "categorias", categoriaSeleccionada.id);
      await deleteDoc(categoriaRef);

      // Actualizar lista local
      setCategorias(prev => prev.filter(c => c.id !== categoriaSeleccionada.id));

      setToastMessage(`Categoría "${categoriaSeleccionada.nombre}" eliminada correctamente`);
      setToastType("success");
      setCategoriaSeleccionada(null);
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);
      setToastMessage("Ocurrió un error al eliminar la categoría");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Eliminar Categoría</h2>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={categoriaSeleccionada ? categoriaSeleccionada.nombre : busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setCategoriaSeleccionada(null);
          }}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Listado o detalle */}
      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-4 overflow-y-auto">
        {!categoriaSeleccionada ? (
          sugerencias.length > 0 ? (
            sugerencias.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-gray-300 hover:bg-red-100 cursor-pointer flex justify-between items-center"
                onClick={() => setCategoriaSeleccionada(c)}
              >
                <div>
                  <p className="font-semibold text-neutral-950">{c.nombre}</p>
                  <p className="text-sm text-neutral-700">{c.descripcion}</p>
                </div>
                <p className="font-semibold text-neutral-950">{c.visible ? "Visible" : "Oculto"}</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-950 text-lg">No se encontraron categorías</p>
          )
        ) : (
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            {/* Campos solo lectura */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Nombre</label>
              <input
                type="text"
                value={categoriaSeleccionada.nombre}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Descripción</label>
              <textarea
                value={categoriaSeleccionada.descripcion}
                readOnly
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-neutral-950 font-semibold mb-2">URL de Imagen</label>
              <input
                type="text"
                value={categoriaSeleccionada.imagenUrl}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={categoriaSeleccionada.visible}
                readOnly
                className="w-4 h-4 accent-red-500 cursor-not-allowed"
              />
              <span className="text-neutral-950 font-medium">Visible en la tienda</span>
            </div>

            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Prioridad</label>
              <input
                type="number"
                value={categoriaSeleccionada.prioridad}
                readOnly
                className="w-24 border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-neutral-700 cursor-not-allowed"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={eliminarCategoria}
                disabled={loading}
                className={`bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
              <button
                type="button"
                className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
                onClick={() => setCategoriaSeleccionada(null)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}

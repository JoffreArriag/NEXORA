import { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Categoria {
  id?: string; // ID de Firestore
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  visible: boolean;
  prioridad: number;
}

export default function VisibilidadCategoria() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [loadingId, setLoadingId] = useState<string | null>(null);

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

  const toggleVisibilidad = async (categoria: Categoria) => {
    if (!categoria.id) return;

    setLoadingId(categoria.id);

    try {
      const categoriaRef = doc(db, "categorias", categoria.id);
      await updateDoc(categoriaRef, { visible: !categoria.visible });

      // Actualizar estado local
      setCategorias(prev =>
        prev.map(c =>
          c.id === categoria.id ? { ...c, visible: !c.visible } : c
        )
      );

      setToastMessage(
        `Categoría "${categoria.nombre}" ahora está ${
          !categoria.visible ? "Visible" : "Oculta"
        }`
      );
      setToastType("success");
    } catch (error) {
      console.error("Error al cambiar visibilidad:", error);
      setToastMessage("Ocurrió un error al actualizar la visibilidad");
      setToastType("error");
    } finally {
      setLoadingId(null);
    }
  };

  // Filtrado por nombre
  const sugerencias = categorias.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">
        Visibilidad de Categorías
      </h2>

      {/* Buscador */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Listado de categorías con toggle */}
      <div className="bg-white/10 p-6 rounded-3xl min-h-[400px] flex flex-col gap-4 overflow-y-auto">
        {sugerencias.length > 0 ? (
          sugerencias.map((c) => (
            <div
              key={c.id}
              className="flex justify-between items-center p-4 rounded-xl border border-gray-300"
            >
              <div>
                <p className="font-semibold text-neutral-950">{c.nombre}</p>
                <p className="text-sm text-neutral-700">{c.descripcion}</p>
                <p className="text-xs text-neutral-600">Prioridad: {c.prioridad}</p>
              </div>

              {/* Toggle de visibilidad */}
              <button
                onClick={() => toggleVisibilidad(c)}
                disabled={loadingId === c.id}
                className={`w-16 h-8 rounded-full transition-colors relative ${
                  c.visible ? "bg-green-500" : "bg-gray-300"
                } ${loadingId === c.id ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                    c.visible ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))
        ) : (
          <p className="text-neutral-950 text-lg">No se encontraron categorías</p>
        )}
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage("")}
        />
      )}
    </div>
  );
}

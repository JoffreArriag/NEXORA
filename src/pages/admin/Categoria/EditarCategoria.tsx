import { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Categoria {
  id?: string; // id de Firestore
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  visible: boolean;
  prioridad: number;
}

export default function EditarCategoria() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<{ nombre?: boolean; descripcion?: boolean }>({});

  // Traer categorías desde Firestore al cargar
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

  const guardarCambios = async () => {
    if (!categoriaSeleccionada) return;

    // Validación
    const newErrores: { nombre?: boolean; descripcion?: boolean } = {};
    if (!categoriaSeleccionada.nombre.trim()) newErrores.nombre = true;
    if (!categoriaSeleccionada.descripcion.trim()) newErrores.descripcion = true;
    setErrores(newErrores);

    if (Object.keys(newErrores).length > 0) {
      setToastMessage("Por favor completa los campos obligatorios.");
      setToastType("error");
      return;
    }

    setLoading(true);

    try {
      if (!categoriaSeleccionada.id) throw new Error("ID de categoría no encontrado");

      const categoriaRef = doc(db, "categorias", categoriaSeleccionada.id);
      await updateDoc(categoriaRef, {
        nombre: categoriaSeleccionada.nombre,
        descripcion: categoriaSeleccionada.descripcion,
        imagenUrl: categoriaSeleccionada.imagenUrl,
        visible: categoriaSeleccionada.visible,
        prioridad: categoriaSeleccionada.prioridad,
      });

      // Actualizar localmente para que se refleje sin recargar
      setCategorias(prev =>
        prev.map(c => (c.id === categoriaSeleccionada.id ? categoriaSeleccionada : c))
      );

      setToastMessage("Categoría actualizada correctamente");
      setToastType("success");
      setCategoriaSeleccionada(null);
      setErrores({});
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
      setToastMessage("Ocurrió un error al actualizar la categoría");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Editar Categoría</h2>

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

      {/* Listado o formulario */}
      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-4 overflow-y-auto">
        {!categoriaSeleccionada ? (
          sugerencias.length > 0 ? (
            sugerencias.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-gray-300 hover:bg-red-100 cursor-pointer flex justify-between items-center"
                onClick={() => {
                  setCategoriaSeleccionada(c);
                  setBusqueda("");
                }}
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
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Nombre */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Nombre de la Categoría</label>
              <input
                type="text"
                value={categoriaSeleccionada.nombre}
                onChange={(e) =>
                  setCategoriaSeleccionada({ ...categoriaSeleccionada, nombre: e.target.value })
                }
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errores.nombre ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Descripción</label>
              <textarea
                value={categoriaSeleccionada.descripcion}
                onChange={(e) =>
                  setCategoriaSeleccionada({ ...categoriaSeleccionada, descripcion: e.target.value })
                }
                rows={3}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errores.descripcion ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            {/* URL Imagen */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">URL de Imagen</label>
              <input
                type="text"
                value={categoriaSeleccionada.imagenUrl}
                onChange={(e) =>
                  setCategoriaSeleccionada({ ...categoriaSeleccionada, imagenUrl: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Visible */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={categoriaSeleccionada.visible}
                onChange={(e) =>
                  setCategoriaSeleccionada({ ...categoriaSeleccionada, visible: e.target.checked })
                }
                className="w-4 h-4 accent-red-500"
              />
              <span className="text-neutral-950 font-medium">Visible en la tienda</span>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">Prioridad</label>
              <input
                type="number"
                value={categoriaSeleccionada.prioridad}
                onChange={(e) =>
                  setCategoriaSeleccionada({ ...categoriaSeleccionada, prioridad: parseInt(e.target.value) })
                }
                className="w-24 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Botones */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={guardarCambios}
                disabled={loading}
                className={`bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
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

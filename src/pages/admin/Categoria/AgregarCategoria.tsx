import { useState } from "react";
import { db } from "../../../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Categoria {
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  visible: boolean;
  prioridad: number;
}

export default function AgregarCategoria() {
  const [categoria, setCategoria] = useState<Categoria>({
    nombre: "",
    descripcion: "",
    imagenUrl: "",
    visible: true,
    prioridad: 1,
  });

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Estado para validación de campos vacíos
  const [errores, setErrores] = useState<{ nombre?: boolean; descripcion?: boolean }>({});

  const guardarCategoria = async () => {
    // Validar campos obligatorios
    const newErrores: { nombre?: boolean; descripcion?: boolean } = {};
    if (!categoria.nombre.trim()) newErrores.nombre = true;
    if (!categoria.descripcion.trim()) newErrores.descripcion = true;

    setErrores(newErrores);

    if (Object.keys(newErrores).length > 0) {
      setToastMessage("Por favor completa los campos obligatorios.");
      setToastType("error");
      return;
    }

    setLoading(true);

    try {
      const categoriasRef = collection(db, "categorias");
      await addDoc(categoriasRef, categoria);

      // Mostrar toast de éxito
      setToastMessage("Categoría guardada correctamente");
      setToastType("success");

      // Limpiar formulario
      setCategoria({
        nombre: "",
        descripcion: "",
        imagenUrl: "",
        visible: true,
        prioridad: 1,
      });

      // Limpiar errores
      setErrores({});
    } catch (error) {
      console.error("Error al guardar la categoría:", error);
      setToastMessage("Ocurrió un error al guardar la categoría");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Agregar Categoría</h2>

      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-6 overflow-y-auto">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Nombre */}
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Nombre de la Categoría</label>
            <input
              type="text"
              value={categoria.nombre}
              onChange={(e) => setCategoria({ ...categoria, nombre: e.target.value })}
              placeholder="Nombre de la categoría"
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errores.nombre ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Descripción</label>
            <textarea
              value={categoria.descripcion}
              onChange={(e) => setCategoria({ ...categoria, descripcion: e.target.value })}
              rows={3}
              placeholder="Añade una descripción de la categoría"
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
              value={categoria.imagenUrl}
              onChange={(e) => setCategoria({ ...categoria, imagenUrl: e.target.value })}
              placeholder="https://"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Visible */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={categoria.visible}
              onChange={(e) => setCategoria({ ...categoria, visible: e.target.checked })}
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-neutral-950 font-medium">Visible en la tienda</span>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Prioridad / Orden</label>
            <input
              type="number"
              value={categoria.prioridad}
              onChange={(e) => setCategoria({ ...categoria, prioridad: parseInt(e.target.value) })}
              className="w-32 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              className={`bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={guardarCategoria}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Categoría"}
            </button>
            <button
              type="button"
              className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
              onClick={() => {
                setCategoria({
                  nombre: "",
                  descripcion: "",
                  imagenUrl: "",
                  visible: true,
                  prioridad: 1,
                });
                setErrores({});
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
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

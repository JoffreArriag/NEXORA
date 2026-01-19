import { useEffect, useState } from "react";
import { db } from "../../../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Permisos {
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  ver: boolean;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: Permisos;
}

export default function RolesYPermisos() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Cargar roles desde Firestore
  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "roles"));
        const data: Rol[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Rol[];
        setRoles(data);
      } catch (error) {
        console.error(error);
        setToastMessage("Error al cargar roles");
        setToastType("error");
      }
    };

    cargarRoles();
  }, []);

  // Buscador
  const sugerencias = roles.filter((r) =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Guardar cambios
  const guardarCambios = async () => {
    if (!rolSeleccionado) return;

    try {
      await updateDoc(doc(db, "roles", rolSeleccionado.id), {
        nombre: rolSeleccionado.nombre,
        descripcion: rolSeleccionado.descripcion,
        permisos: rolSeleccionado.permisos,
      });

      setRoles((prev) =>
        prev.map((r) => (r.id === rolSeleccionado.id ? rolSeleccionado : r))
      );

      setToastMessage("Rol actualizado correctamente");
      setToastType("success");
      setRolSeleccionado(null);
    } catch (error) {
      console.error(error);
      setToastMessage("Error al guardar cambios");
      setToastType("error");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">
        Roles y Permisos
      </h2>

      {/* Buscador */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar rol..."
          value={rolSeleccionado ? rolSeleccionado.nombre : busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setRolSeleccionado(null);
          }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-6 overflow-y-auto">
        {!rolSeleccionado ? (
          sugerencias.length > 0 ? (
            sugerencias.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-gray-300 hover:bg-red-100 cursor-pointer flex justify-between items-center"
                onClick={() => {
                  setRolSeleccionado(r);
                  setBusqueda("");
                }}
              >
                <div>
                  <p className="font-semibold text-neutral-950">{r.nombre}</p>
                  <p className="text-sm text-neutral-700">
                    {r.descripcion}
                  </p>
                </div>
                <p className="text-sm text-neutral-950">
                  {Object.entries(r.permisos)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join(", ")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-neutral-950 text-lg">
              No se encontraron roles
            </p>
          )
        ) : (
          <div className="space-y-6">

            {/* Información del Rol */}
            <div className="bg-white p-8 rounded-3xl shadow-md space-y-6">
              <h3 className="text-2xl font-bold text-neutral-950">
                Información del Rol
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <Input
                  label="Nombre del Rol"
                  value={rolSeleccionado.nombre}
                  onChange={(v) =>
                    setRolSeleccionado({ ...rolSeleccionado, nombre: v })
                  }
                />
                <Input
                  label="Descripción"
                  value={rolSeleccionado.descripcion}
                  onChange={(v) =>
                    setRolSeleccionado({
                      ...rolSeleccionado,
                      descripcion: v,
                    })
                  }
                />
              </div>
            </div>

            {/* Permisos */}
            <div className="bg-white p-8 rounded-3xl shadow-md space-y-4">
              <h3 className="text-2xl font-bold text-neutral-950">
                Permisos
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Checkbox
                  label="Crear"
                  checked={rolSeleccionado.permisos.crear}
                  onChange={(v) =>
                    setRolSeleccionado({
                      ...rolSeleccionado,
                      permisos: { ...rolSeleccionado.permisos, crear: v },
                    })
                  }
                />
                <Checkbox
                  label="Editar"
                  checked={rolSeleccionado.permisos.editar}
                  onChange={(v) =>
                    setRolSeleccionado({
                      ...rolSeleccionado,
                      permisos: { ...rolSeleccionado.permisos, editar: v },
                    })
                  }
                />
                <Checkbox
                  label="Eliminar"
                  checked={rolSeleccionado.permisos.eliminar}
                  onChange={(v) =>
                    setRolSeleccionado({
                      ...rolSeleccionado,
                      permisos: { ...rolSeleccionado.permisos, eliminar: v },
                    })
                  }
                />
                <Checkbox
                  label="Ver"
                  checked={rolSeleccionado.permisos.ver}
                  onChange={(v) =>
                    setRolSeleccionado({
                      ...rolSeleccionado,
                      permisos: { ...rolSeleccionado.permisos, ver: v },
                    })
                  }
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 justify-end">
              <button
                type="button"
                onClick={guardarCambios}
                className="bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setRolSeleccionado(null)}
                className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

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

/* COMPONENTES */
interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}
function Input({ label, value, onChange }: InputProps) {
  return (
    <div>
      <label className="block text-neutral-950 font-semibold mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </div>
  );
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}
function Checkbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-red-500"
      />
      <span className="text-neutral-950 font-medium">{label}</span>
    </label>
  );
}

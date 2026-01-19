import { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Usuario {
  id?: string; // ID de Firebase
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correo: string;
  confirmarCorreo: string;
  contrasena: string;
  confirmarContrasena: string;
  fechaNacimiento: string;
  genero: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  rol: "Cliente" | "Administrador" | "";
}

export default function EliminarUsuario() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState<"Cliente" | "Administrador" | "">("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Cargar usuarios desde Firebase
  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const snapshot = await getDocs(collection(db, "usuarios"));
        const usuariosFirebase: Usuario[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Usuario));
        setUsuarios(usuariosFirebase);
      } catch (error) {
        console.error(error);
        setToastMessage("Error al cargar usuarios");
        setToastType("error");
      }
    };
    cargarUsuarios();
  }, []);

  // Filtrar usuarios
  const sugerencias = usuarios.filter(
    (u) =>
      (u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase())) &&
      (rolFiltro ? u.rol === rolFiltro : true)
  );

  // Eliminar usuario
  const eliminarUsuario = async (usuario: Usuario) => {
    if (!usuario.id) return;
    try {
      await deleteDoc(doc(db, "usuarios", usuario.id));
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
      setToastMessage(`Usuario ${usuario.nombre} ${usuario.apellido} eliminado`);
      setToastType("success");
      setUsuarioSeleccionado(null);
    } catch (error) {
      console.error(error);
      setToastMessage("Error al eliminar usuario");
      setToastType("error");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Eliminar Usuario</h2>

      {/* Buscador + filtro de rol */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={usuarioSeleccionado ? usuarioSeleccionado.nombre : busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setUsuarioSeleccionado(null);
          }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <select
          value={rolFiltro}
          onChange={(e) => setRolFiltro(e.target.value as "Cliente" | "Administrador" | "")}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Todos los roles</option>
          <option value="Cliente">Cliente</option>
          <option value="Administrador">Administrador</option>
        </select>
      </div>

      {/* Contenedor */}
      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-4 overflow-y-auto">
        {!usuarioSeleccionado ? (
          // Listado de usuarios
          sugerencias.length > 0 ? (
            sugerencias.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl border border-gray-300 hover:bg-red-100 cursor-pointer flex justify-between items-center"
                onClick={() => {
                  setUsuarioSeleccionado(u);
                  setBusqueda("");
                }}
              >
                <div>
                  <p className="font-semibold text-neutral-950">{u.nombre} {u.apellido}</p>
                  <p className="text-sm text-neutral-700">{u.correo} - {u.rol}</p>
                </div>
                <p className="font-semibold text-neutral-950">{u.ciudad}</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-950 text-lg">No se encontraron usuarios</p>
          )
        ) : (
          // Formulario de usuario (igual que Agregar/Editar)
          <form className="space-y-6">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre" value={usuarioSeleccionado.nombre} readOnly />
              <Input label="Apellido" value={usuarioSeleccionado.apellido} readOnly />
            </div>

            {/* Correo y Confirmar Correo */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Correo Electrónico" value={usuarioSeleccionado.correo} readOnly />
              <Input label="Confirmar Correo" value={usuarioSeleccionado.confirmarCorreo} readOnly />
            </div>

            {/* Contraseña y Confirmar Contraseña */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contraseña" value={usuarioSeleccionado.contrasena} type="password" readOnly />
              <Input label="Confirmar Contraseña" value={usuarioSeleccionado.confirmarContrasena} type="password" readOnly />
            </div>

            {/* Fecha y Género */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Fecha de Nacimiento" value={usuarioSeleccionado.fechaNacimiento} readOnly type="date" />
              <Input label="Género" value={usuarioSeleccionado.genero} readOnly />
            </div>

            {/* Dirección y Código Postal */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Dirección" value={usuarioSeleccionado.direccion} className="col-span-2" readOnly />
              <Input label="Código Postal" value={usuarioSeleccionado.codigoPostal} readOnly />
            </div>

            {/* Ciudad y Rol */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Ciudad" value={usuarioSeleccionado.ciudad} readOnly />
              <Select label="Rol" options={["Cliente", "Administrador"]} value={usuarioSeleccionado.rol} readOnly />
            </div>

            {/* Botones */}
            <div className="pt-4 flex gap-4">
              <button
                type="button"
                className="bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
                onClick={() => usuarioSeleccionado && eliminarUsuario(usuarioSeleccionado)}
              >
                Eliminar Usuario
              </button>
              <button
                type="button"
                className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
                onClick={() => setUsuarioSeleccionado(null)}
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

/* COMPONENTES VISUALES */
interface InputProps {
  label: string;
  value: string;
  readOnly?: boolean;
  type?: string;
  className?: string;
}
function Input({ label, value, readOnly = false, type = "text", className = "" }: InputProps) {
  return (
    <div className={className}>
      <label className="block text-neutral-950 font-semibold mb-2">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        className={`w-full border border-gray-300 rounded-lg px-4 py-2 ${readOnly ? "bg-gray-100 cursor-not-allowed" : "focus:outline-none focus:ring-2 focus:ring-red-500"}`}
      />
    </div>
  );
}

interface SelectProps {
  label: string;
  options: string[];
  value: string;
  readOnly?: boolean;
}
function Select({ label, options, value, readOnly = false }: SelectProps) {
  return (
    <div>
      <label className="block text-neutral-950 font-semibold mb-2">{label}</label>
      <select
        value={value}
        disabled={readOnly}
        className={`w-full border border-gray-300 rounded-lg px-4 py-2 ${readOnly ? "bg-gray-100 cursor-not-allowed" : "focus:outline-none focus:ring-2 focus:ring-red-500"}`}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

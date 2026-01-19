import { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Usuario {
  id: string;
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
  rol: string;
}

export default function EditarUsuario() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [rolFiltro, setRolFiltro] = useState<string>("");

  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<Usuario | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  // Estado para roles
  const [roles, setRoles] = useState<string[]>([]);

  // Cargar roles desde Firebase
  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const snapshot = await getDocs(collection(db, "roles"));
        const listaRoles = snapshot.docs.map((doc) => doc.id); // nombres de roles
        setRoles(listaRoles);
      } catch (error) {
        console.error("Error cargando roles", error);
      }
    };
    cargarRoles();
  }, []);

  // Traer usuarios desde Firebase
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const snapshot = await getDocs(collection(db, "usuarios"));
        const listaUsuarios: Usuario[] = snapshot.docs.map((docu) => {
          const data = docu.data();
          return {
            id: docu.id,
            nombre: data.nombre || "",
            apellido: data.apellido || "",
            cedula: data.cedula || "",
            telefono: data.telefono || "",
            correo: data.correo || "",
            confirmarCorreo: data.correo || "",
            contrasena: data.contrasena || "",
            confirmarContrasena: data.contrasena || "",
            fechaNacimiento: data.fechaNacimiento || "",
            genero: data.genero || "",
            direccion: data.direccion || "",
            codigoPostal: data.codigoPostal || "",
            ciudad: data.ciudad || "",
            rol: data.rol || "",
          } as Usuario;
        });
        setUsuarios(listaUsuarios);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUsuarios();
  }, []);

  const sugerencias = usuarios.filter(
    (u) =>
      (u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correo.toLowerCase().includes(busqueda.toLowerCase())) &&
      (rolFiltro
        ? u.rol.trim().toLowerCase() === rolFiltro.trim().toLowerCase()
        : true)
  );

  // Guardar cambios en Firebase
  const guardarCambios = async () => {
    if (!usuarioSeleccionado) return;

    const { confirmarCorreo, confirmarContrasena, id, ...usuarioParaGuardar } =
      usuarioSeleccionado;

    // Validaciones
    if (usuarioSeleccionado.correo !== confirmarCorreo) {
      setToastMessage("Los correos no coinciden");
      setToastType("error");
      return;
    }
    if (usuarioSeleccionado.contrasena !== confirmarContrasena) {
      setToastMessage("Las contraseñas no coinciden");
      setToastType("error");
      return;
    }

    try {
      const usuarioRef = doc(db, "usuarios", id);
      await updateDoc(usuarioRef, usuarioParaGuardar);

      setToastMessage("Usuario actualizado correctamente");
      setToastType("success");
      setUsuarioSeleccionado(null);

      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...usuarioSeleccionado } : u))
      );
    } catch (error) {
      console.error(error);
      setToastMessage("Ocurrió un error al actualizar el usuario");
      setToastType("error");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">
        Editar Usuario
      </h2>

      {/* Buscador y filtro por rol */}
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
          onChange={(e) => setRolFiltro(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Todos los roles</option>
          {roles.map((rol) => (
            <option key={rol} value={rol}>
              {rol}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white/10 p-8 rounded-3xl min-h-[400px] flex flex-col gap-4 overflow-y-auto">
        {!usuarioSeleccionado ? (
          // Lista de usuarios
          sugerencias.length > 0 ? (
            sugerencias.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl border border-gray-300 hover:bg-red-100 cursor-pointer flex justify-between items-center"
                onClick={() => setUsuarioSeleccionado(u)}
              >
                <div>
                  <p className="font-semibold text-neutral-950">
                    {u.nombre} {u.apellido}
                  </p>
                  <p className="text-sm text-neutral-700">
                    {u.correo} - {u.rol}
                  </p>
                </div>
                <p className="font-semibold text-neutral-950">{u.ciudad}</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-950 text-lg">
              No se encontraron usuarios
            </p>
          )
        ) : (
          // Formulario idéntico a Agregar Usuario
          <form className="grid grid-cols-2 gap-6">
            {/* Nombre y Apellido */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={usuarioSeleccionado.nombre}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    nombre: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Apellido
              </label>
              <input
                type="text"
                value={usuarioSeleccionado.apellido}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    apellido: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Cédula y Teléfono */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Cédula
              </label>
              <input
                type="text"
                value={usuarioSeleccionado.cedula}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    cedula: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Teléfono
              </label>
              <input
                type="text"
                value={usuarioSeleccionado.telefono}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    telefono: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Correo y Confirmar Correo */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={usuarioSeleccionado.correo}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    correo: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Confirmar Correo
              </label>
              <input
                type="email"
                value={usuarioSeleccionado.confirmarCorreo}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    confirmarCorreo: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Contraseña y Confirmar Contraseña */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={usuarioSeleccionado.contrasena}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    contrasena: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={usuarioSeleccionado.confirmarContrasena}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    confirmarContrasena: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Fecha, Género, Dirección, Código Postal, Ciudad, Rol */}
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={usuarioSeleccionado.fechaNacimiento}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    fechaNacimiento: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Género
              </label>
              <select
                value={usuarioSeleccionado.genero}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    genero: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccione</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-neutral-950 font-semibold mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={usuarioSeleccionado.direccion}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    direccion: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Código Postal
              </label>
              <input
                type="text"
                value={usuarioSeleccionado.codigoPostal}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    codigoPostal: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Ciudad
              </label>
              <select
                value={usuarioSeleccionado.ciudad}
                onChange={(e) =>
                  setUsuarioSeleccionado({
                    ...usuarioSeleccionado,
                    ciudad: e.target.value,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccione una provincia</option>
                <option value="Azuay">Azuay</option>
                <option value="Bolívar">Bolívar</option>
                <option value="Cañar">Cañar</option>
                <option value="Carchi">Carchi</option>
                <option value="Chimborazo">Chimborazo</option>
                <option value="Cotopaxi">Cotopaxi</option>
                <option value="El Oro">El Oro</option>
                <option value="Esmeraldas">Esmeraldas</option>
                <option value="Galápagos">Galápagos</option>
                <option value="Guayas">Guayas</option>
                <option value="Imbabura">Imbabura</option>
                <option value="Loja">Loja</option>
                <option value="Los Ríos">Los Ríos</option>
                <option value="Manabí">Manabí</option>
                <option value="Morona Santiago">Morona Santiago</option>
                <option value="Napo">Napo</option>
                <option value="Orellana">Orellana</option>
                <option value="Pastaza">Pastaza</option>
                <option value="Pichincha">Pichincha</option>
                <option value="Santa Elena">Santa Elena</option>
                <option value="Santo Domingo de los Tsáchilas">
                  Santo Domingo de los Tsáchilas
                </option>
                <option value="Sucumbíos">Sucumbíos</option>
                <option value="Tungurahua">Tungurahua</option>
                <option value="Zamora Chinchipe">Zamora Chinchipe</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-950 font-semibold mb-2">
                Rol
              </label>
              <select
                value={usuarioSeleccionado?.rol || ""}
                onChange={(e) =>
                  setUsuarioSeleccionado((prev) =>
                    prev ? { ...prev, rol: e.target.value } : null
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Seleccione Rol</option>
                {roles.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
            </div>
            {/* Botones */}
            <div className="col-span-2 flex gap-4 pt-4">
              <button
                type="button"
                onClick={guardarCambios}
                className="bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setUsuarioSeleccionado(null)}
                className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Toast en esquina superior */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage("")}
          />
        )}
      </div>
    </div>
  );
}

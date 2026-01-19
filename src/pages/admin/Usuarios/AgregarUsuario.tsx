import { useState, useEffect } from "react";
import { db } from "../../../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Toast from "../../../components/Toast";

interface Usuario {
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

export default function AgregarUsuario() {
  const [usuario, setUsuario] = useState<Usuario>({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    correo: "",
    confirmarCorreo: "",
    contrasena: "",
    confirmarContrasena: "",
    fechaNacimiento: "",
    genero: "",
    direccion: "",
    codigoPostal: "",
    ciudad: "",
    rol: "",
  });

  const [roles, setRoles] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  
  useEffect(() => {
  const cargarRoles = async () => {
    try {
      const snapshot = await getDocs(collection(db, "roles"));
      const lista = snapshot.docs.map(doc => doc.id); // Administrador, Cliente
      setRoles(lista);
    } catch (error) {
      console.error("Error cargando roles", error);
    }
  };

  cargarRoles();
}, []);

  
  
  const crearUsuario = async () => {
  const { confirmarCorreo, confirmarContrasena, ...usuarioParaGuardar } = usuario;

  // Validaciones
  if (usuario.correo !== confirmarCorreo) {
    setToastMessage("Los correos no coinciden");
    setToastType("error");
    return;
  }
  if (usuario.contrasena !== confirmarContrasena) {
    setToastMessage("Las contraseñas no coinciden");
    setToastType("error");
    return;
  }

  try {
    await addDoc(collection(db, "usuarios"), usuarioParaGuardar);
    setToastMessage("Usuario creado correctamente");
    setToastType("success");
    setUsuario({
      nombre: "",
      apellido: "",
      cedula: "",
      telefono: "",
      correo: "",
      confirmarCorreo: "",
      contrasena: "",
      confirmarContrasena: "",
      fechaNacimiento: "",
      genero: "",
      direccion: "",
      codigoPostal: "",
      ciudad: "",
      rol: "",
    });
  } catch (error) {
    console.error(error);
    setToastMessage("Ocurrió un error al crear el usuario");
    setToastType("error");
  }
};


  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      <h2 className="text-3xl font-bold mb-6 text-neutral-950">Crear Usuario</h2>

      <div className="bg-white/10 p-8 rounded-3xl min-h-[600px] flex flex-col gap-6 overflow-y-auto">
        <form className="grid grid-cols-2 gap-6">

          {/* Nombre y Apellido */}
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Nombre</label>
            <input
              type="text"
              value={usuario.nombre}
              onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
              placeholder="Ingrese el nombre"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Apellido</label>
            <input
              type="text"
              value={usuario.apellido}
              onChange={(e) => setUsuario({ ...usuario, apellido: e.target.value })}
              placeholder="Ingrese el apellido"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Cédula y Teléfono */}
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Cédula</label>
            <input
              type="text"
              value={usuario.cedula}
              onChange={(e) => setUsuario({ ...usuario, cedula: e.target.value })}
              placeholder="Ingrese la cédula"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Teléfono</label>
            <input
              type="text"
              value={usuario.telefono}
              onChange={(e) => setUsuario({ ...usuario, telefono: e.target.value })}
              placeholder="Ingrese el teléfono"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Correo y Confirmar Correo */}
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Correo Electrónico</label>
            <input
              type="email"
              value={usuario.correo}
              onChange={(e) => setUsuario({ ...usuario, correo: e.target.value })}
              placeholder="Ingrese el correo"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Confirmar Correo</label>
            <input
              type="email"
              value={usuario.confirmarCorreo}
              onChange={(e) => setUsuario({ ...usuario, confirmarCorreo: e.target.value })}
              placeholder="Confirme el correo"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Contraseña y Confirmar Contraseña */}
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Contraseña</label>
            <input
              type="password"
              value={usuario.contrasena}
              onChange={(e) => setUsuario({ ...usuario, contrasena: e.target.value })}
              placeholder="Ingrese la contraseña"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Confirmar Contraseña</label>
            <input
              type="password"
              value={usuario.confirmarContrasena}
              onChange={(e) => setUsuario({ ...usuario, confirmarContrasena: e.target.value })}
              placeholder="Confirme la contraseña"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Fecha, género, dirección, ciudad, código postal, rol */}
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Fecha de Nacimiento</label>
            <input
              type="date"
              value={usuario.fechaNacimiento}
              onChange={(e) => setUsuario({ ...usuario, fechaNacimiento: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Género</label>
            <select
              value={usuario.genero}
              onChange={(e) => setUsuario({ ...usuario, genero: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Seleccione</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-neutral-950 font-semibold mb-2">Dirección</label>
            <input
              type="text"
              value={usuario.direccion}
              onChange={(e) => setUsuario({ ...usuario, direccion: e.target.value })}
              placeholder="Ingrese la dirección"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Código Postal</label>
            <input
              type="text"
              value={usuario.codigoPostal}
              onChange={(e) => setUsuario({ ...usuario, codigoPostal: e.target.value })}
              placeholder="Ingrese código postal"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-neutral-950 font-semibold mb-2">Ciudad</label>
            <select
              value={usuario.ciudad}
              onChange={(e) => setUsuario({ ...usuario, ciudad: e.target.value })}
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
              <option value="Santo Domingo de los Tsáchilas">Santo Domingo de los Tsáchilas</option>
              <option value="Sucumbíos">Sucumbíos</option>
              <option value="Tungurahua">Tungurahua</option>
              <option value="Zamora Chinchipe">Zamora Chinchipe</option>
            </select>
          </div>

          <select
              value={usuario.rol}
              onChange={(e) =>
                setUsuario({ ...usuario, rol: e.target.value })

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


          {/* Botones */}
          <div className="col-span-2 flex gap-4 pt-4">
            <button
              type="button"
              onClick={crearUsuario}
              className="bg-red-600 text-white font-semibold px-6 py-2 rounded-xl hover:bg-red-700 transition-colors"
            >
              Crear Usuario
            </button>
            <button
              type="button"
              className="bg-gray-300 text-neutral-950 font-semibold px-6 py-2 rounded-xl hover:bg-gray-400 transition-colors"
              onClick={() =>
                setUsuario({
                  nombre: "",
                  apellido: "",
                  cedula: "",
                  telefono: "",
                  correo: "",
                  confirmarCorreo: "",
                  contrasena: "",
                  confirmarContrasena: "",
                  fechaNacimiento: "",
                  genero: "",
                  direccion: "",
                  codigoPostal: "",
                  ciudad: "",
                  rol: "",
                })
              }
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage("")} />
      )}
    </div>
  );
}

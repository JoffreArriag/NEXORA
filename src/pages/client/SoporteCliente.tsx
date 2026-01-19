export default function SoporteCliente() {
  return (
    <div>
      <h1 className="text-5xl font-black text-slate-800 mb-4">Soporte</h1>
      <p className="text-lg text-slate-700 mb-12">
        ¿Tienes alguna duda o problema? Envíanos un mensaje y nuestro equipo te ayudará.
      </p>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-12">
        <form className="grid grid-cols-1 gap-6">
          <Campo label="Nombre" value="Juan Pérez" editable />
          <Campo label="Correo Electrónico" value="juan.perez@email.com" editable type="email" />
          <Campo label="Asunto" value="" editable placeholder="Describe brevemente tu consulta" />
          <Textarea label="Mensaje" value="" editable placeholder="Escribe tu mensaje aquí..." />

          <button type="submit" className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 text-white py-5 rounded-2xl font-bold text-xl transition-colors">
            Enviar Mensaje
          </button>
        </form>
      </div>
    </div>
  )
}

/* COMPONENTES */
interface CampoProps { label:string; value:string; placeholder?:string; editable?:boolean; type?:string }
function Campo({ label, value, placeholder="", editable=true, type="text" }: CampoProps) {
  return (
    <div>
      <label className="block text-lg font-bold text-slate-700 mb-2">{label}</label>
      <input type={type} value={value} placeholder={placeholder} disabled={!editable}
        className={`w-full bg-white border p-5 rounded-2xl text-lg outline-none transition-all
          ${editable ? "border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500" : "border-slate-200 bg-slate-100 cursor-not-allowed"}`} />
    </div>
  )
}

interface TextareaProps { label:string; value:string; placeholder?:string; editable?:boolean }
function Textarea({ label, value, placeholder="", editable=true }: TextareaProps) {
  return (
    <div>
      <label className="block text-lg font-bold text-slate-700 mb-2">{label}</label>
      <textarea value={value} placeholder={placeholder} disabled={!editable}
        className={`w-full bg-white border p-5 rounded-2xl text-lg outline-none resize-none h-40 transition-all
          ${editable ? "border-slate-200 focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500" : "border-slate-200 bg-slate-100 cursor-not-allowed"}`} />
    </div>
  )
}

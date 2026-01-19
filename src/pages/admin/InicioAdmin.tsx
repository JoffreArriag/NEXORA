import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface InicioAdminProps {
  onNavigate: (seccion: string) => void;
}

export default function InicioAdmin({ onNavigate }: InicioAdminProps) {
  const nombreUsuario = "Administrador";

  const fechaHoy = new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "¡Hola! Soy Nexora, tu asistente virtual. ¿En qué puedo ayudarte?" },
  ]);
  const [input, setInput] = useState("");

  const ventas = [
    { dia: "Lun", total: 120 },
    { dia: "Mar", total: 210 },
    { dia: "Mié", total: 180 },
    { dia: "Jue", total: 260 },
    { dia: "Vie", total: 340 },
    { dia: "Sáb", total: 280 },
    { dia: "Dom", total: 190 },
  ];

  const productosTop = [
    { nombre: "Arroz", cantidad: 120 },
    { nombre: "Aceite", cantidad: 95 },
    { nombre: "Azúcar", cantidad: 80 },
    { nombre: "Leche", cantidad: 70 },
    { nombre: "Pan", cantidad: 60 },
  ];

  const estadoPedidos = [
    { name: "Pendientes", value: 12 },
    { name: "En camino", value: 8 },
    { name: "Entregados", value: 34 },
  ];

  const quickActions = [
    { icon: "📦", label: "Administrar Productos", section: "productos" },
    { icon: "🛒", label: "Gestionar Pedidos", section: "pedidos" },
    { icon: "👥", label: "Usuarios & Roles", section: "usuarios" },
    { icon: "📂", label: "Categorías", section: "categoria" },
    { icon: "💳", label: "Facturas", section: "factura" },
    { icon: "🏢", label: "Información del Negocio", section: "negocio" },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text: "¡Gracias! Pronto te responderé." }]);
    }, 1000);
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 p-6 bg-gray-50">
      {/* Saludo */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 p-8 rounded-3xl shadow-lg text-white flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-extrabold">¡Hola, {nombreUsuario}! 👋</h2>
          <p className="text-lg opacity-90 mt-2">{fechaHoy}</p>
        </div>
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-red-500 font-black text-4xl shadow-lg">
          N
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Productos", value: 128 },
          { label: "Pedidos", value: 54 },
          { label: "Usuarios", value: 21 },
          { label: "Facturas", value: 36 },
        ].map((s) => (
          <div key={s.label} className="bg-white p-6 rounded-2xl shadow">
            <p className="text-gray-500">{s.label}</p>
            <p className="text-3xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="font-bold mb-3">Ventas Semanales</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ventas}>
              <Line dataKey="total" stroke="#ef4444" strokeWidth={3} />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="font-bold mb-3">Top Productos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productosTop}>
              <Bar dataKey="cantidad" fill="#f97316" />
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <h3 className="font-bold mb-3">Estado Pedidos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={estadoPedidos} dataKey="value" nameKey="name" outerRadius={80}>
                {estadoPedidos.map((_, i) => (
                  <Cell key={i} fill={["#f87171", "#facc15", "#4ade80"][i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-red-50 p-6 rounded-2xl border border-red-200">
        <h3 className="font-bold text-red-600 mb-2">⚠ Atención inmediata</h3>
        <ul className="text-red-700 space-y-1">
          <li>5 productos con stock bajo</li>
          <li>3 pedidos nuevos</li>
          <li>2 facturas vencen hoy</li>
        </ul>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((a) => (
          <div
            key={a.label}
            onClick={() => onNavigate(a.section)}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-lg cursor-pointer flex flex-col items-center gap-3"
          >
            <span className="text-4xl">{a.icon}</span>
            <p className="font-semibold">{a.label}</p>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="fixed bottom-6 right-6">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 bg-red-500 text-white rounded-full text-3xl"
          >
            💬
          </button>
        ) : (
          <div className="w-80 h-96 bg-white rounded-2xl shadow flex flex-col">
            <div className="bg-red-500 text-white p-3 font-bold">Nexora Assistant</div>
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {messages.map((m, i) => (
                <div key={i} className={`p-2 rounded ${m.from === "bot" ? "bg-gray-100" : "bg-red-100 self-end"}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="p-3 flex gap-2">
              <input
                className="flex-1 border rounded px-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend} className="bg-red-500 text-white px-3 rounded">
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

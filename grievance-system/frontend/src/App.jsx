import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ─── API HELPER ───────────────────────────────────────────────────────────────
const api = async (path, options = {}, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
};

// ─── CATEGORY COLORS ──────────────────────────────────────────────────────────
const catColors = {
  Academic: { bg: "rgba(167,139,250,0.2)", text: "#c4b5fd", dot: "#a78bfa" },
  Hostel: { bg: "rgba(244,114,182,0.2)", text: "#f9a8d4", dot: "#f472b6" },
  Transport: { bg: "rgba(74,222,128,0.2)", text: "#86efac", dot: "#4ade80" },
  Other: { bg: "rgba(250,204,21,0.2)", text: "#fde047", dot: "#facc15" },
};

const statusColors = {
  Pending: { bg: "rgba(250,204,21,0.2)", text: "#fde047" },
  Resolved: { bg: "rgba(74,222,128,0.2)", text: "#86efac" },
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      padding: "12px 20px", borderRadius: 18, fontWeight: 600,
      background: "#111",
      border: `1px solid ${type === "error" ? "rgba(244,114,182,0.4)" : "rgba(74,222,128,0.4)"}`,
      color: "#f5f5f5",
      boxShadow: "0 10px 36px rgba(0,0,0,0.45)",
      animation: "slideIn 0.3s ease",
      display: "flex", alignItems: "center", gap: 10
    }}>
      <span>{type === "error" ? "⚠️" : "✅"}</span>
      {msg}
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#f5f5f5", fontSize: 14 }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 30,
          border: "1px solid #1e1e1e", fontSize: 14, outline: "none",
          transition: "border 0.2s", background: "#0d0d0d", color: "#f5f5f5", boxSizing: "border-box"
        }}
        onFocus={e => e.target.style.borderColor = "#a78bfa"}
        onBlur={e => e.target.style.borderColor = "#1e1e1e"}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#f5f5f5", fontSize: 14 }}>{label}</label>
      <select value={value} onChange={onChange}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 30,
          border: "1px solid #1e1e1e", fontSize: 14, outline: "none",
          background: "#0d0d0d", color: "#f5f5f5", boxSizing: "border-box", cursor: "pointer"
        }}
        onFocus={e => e.target.style.borderColor = "#a78bfa"}
        onBlur={e => e.target.style.borderColor = "#1e1e1e"}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", type = "button", disabled, small }) {
  const styles = {
    primary: { background: "linear-gradient(135deg, #a78bfa, #f472b6)", color: "#0d0d0d", border: "none" },
    danger: { background: "rgba(248,113,113,0.2)", color: "#fca5a5", border: "1px solid #1e1e1e" },
    ghost: { background: "#111", color: "#f5f5f5", border: "1px solid #1e1e1e" },
    success: { background: "rgba(74,222,128,0.2)", color: "#86efac", border: "1px solid #1e1e1e" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...styles[variant],
      padding: small ? "8px 14px" : "11px 20px",
      borderRadius: 30, fontWeight: 700,
      fontSize: small ? 13 : 14, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1, transition: "opacity 0.2s, transform 0.15s",
    }}
      onMouseEnter={e => { if (!disabled) { e.target.style.opacity = "0.9"; e.target.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={e => { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; }}
    >{children}</button>
  );
}

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────
function RegisterPage({ onSwitch, onToast }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/api/register", { method: "POST", body: JSON.stringify(form) });
      onToast("Registered! Please log in.", "success");
      onSwitch();
    } catch (err) {
      onToast(err.message, "error");
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Create Account" subtitle="Join the Grievance Portal">
      <form onSubmit={handle}>
        <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Rahul Sharma" required />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="rahul@college.edu" required />
        <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required />
        <Btn type="submit" disabled={loading}>{loading ? "Registering…" : "Register"}</Btn>
      </form>
      <p style={{ marginTop: 20, textAlign: "center", color: "#888", fontSize: 14 }}>
        Already registered?{" "}
        <span onClick={onSwitch} style={{ color: "#f472b6", fontWeight: 600, cursor: "pointer" }}>Login →</span>
      </p>
    </AuthCard>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onSwitch, onToast }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api("/api/login", { method: "POST", body: JSON.stringify(form) });
      onLogin(data.token, data.name);
      onToast(`Welcome back, ${data.name}!`, "success");
    } catch (err) {
      onToast(err.message, "error");
    } finally { setLoading(false); }
  };

  return (
    <AuthCard title="Welcome Back" subtitle="Log in to your portal">
      <form onSubmit={handle}>
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="rahul@college.edu" required />
        <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" required />
        <Btn type="submit" disabled={loading}>{loading ? "Logging in…" : "Login"}</Btn>
      </form>
      <p style={{ marginTop: 20, textAlign: "center", color: "#888", fontSize: 14 }}>
        New student?{" "}
        <span onClick={onSwitch} style={{ color: "#f472b6", fontWeight: 600, cursor: "pointer" }}>Register here →</span>
      </p>
    </AuthCard>
  );
}

function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d0d",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: "#111", borderRadius: 18, padding: "40px 36px",
        border: "1px solid #1e1e1e",
        width: "100%", maxWidth: 420,
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)"
      }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎓</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#f5f5f5" }}>{title}</h1>
          <p style={{ margin: "6px 0 0", color: "#888", fontSize: 14 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ token, name, onLogout, onToast }) {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [view, setView] = useState(null);
  const initials = (name || "U")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("") || "U";

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("/api/grievances", {}, token);
      setGrievances(data);
    } catch (err) { onToast(err.message, "error"); }
    finally { setLoading(false); }
  }, [token, onToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (!q) return fetchAll();
    try {
      const data = await api(`/api/grievances/search?title=${encodeURIComponent(q)}`, {}, token);
      setGrievances(data);
    } catch (err) { onToast(err.message, "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this grievance?")) return;
    try {
      await api(`/api/grievances/${id}`, { method: "DELETE" }, token);
      onToast("Deleted successfully", "success");
      fetchAll();
    } catch (err) { onToast(err.message, "error"); }
  };

  const totalCount = grievances.length;
  const pendingCount = grievances.filter((g) => g.status === "Pending").length;
  const resolvedCount = grievances.filter((g) => g.status === "Resolved").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d" }}>
      {/* NAVBAR */}
      <nav style={{
        background: "#0d0d0d", borderBottom: "1px solid #1e1e1e",
        padding: "0 24px", height: 64, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 12px rgba(0,0,0,0.25)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>🎓</span>
          <span style={{
            fontWeight: 800,
            fontSize: 18,
            background: "linear-gradient(135deg, #a78bfa, #f472b6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>GrievancePortal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "#0d0d0d",
            fontSize: 12,
            fontWeight: 700,
            background: "linear-gradient(135deg, #a78bfa, #f472b6)"
          }}>
            {initials}
          </div>
          <Btn variant="ghost" small onClick={onLogout}>logout</Btn>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 20
        }}>
          <div style={{ background: "rgba(167,139,250,0.2)", border: "1px solid #1e1e1e", borderRadius: 18, padding: "14px 16px" }}>
            <p style={{ margin: 0, color: "#888", fontSize: 12 }}>Total</p>
            <p style={{ margin: "4px 0 0", color: "#c4b5fd", fontSize: 24, fontWeight: 700 }}>{totalCount}</p>
          </div>
          <div style={{ background: "rgba(244,114,182,0.2)", border: "1px solid #1e1e1e", borderRadius: 18, padding: "14px 16px" }}>
            <p style={{ margin: 0, color: "#888", fontSize: 12 }}>Pending</p>
            <p style={{ margin: "4px 0 0", color: "#f9a8d4", fontSize: 24, fontWeight: 700 }}>{pendingCount}</p>
          </div>
          <div style={{ background: "rgba(74,222,128,0.2)", border: "1px solid #1e1e1e", borderRadius: 18, padding: "14px 16px" }}>
            <p style={{ margin: 0, color: "#888", fontSize: 12 }}>Resolved</p>
            <p style={{ margin: "4px 0 0", color: "#86efac", fontSize: 24, fontWeight: 700 }}>{resolvedCount}</p>
          </div>
        </div>

        {/* HEADER ROW */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#f5f5f5" }}>My Grievances</h2>
            <p style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>{grievances.length} total</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 14px",
              borderRadius: 30,
              border: "1px solid #1e1e1e",
              background: "#111",
              width: 220
            }}>
              <span style={{ color: "#888" }}>🔍</span>
              <input
                placeholder="Search by title"
                value={search}
                onChange={handleSearch}
                style={{
                  padding: "10px 0",
                  border: "none",
                  fontSize: 14,
                  outline: "none",
                  width: "100%",
                  background: "transparent",
                  color: "#f5f5f5"
                }}
              />
            </div>
            <Btn onClick={() => { setShowForm(true); setEditItem(null); }}>+ new</Btn>
          </div>
        </div>

        {/* MODAL FORM */}
        {showForm && (
          <GrievanceForm
            token={token}
            editItem={editItem}
            onSave={() => { setShowForm(false); fetchAll(); onToast(editItem ? "Updated!" : "Submitted!", "success"); }}
            onClose={() => { setShowForm(false); setEditItem(null); }}
            onToast={onToast}
          />
        )}

        {/* GRIEVANCE DETAIL VIEW */}
        {view && (
          <GrievanceDetail item={view} onClose={() => setView(null)} />
        )}

        {/* LIST */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#888" }}>Loading...</div>
        ) : grievances.length === 0 ? (
          <EmptyState onNew={() => setShowForm(true)} />
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {grievances.map(g => (
              <GrievanceCard
                key={g._id}
                item={g}
                onEdit={() => { setEditItem(g); setShowForm(true); }}
                onDelete={() => handleDelete(g._id)}
                onView={() => setView(g)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GrievanceCard({ item, onEdit, onDelete, onView }) {
  const cat = catColors[item.category] || catColors.Other;
  const stat = statusColors[item.status] || statusColors.Pending;
  return (
    <div style={{
      background: "#111", borderRadius: 18, padding: "18px 20px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.25)", border: "1px solid #1e1e1e",
      transition: "box-shadow 0.2s"
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 10px 28px rgba(167,139,250,0.18)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.25)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f5f5f5" }}>{item.title}</h3>
            <span style={{ background: cat.bg, color: cat.text, borderRadius: 30, padding: "4px 12px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: cat.dot, display: "inline-block" }} />
              {item.category}
            </span>
            <span style={{ background: stat.bg, color: stat.text, borderRadius: 30, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
              {item.status}
            </span>
          </div>
          <p style={{ margin: 0, color: "#888", fontSize: 14, lineHeight: 1.5, maxWidth: 550 }}>
            {item.description.length > 100 ? item.description.slice(0, 100) + "…" : item.description}
          </p>
          <p style={{ margin: "8px 0 0", color: "#555", fontSize: 12 }}>
            {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small variant="ghost" onClick={onView}>View</Btn>
          <Btn small variant="success" onClick={onEdit}>Edit</Btn>
          <Btn small variant="danger" onClick={onDelete}>Delete</Btn>
        </div>
      </div>
    </div>
  );
}

function GrievanceForm({ token, editItem, onSave, onClose, onToast }) {
  const [form, setForm] = useState({
    title: editItem?.title || "",
    description: editItem?.description || "",
    category: editItem?.category || "Academic",
    status: editItem?.status || "Pending",
  });
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editItem) {
        await api(`/api/grievances/${editItem._id}`, { method: "PUT", body: JSON.stringify(form) }, token);
      } else {
        await api("/api/grievances", { method: "POST", body: JSON.stringify(form) }, token);
      }
      onSave();
    } catch (err) { onToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#111", borderRadius: 18, padding: "32px 28px",
        border: "1px solid #1e1e1e",
        width: "100%", maxWidth: 480, boxShadow: "0 24px 80px rgba(0,0,0,0.5)"
      }}>
        <h3 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800, color: "#f5f5f5" }}>
          {editItem ? "✏️ Edit Grievance" : "📝 Submit Grievance"}
        </h3>
        <form onSubmit={handle}>
          <Input label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief title of your complaint" required />
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#f5f5f5", fontSize: 14 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your grievance in detail…" required rows={4}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 18,
                border: "1px solid #1e1e1e", fontSize: 14, outline: "none",
                resize: "vertical", fontFamily: "inherit", background: "#0d0d0d", color: "#f5f5f5", boxSizing: "border-box"
              }}
              onFocus={e => e.target.style.borderColor = "#a78bfa"}
              onBlur={e => e.target.style.borderColor = "#1e1e1e"}
            />
          </div>
          <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={["Academic", "Hostel", "Transport", "Other"]} />
          {editItem && (
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} options={["Pending", "Resolved"]} />
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn type="submit" disabled={loading}>{loading ? "saving..." : editItem ? "update" : "submit fr ->"}</Btn>
            <Btn variant="ghost" onClick={onClose}>nah cancel</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

function GrievanceDetail({ item, onClose }) {
  const cat = catColors[item.category] || catColors.Other;
  const stat = statusColors[item.status] || statusColors.Pending;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#111", borderRadius: 18, padding: "32px 28px", border: "1px solid #1e1e1e", width: "100%", maxWidth: 480, boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#f5f5f5" }}>{item.title}</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ background: cat.bg, color: cat.text, borderRadius: 30, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{item.category}</span>
          <span style={{ background: stat.bg, color: stat.text, borderRadius: 30, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>{item.status}</span>
        </div>
        <p style={{ color: "#888", lineHeight: 1.7, marginBottom: 16 }}>{item.description}</p>
        <p style={{ color: "#555", fontSize: 13 }}>Submitted: {new Date(item.date).toLocaleString("en-IN")}</p>
        <p style={{ color: "#555", fontSize: 12, wordBreak: "break-all" }}>ID: {item._id}</p>
        <div style={{ marginTop: 20 }}>
          <Btn variant="ghost" onClick={onClose}>nah cancel</Btn>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNew }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#555" }}>
      <div style={{ fontSize: 56, marginBottom: 12 }}>📭</div>
      <p style={{ fontSize: 16, fontWeight: 600, color: "#f5f5f5" }}>No grievances found</p>
      <p style={{ fontSize: 14, marginBottom: 20, color: "#888" }}>Submit your first complaint below</p>
      <Btn onClick={onNew}>+ new</Btn>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("login");
  const [token, setToken] = useState(() => localStorage.getItem("grv_token") || null);
  const [name, setName] = useState(() => localStorage.getItem("grv_name") || "");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  const handleLogin = (t, n) => {
    localStorage.setItem("grv_token", t);
    localStorage.setItem("grv_name", n);
    setToken(t); setName(n);
  };

  const handleLogout = () => {
    localStorage.removeItem("grv_token");
    localStorage.removeItem("grv_name");
    setToken(null); setName("");
    setPage("login");
    showToast("Logged out successfully", "success");
  };

  return (
    <>
      <style>{`* { box-sizing: border-box; font-family: 'Space Grotesk', sans-serif; } body { margin: 0; background: #0d0d0d; color: #f5f5f5; } @keyframes slideIn { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }`}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {token ? (
        <Dashboard token={token} name={name} onLogout={handleLogout} onToast={showToast} />
      ) : page === "login" ? (
        <LoginPage onLogin={handleLogin} onSwitch={() => setPage("register")} onToast={showToast} />
      ) : (
        <RegisterPage onSwitch={() => setPage("login")} onToast={showToast} />
      )}
    </>
  );
}

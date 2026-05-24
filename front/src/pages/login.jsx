import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Route, MapPin, Navigation, BarChart2, Bell, ShieldCheck, Building2, Lock } from "lucide-react";
import api from "../api/axios";
const FEATURES = [
  { icon: MapPin,    color: "#00ffa3", title: "Live tracking",  sub: "Monitor every vehicle in real time" },
  { icon: Navigation,color: "#00e0ff", title: "Smart routing",  sub: "AI-optimized delivery paths" },
  { icon: BarChart2, color: "#ffbe00", title: "Analytics hub",  sub: "Performance insights & reports" },
  { icon: Bell,      color: "#00ffa3", title: "Alerts",         sub: "ETA delays & status updates" },
];

const STATS = [
  { val: "15k+",  lbl: "Teams" },
  { val: "99.9%", lbl: "Uptime SLA" },
  { val: "2.4M",  lbl: "Routes" },
];

const AVATARS = ["JL", "SR", "MK", "+"];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --ng:     #00ffa3;
    --nc:     #00e0ff;
    --ngold:  #ffbe00;
    --bg:     #020811;
    --panel:  rgba(6,18,40,0.85);
    --border: rgba(0,255,163,0.12);
    --tb:     #e8f4f8;
    --tm:     #7ba3b8;
    --td:     #3a5a6a;
    --fd:     'Orbitron', monospace;
    --fb:     'DM Sans', sans-serif;
    --fm:     'DM Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .tr-login-root {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: stretch;
    font-family: var(--fb);
    -webkit-font-smoothing: antialiased;
  }

  .tr-left {
    flex: 1.15;
    background: linear-gradient(135deg, #020d1f 0%, #030e22 60%, #021218 100%);
    border-right: 1px solid var(--border);
    padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 3vw, 2rem);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  .tr-right {
    flex: 0.85;
    background: var(--bg);
    padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 3vw, 2rem);
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 300px;
  }

  .tr-logo-row    { display: flex; align-items: center; gap: 10px; }
  .tr-logo-icon   {
    width: 36px; height: 36px;
    background: rgba(0,255,163,0.08);
    border: 1px solid rgba(0,255,163,0.25);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .tr-logo-name   { font-family: var(--fd); font-size: 0.75rem; font-weight: 700; color: var(--ng); letter-spacing: 0.15em; }
  .tr-logo-sub    { font-size: 0.55rem; color: rgba(0,255,163,0.4); letter-spacing: 0.2em; font-family: var(--fm); text-transform: uppercase; }

  .tr-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(0,255,163,0.08);
    border: 1px solid rgba(0,255,163,0.2);
    color: var(--ng);
    font-size: 0.62rem; font-weight: 600;
    padding: 4px 10px; border-radius: 100px;
    margin-bottom: 1rem; letter-spacing: 0.06em;
  }
  .tr-badge-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--ng);
  }

  .tr-h1 {
    font-family: var(--fd);
    font-size: clamp(1rem, 2.5vw, 1.35rem);
    font-weight: 700; color: var(--tb);
    line-height: 1.35; margin-bottom: 0.65rem;
  }
  .tr-h1 span { color: var(--ng); }

  .tr-desc { font-size: 0.78rem; color: var(--tm); line-height: 1.65; max-width: 340px; }

  .tr-feats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 1.25rem; }
  .tr-feat {
    background: var(--panel);
    border: 1px solid rgba(0,255,163,0.1);
    border-radius: 10px; padding: 12px;
  }
  .tr-feat-t { font-size: 0.68rem; font-weight: 600; color: var(--tb); }
  .tr-feat-s { font-size: 0.61rem; color: var(--td); line-height: 1.4; }

  .tr-r-label { font-family: var(--fm); font-size: 0.56rem; color: rgba(0,255,163,0.5); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.9rem; }
  .tr-r-h2 { font-family: var(--fd); font-size: 0.95rem; font-weight: 700; color: var(--tb); margin-bottom: 4px; }
  .tr-r-sub { font-size: 0.72rem; color: var(--td); margin-bottom: 1.5rem; }

  .tr-flabel {
    display: block; font-size: 0.6rem; font-weight: 600;
    color: var(--tm); letter-spacing: 0.08em;
    text-transform: uppercase; margin-bottom: 5px;
  }
  .tr-input {
    width: 100%; height: 40px;
    background: rgba(6,18,40,0.9);
    border: 1px solid rgba(0,255,163,0.15);
    border-radius: 8px; color: var(--tb);
    font-size: 0.8rem; padding: 0 12px;
    outline: none;
    margin-bottom: 12px;
  }

  .tr-pass-wrap { position: relative; margin-bottom: 12px; }
  .tr-pass-wrap .tr-input { margin-bottom: 0; padding-right: 40px; }
  .tr-eye-btn {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--td);
  }

  .tr-opts   { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
  .tr-chk    { display: flex; align-items: center; gap: 6px; font-size: 0.65rem; color: var(--td); }
  .tr-forgot { font-size: 0.65rem; color: var(--nc); background: none; border: none; cursor: pointer; }

  .tr-btn-main {
    width: 100%; height: 42px;
    background: rgba(0,255,163,0.1);
    border: 1px solid rgba(0,255,163,0.35);
    border-radius: 8px; color: var(--ng);
    font-size: 0.72rem; font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Please enter your email.");
    if (!password.trim()) return setError("Please enter your password.");

    setLoading(true);
    try {
      const res = await api.post("auth/login", { email, password });
      const { token, user } = res.data;
      if (!token) return setError("No token received from server.");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="tr-login-root">
        <div className="tr-left">
          <div className="tr-logo-row">
            <div className="tr-logo-icon">
              <Route size={18} color="#00ffa3" />
            </div>
            <div>
              <div className="tr-logo-name">TrackRoutes</div>
              <div className="tr-logo-sub">✈ Logistics Platform</div>
            </div>
          </div>

          <div>
            <div className="tr-badge">
              <span className="tr-badge-dot" /> Système opérationnel · GPS actif
            </div>
            <h1 className="tr-h1">
              Track your routes,<br />
              <span>optimize every journey</span>
            </h1>
            <p className="tr-desc">
              Real-time GPS tracking, intelligent route optimization, and delivery analytics — built for modern logistics teams.
            </p>

            <div className="tr-feats">
              {FEATURES.map(({ icon: Icon, color, title, sub }) => (
                <div key={title} className="tr-feat">
                  <div style={{ marginBottom: 6 }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div className="tr-feat-t">{title}</div>
                  <div className="tr-feat-s">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="tr-right">
          <p className="tr-r-label">✈ Portail d'accès</p>
          <h2 className="tr-r-h2">Welcome back</h2>
          <p className="tr-r-sub">Sign in to your TrackRoutes account</p>

          <form onSubmit={handleSignIn} noValidate>
            <label className="tr-flabel" htmlFor="tr-email">Work email</label>
            <input
              className="tr-input"
              id="tr-email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="tr-flabel" htmlFor="tr-pass">Password</label>
            <div className="tr-pass-wrap">
              <input
                className="tr-input"
                id="tr-pass"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="tr-eye-btn"
                type="button"
                aria-label={showPass ? "Hide password" : "Show password"}
                onClick={() => setShowPass((p) => !p)}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p style={{ fontSize: "0.68rem", color: "#ff4d6d", marginBottom: "10px", fontFamily: "var(--fm)" }}>
                ⚠ {error}
              </p>
            )}

            <div className="tr-opts">
              <label className="tr-chk">
                <input type="checkbox" /> Keep me signed in
              </label>
              <button className="tr-forgot" type="button">Forgot password?</button>
            </div>

            <button className="tr-btn-main" type="submit" disabled={loading}>
              <Lock size={15} /> {loading ? "Signing in…" : "Sign in to dashboard"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;


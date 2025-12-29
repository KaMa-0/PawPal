import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setAuth } from "../auth/authStore";
import type { Role } from "../auth/authStore";

type AuthResponse = {
  token: string;
  user: { userId: string; email: string; role: Role };
};

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("owner@pawpal.test");
  const [password, setPassword] = useState("123");
  const [role, setRole] = useState<Role>("OWNER");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
        role,
      });

      setAuth({
        token: res.data.token,
        userId: res.data.user.userId,
        email: res.data.user.email,
        role: res.data.user.role,
      });

      nav("/");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label>
          Role (temporary)
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="OWNER">OWNER</option>
            <option value="SITTER">SITTER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>

        {error && <div style={{ color: "salmon" }}>{error}</div>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
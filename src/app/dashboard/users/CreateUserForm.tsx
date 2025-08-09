"use client";

import { useState } from "react";

export default function CreateUserForm() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    role: "pegawai",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal membuat user");

      setMessage("✅ User berhasil dibuat!");
      setForm({ username: "", password: "", name: "", role: "pegawai" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    } catch (err: any) {
      setMessage(`❌ Error: Password atau Username tidak sesuai!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md p-6 bg-white rounded-xl shadow space-y-4"
    >
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input
          type="text"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full mt-1 border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full mt-1 border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Nama Lengkap</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full mt-1 border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Role</label>
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full mt-1 border rounded p-2"
        >
          <option value="pegawai">Pegawai</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        {loading ? "Membuat..." : "Buat User"}
      </button>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </form>
  );
}

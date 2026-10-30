
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "./lib/supabase";
import { LogOut, Pencil, Trash2, Save, X } from "lucide-react";
import "./Admin.css";

type Product = {
  id: string;
  name: string;
  image_url: string;
  price: number;
  description: string;
  available: boolean;
};

type WaitlistEntry = {
  id: string;
  product_id: string;
  email: string;
  created_at: string;
};

const emptyProduct = {
  name: "",
  image_url: "",
  price: "",
  description: "",
  available: true,
};

function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function checkAdmin(id: string) {
    const { data, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", id)
      .maybeSingle();

    if (adminError) {
      setError("Admin-Berechtigung konnte nicht geprüft werden.");
      setIsAdmin(false);
      return;
    }

    setIsAdmin(Boolean(data));
    setUserId(id);
  }

  async function loadAdminData() {
    const [productResult, waitlistResult] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("waitlist").select("*").order("created_at", { ascending: false }),
    ]);

    if (productResult.error) {
      setError(`Produkte konnten nicht geladen werden: ${productResult.error.message}`);
    } else {
      setProducts(productResult.data ?? []);
    }

    if (waitlistResult.error) {
      setError(`Waitlist konnte nicht geladen werden: ${waitlistResult.error.message}`);
    } else {
      setWaitlist(waitlistResult.data ?? []);
    }
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data } = await supabase.auth.getSession();

      if (!active) return;

      const user = data.session?.user;

      if (user) {
        await checkAdmin(user.id);
      }

      if (active) setChecking(false);
    }

    void initialize();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;

      if (session?.user) {
        void checkAdmin(session.user.id);
      } else {
        setUserId(null);
        setIsAdmin(false);
        setProducts([]);
        setWaitlist([]);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAdmin && userId) {
      void loadAdminData();
    }
  }, [isAdmin, userId]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("Login fehlgeschlagen. Bitte E-Mail und Passwort prüfen.");
    }

    setPassword("");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUserId(null);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      image_url: product.image_url,
      price: String(product.price),
      description: product.description,
      available: product.available,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyProduct);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      setError("Bitte gib einen gültigen Preis ein.");
      return;
    }

    setSaving(true);

    const productData = {
      name: form.name.trim(),
      image_url: form.image_url.trim(),
      price,
      description: form.description.trim(),
      available: form.available,
    };

    const result = editingId
      ? await supabase.from("products").update(productData).eq("id", editingId)
      : await supabase.from("products").insert(productData);

    if (result.error) {
      setError(`Speichern fehlgeschlagen: ${result.error.message}`);
    } else {
      resetForm();
      await loadAdminData();
    }

    setSaving(false);
  }

  async function deleteProduct(id: string) {
    const confirmed = window.confirm("Möchtest du diesen Sneaker wirklich löschen?");
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(`Löschen fehlgeschlagen: ${deleteError.message}`);
    } else {
      await loadAdminData();
    }
  }

  async function toggleAvailability(product: Product) {
    const { error: updateError } = await supabase
      .from("products")
      .update({ available: !product.available })
      .eq("id", product.id);

    if (updateError) {
      setError(`Änderung fehlgeschlagen: ${updateError.message}`);
    } else {
      await loadAdminData();
    }
  }

  if (checking) {
    return <main className="admin-page"><p>Prüfe Anmeldung...</p></main>;
  }

  if (!userId) {
    return (
      <main className="admin-page">
        <form className="admin-login" onSubmit={handleLogin}>
          <span className="admin-eyebrow">SNEAKERDROP / ADMIN</span>
          <h1>Admin Login<span>.</span></h1>
          <label htmlFor="admin-email">E-Mail</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="admin-password">Passwort</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className="admin-error">{error}</p>}
          <button type="submit">Einloggen</button>
          <a href="/">Zurück zur Website</a>
        </form>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="admin-page">
        <div className="admin-login">
          <h1>Kein Admin-Zugriff<span>.</span></h1>
          <p>Dieser Benutzer hat keine Admin-Berechtigung.</p>
          {error && <p className="admin-error">{error}</p>}
          <button onClick={handleLogout}>Ausloggen</button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <a className="admin-logo" href="/">SNEAKER<span>DROP.</span></a>
        <div>
          <span>ADMIN DASHBOARD</span>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <section className="admin-content">
        <div className="admin-title">
          <div>
            <span className="admin-eyebrow">CONTROL CENTER</span>
            <h1>Manage drops<span>.</span></h1>
          </div>
          <a href="/" target="_blank" rel="noreferrer">Website ansehen ↗</a>
        </div>

        {error && <p className="admin-error">{error}</p>}

        <section className="admin-panel">
          <h2>{editingId ? "Sneaker bearbeiten" : "Neuen Sneaker hinzufügen"}</h2>

          <form className="product-form" onSubmit={handleSave}>
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>

            <label>
              Bild-URL
              <input
                type="url"
                value={form.image_url}
                onChange={(event) => setForm({ ...form, image_url: event.target.value })}
                required
              />
            </label>

            <label>
              Preis (CHF)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                required
              />
            </label>

            <label>
              Beschreibung
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
              />
            </label>

            <label className="availability-checkbox">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(event) => setForm({ ...form, available: event.target.checked })}
              />
              Verfügbar
            </label>

            <div className="form-actions">
              <button type="submit" disabled={saving}>
                <Save size={16} /> {saving ? "Speichert..." : editingId ? "Änderungen speichern" : "Sneaker hinzufügen"}
              </button>
              {editingId && (
                <button type="button" className="cancel-button" onClick={resetForm}>
                  <X size={16} /> Abbrechen
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="admin-panel">
          <h2>Produkte ({products.length})</h2>
          <div className="admin-product-list">
            {products.map((product) => (
              <article className="admin-product" key={product.id}>
                <img src={product.image_url} alt={product.name} />
                <div className="admin-product-details">
                  <strong>{product.name}</strong>
                  <span>CHF {Number(product.price).toFixed(2)}</span>
                  <span>{product.available ? "Verfügbar" : "Ausverkauft"}</span>
                </div>
                <div className="admin-product-actions">
                  <button onClick={() => void toggleAvailability(product)}>
                    {product.available ? "Ausverkaufen" : "Verfügbar"}
                  </button>
                  <button aria-label={`Bearbeiten: ${product.name}`} onClick={() => startEdit(product)}>
                    <Pencil size={16} />
                  </button>
                  <button aria-label={`Löschen: ${product.name}`} onClick={() => void deleteProduct(product.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
            {products.length === 0 && <p>Noch keine Produkte vorhanden.</p>}
          </div>
        </section>

        <section className="admin-panel">
          <h2>Waitlist ({waitlist.length})</h2>
          {waitlist.length === 0 ? (
            <p>Noch keine Anmeldungen vorhanden.</p>
          ) : (
            <div className="waitlist-table-wrap">
              <table className="waitlist-table">
                <thead>
                  <tr>
                    <th>E-Mail</th>
                    <th>Produkt</th>
                    <th>Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((entry) => {
                    const product = products.find((item) => item.id === entry.product_id);
                    return (
                      <tr key={entry.id}>
                        <td>{entry.email}</td>
                        <td>{product?.name ?? "Produkt nicht gefunden"}</td>
                        <td>{new Date(entry.created_at).toLocaleDateString("de-CH")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Admin;
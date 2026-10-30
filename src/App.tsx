
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { supabase } from "./lib/supabase";
import "./App.css";
import Admin from "./Admin";

type Product = {
  id: string;
  name: string;
  image_url: string;
  price: number;
  description: string;
  available: boolean;
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Could not load products:", error.message);
        setMessage("Products could not be loaded. Please try again.");
      } else {
        setProducts(data ?? []);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  async function joinWaitlist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProduct || !email.trim()) return;

    setSubmitting(true);
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase.from("waitlist").insert({
      product_id: selectedProduct.id,
      email: normalizedEmail,
    });

    if (error?.code === "23505") {
      setMessage("You're already on the waitlist for this sneaker.");
    } else if (error) {
      setMessage("Something went wrong. Please try again.");
    } else {
      setMessage("You're on the list. We'll keep you updated!");
      setEmail("");
    }

    setSubmitting(false);
  }

  if (window.location.pathname === "/admin") {
  return <Admin />;
}

  return (
    <main>
      <nav className="navbar">
        <a className="logo" href="#">
          SNEAKER<span>DROP.</span>
        </a>

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#collection" onClick={() => setMenuOpen(false)}>Collection</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Our story</a>
          <a href="#waitlist" onClick={() => setMenuOpen(false)}>Early access</a>
        </div>

        <a className="nav-cta" href="#collection">
          Explore drops <ArrowUpRight size={16} />
        </a>

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">THE NEXT GENERATION OF STREETWEAR</span>
          <h1>
            NOT JUST
            <br />
            <span>A SNEAKER.</span>
            <br />
            A STATEMENT.
          </h1>
          <p>
            Curated silhouettes. Limited releases. Timeless attitude.
            Discover the sneakers worth waiting for.
          </p>
          <a href="#collection" className="primary-button">
            Discover the collection <ArrowRight size={18} />
          </a>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1400&q=90"
            alt="Premium sneaker"
          />
          <div className="image-label">
            <span>01 / THE COLLECTION</span>
            <span>CURATED FOR YOU</span>
          </div>
        </div>

        <div className="hero-index">SD — 026</div>
      </section>

      <section className="ticker">
        <div>
          EXCLUSIVE DROPS <span>✳</span> CULTURE IN EVERY STEP <span>✳</span>
          BUILT FOR THE BOLD <span>✳</span> EXCLUSIVE DROPS <span>✳</span>
        </div>
      </section>

      <section className="collection section" id="collection">
        <div className="section-heading">
          <div>
            <span className="eyebrow">HANDPICKED FOR YOU</span>
            <h2>THE COLLECTION<span>.</span></h2>
          </div>
          <p>Less noise. Better sneakers. Only the pairs that matter.</p>
        </div>

        {loading ? (
          <p className="status-message">Loading collection...</p>
        ) : products.length === 0 ? (
          <p className="status-message">
            No sneakers found. Add products in your Supabase database.
          </p>
        ) : (
          <div className="product-grid">
            {products.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={product.image_url} alt={product.name} />
                  <span className="product-number">
                    0{index + 1}
                  </span>
                  <span className={`availability ${product.available ? "" : "sold-out"}`}>
                    {product.available ? "AVAILABLE" : "SOLD OUT"}
                  </span>
                  <button
                    className="product-action"
                    onClick={() => {
                      setSelectedProduct(product);
                      setMessage("");
                    }}
                    aria-label={`Join waitlist for ${product.name}`}
                  >
                    <ArrowUpRight />
                  </button>
                </div>

                <div className="product-info">
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                  </div>
                  <strong>CHF {Number(product.price).toFixed(2)}</strong>
                </div>
                <button
                  className="waitlist-link"
                  onClick={() => {
                    setSelectedProduct(product);
                    setMessage("");
                  }}
                >
                  JOIN THE WAITLIST <ArrowRight size={16} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="story section" id="story">
        <div className="story-image">
          <img
            src="https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=1200&q=85"
            alt="Sneaker streetwear culture"
          />
        </div>
        <div className="story-content">
          <span className="eyebrow">MORE THAN FOOTWEAR</span>
          <h2>BUILT ON<br />CULTURE.<br /><span>DRIVEN BY STYLE.</span></h2>
          <p>
            SneakerDrop is about discovering pieces that say something.
            We bring together iconic designs and the next generation of
            sneaker culture.
          </p>
          <a href="#collection" className="text-link">
            Find your next pair <ArrowUpRight size={18} />
          </a>
        </div>
      </section>

      <section className="waitlist-section" id="waitlist">
        <span className="eyebrow">DON'T MISS THE NEXT DROP</span>
        <h2>YOUR NEXT<br />FAVOURITE PAIR<br /><span>STARTS HERE.</span></h2>
        <p>Get early access to exclusive sneaker releases.</p>
        <a href="#collection" className="primary-button">
          Explore sneakers <ArrowRight size={18} />
        </a>
      </section>

      <footer>
        <a className="logo" href="#">SNEAKER<span>DROP.</span></a>
        <p>© 2026 SneakerDrop. Made for sneaker culture.</p>
        <a href="#collection">BACK TO TOP ↑</a>
      </footer>

      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close"
            >
              <X />
            </button>
            <span className="eyebrow">EARLY ACCESS</span>
            <h2>GET ON THE LIST<span>.</span></h2>
            <p>
              Be first to know about the next drop of{" "}
              <strong>{selectedProduct.name}</strong>.
            </p>

            <form onSubmit={joinWaitlist}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button type="submit" disabled={submitting}>
                {submitting ? "JOINING..." : "JOIN WAITLIST"}
                <ArrowRight size={18} />
              </button>
            </form>

            {message && <p className="form-message">{message}</p>}
            <small>By joining, you agree to receive release updates.</small>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
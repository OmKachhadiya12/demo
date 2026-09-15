import { Check, Globe, Lock, Store, UserRound } from "lucide-react";
import { useState } from "react";

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);

  function saveSettings(event) {
    event.preventDefault();
    setSaved(true);

    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">Configuration</span>
          <h1>Settings</h1>
          <p>Manage your store profile, preferences, and administrator details.</p>
        </div>
      </div>

      <form onSubmit={saveSettings} className="admin-settings-layout">
        <aside className="admin-settings-nav">
          <a className="active" href="#store">
            <Store size={16} />
            Store profile
          </a>
          <a href="#account">
            <UserRound size={16} />
            Admin account
          </a>
          <a href="#shipping">
            <Globe size={16} />
            Shipping
          </a>
          <a href="#security">
            <Lock size={16} />
            Security
          </a>
        </aside>

        <div className="admin-settings-content">
          <section className="admin-settings-card" id="store">
            <div className="admin-settings-card-heading">
              <div>
                <span className="admin-eyebrow">Store profile</span>
                <h2>Public store details</h2>
              </div>
            </div>

            <div className="admin-form-grid">
              <label>
                Store name
                <input defaultValue="Lustre & Co." />
              </label>

              <label>
                Support email
                <input defaultValue="hello@lustreandco.com" type="email" />
              </label>

              <label>
                Phone number
                <input defaultValue="+91 98765 43210" />
              </label>

              <label>
                Currency
                <select defaultValue="INR">
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                </select>
              </label>

              <label className="admin-form-full">
                Store description
                <textarea defaultValue="Modern imitation jewelry for everyday elegance." />
              </label>
            </div>
          </section>

          <section className="admin-settings-card" id="account">
            <div className="admin-settings-card-heading">
              <div>
                <span className="admin-eyebrow">Admin account</span>
                <h2>Personal information</h2>
              </div>
            </div>

            <div className="admin-form-grid">
              <label>
                Full name
                <input defaultValue="Tanvi Chopra" />
              </label>

              <label>
                Email address
                <input defaultValue="tanvi@lustreandco.com" type="email" />
              </label>
            </div>
          </section>

          <section className="admin-settings-card" id="shipping">
            <div className="admin-settings-card-heading">
              <div>
                <span className="admin-eyebrow">Shipping settings</span>
                <h2>Delivery preferences</h2>
              </div>
            </div>

            <div className="admin-form-grid">
              <label>
                Free shipping threshold
                <input defaultValue="1999" type="number" />
              </label>

              <label>
                Standard shipping fee
                <input defaultValue="99" type="number" />
              </label>

              <label>
                Dispatch time
                <input defaultValue="1–2 business days" />
              </label>

              <label>
                Delivery estimate
                <input defaultValue="3–5 business days" />
              </label>
            </div>
          </section>

          <button className="admin-button admin-button-dark" type="submit">
            {saved ? (
              <>
                <Check size={16} />
                Changes saved
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
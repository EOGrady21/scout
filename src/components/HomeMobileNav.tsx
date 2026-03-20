"use client";

import { useState } from "react";

const navLinks = [
  { href: "#main-page", label: "My Home" },
  { href: "#conditions", label: "Conditions" },
  { href: "#map-view", label: "Map View" },
  { href: "#add-trail-report", label: "Add a Trail Report" },
];

export default function HomeMobileNav() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);
  const toggleMenu = () => setOpen((current) => !current);

  return (
    <>
      <button
        type="button"
        className="md:hidden fixed top-[4.15rem] left-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-controls="mobile-left-drawer"
        aria-expanded={open}
        onClick={toggleMenu}
      >
        <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
      </button>

      <button
        type="button"
        className={`mobile-drawer-overlay md:hidden fixed inset-0 z-20 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Close menu overlay"
        onClick={closeMenu}
      />

      <aside
        id="mobile-left-drawer"
        className={`mobile-left-drawer md:hidden fixed top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-64 bg-[#0b6038] text-white p-4 overflow-y-auto transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav>
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors"
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

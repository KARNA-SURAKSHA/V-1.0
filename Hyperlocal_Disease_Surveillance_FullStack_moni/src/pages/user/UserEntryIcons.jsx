// ============================================================
// USER ENTRY - INLINE SVG ARTWORK
// Brand logo + the five feature icons shown on the User Portal
// entry page. Drawn as SVG so they stay crisp on every screen.
// ============================================================

// ------------------------------------------------------------
// BRAND LOGO (shield + person + leaf)
// ------------------------------------------------------------

export function BrandShield({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 72 82"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="ku-shield-stroke"
          x1="8"
          y1="4"
          x2="64"
          y2="78"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#3DB27E" />
          <stop offset="1" stopColor="#0B7A4B" />
        </linearGradient>

        <linearGradient
          id="ku-shield-fill"
          x1="36"
          y1="4"
          x2="36"
          y2="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F1F9F4" />
          <stop offset="1" stopColor="#DDF0E5" />
        </linearGradient>

        <linearGradient
          id="ku-leaf-light"
          x1="16"
          y1="44"
          x2="36"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#57C08E" />
          <stop offset="1" stopColor="#2A9D68" />
        </linearGradient>

        <linearGradient
          id="ku-leaf-dark"
          x1="38"
          y1="38"
          x2="58"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1B8F5C" />
          <stop offset="1" stopColor="#0B6E45" />
        </linearGradient>
      </defs>

      {/* Shield */}
      <path
        d="M36 4 L66 15 V38 C66 57 53 71 36 78 C19 71 6 57 6 38 V15 Z"
        fill="url(#ku-shield-fill)"
        stroke="url(#ku-shield-stroke)"
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* Person */}
      <circle cx="36" cy="26" r="7.5" fill="#0E8A57" />

      {/* Left leaf */}
      <path
        d="M35 64 C22 64 15.5 55.5 15.5 45 C27.5 45 35 51.5 35 64 Z"
        fill="url(#ku-leaf-light)"
      />

      {/* Right leaf */}
      <path
        d="M37 64 C37 48 45 38.5 58 36.5 C59.5 51 52 62.5 37 64 Z"
        fill="url(#ku-leaf-dark)"
      />

      {/* Body / stem */}
      <path
        d="M33 40 C33 36.2 39 36.2 39 40 V64 H33 Z"
        fill="#0E8A57"
      />
    </svg>
  );
}


// ------------------------------------------------------------
// FEATURE ICONS (44 x 44 viewBox)
// ------------------------------------------------------------

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <rect x="7" y="8" width="30" height="30" rx="4.5" fill="#1E8B5A" />
      <rect x="13" y="4" width="3.4" height="9" rx="1.7" fill="#1E8B5A" />
      <rect x="27.6" y="4" width="3.4" height="9" rx="1.7" fill="#1E8B5A" />
      <rect x="11" y="17" width="22" height="16" rx="1.8" fill="#F4FBF7" />
      <rect x="13.5" y="19.5" width="4.5" height="2.4" rx="1" fill="#1E8B5A" />
      <rect x="20" y="19.5" width="10.5" height="2.4" rx="1" fill="#1E8B5A" />
      <rect x="13.5" y="24" width="4.5" height="2.4" rx="1" fill="#1E8B5A" />
      <rect x="20" y="24" width="10.5" height="2.4" rx="1" fill="#1E8B5A" />
      <rect x="13.5" y="28.5" width="4.5" height="2.4" rx="1" fill="#1E8B5A" />
      <rect x="20" y="28.5" width="6" height="2.4" rx="1" fill="#1E8B5A" />
    </svg>
  );
}


export function MapPinIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      {/* folded map */}
      <path d="M5 20 L15 17 V38 L5 41 Z" fill="#F0D98A" />
      <path d="M15 17 L29 20 V41 L15 38 Z" fill="#8ED3B5" />
      <path d="M29 20 L39 17 V38 L29 41 Z" fill="#7FC3DD" />
      <path
        d="M5 20 L15 17 L29 20 L39 17 V38 L29 41 L15 38 L5 41 Z"
        stroke="#1E8B5A"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* pin */}
      <path
        d="M22 3 C16.8 3 13.2 6.9 13.2 11.6 C13.2 17.5 22 26 22 26 C22 26 30.8 17.5 30.8 11.6 C30.8 6.9 27.2 3 22 3 Z"
        fill="#1B7F97"
      />
      <circle cx="22" cy="11.5" r="3.6" fill="#F4FBFD" />
    </svg>
  );
}


export function ShieldBellIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="ku-shield-bell"
          x1="22"
          y1="3"
          x2="22"
          y2="41"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#7C82F0" />
          <stop offset="1" stopColor="#5459D2" />
        </linearGradient>
      </defs>

      <path
        d="M22 3 L38 9 V21 C38 30.5 31.5 37.5 22 41 C12.5 37.5 6 30.5 6 21 V9 Z"
        fill="url(#ku-shield-bell)"
        stroke="#4F54C9"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* bell */}
      <path
        d="M22 12.5 C18.3 12.5 16.2 15.2 16.2 18.6 V22.4 L14.4 25.4 H29.6 L27.8 22.4 V18.6 C27.8 15.2 25.7 12.5 22 12.5 Z"
        fill="#FFFFFF"
      />
      <path
        d="M19.6 27 C19.9 28.4 20.8 29.2 22 29.2 C23.2 29.2 24.1 28.4 24.4 27 Z"
        fill="#FFFFFF"
      />
      <circle cx="22" cy="11.6" r="1.3" fill="#FFFFFF" />
    </svg>
  );
}


export function AssistantIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      {/* antenna */}
      <line x1="19" y1="9" x2="19" y2="15" stroke="#1E78B0" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="19" cy="7.5" r="2.6" fill="#1E78B0" />

      {/* ears */}
      <rect x="4" y="22" width="4" height="9" rx="2" fill="#1E78B0" />
      <rect x="30" y="22" width="4" height="9" rx="2" fill="#1E78B0" />

      {/* head */}
      <rect x="7" y="14.5" width="26" height="23" rx="9" fill="#1E78B0" />
      <rect x="10" y="17.5" width="20" height="17" rx="6.5" fill="#F4FAFD" />

      {/* face */}
      <circle cx="15.8" cy="25" r="2" fill="#155E8C" />
      <circle cx="24.2" cy="25" r="2" fill="#155E8C" />
      <path
        d="M16 29.6 C17.6 31.6 22.4 31.6 24 29.6"
        stroke="#155E8C"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* chat bubble */}
      <path
        d="M27 7.5 C27 5.8 28.3 4.6 30 4.6 H37.6 C39.3 4.6 40.6 5.8 40.6 7.5 V11.5 C40.6 13.2 39.3 14.4 37.6 14.4 H33.4 L30 17 V14.4 C28.3 14.4 27 13.2 27 11.5 Z"
        fill="#56B7D9"
      />
      <circle cx="31.1" cy="9.5" r="1.1" fill="#FFFFFF" />
      <circle cx="33.8" cy="9.5" r="1.1" fill="#FFFFFF" />
      <circle cx="36.5" cy="9.5" r="1.1" fill="#FFFFFF" />
    </svg>
  );
}


export function HomeReliefIcon() {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      {/* roof */}
      <path
        d="M22 5 L41 21 H36.4 L22 9 L7.6 21 H3 Z"
        fill="#1E8B5A"
        stroke="#1E8B5A"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* body */}
      <path
        d="M9 21 L22 10.4 L35 21 V38 C35 39.1 34.1 40 33 40 H11 C9.9 40 9 39.1 9 38 Z"
        fill="#1E8B5A"
      />
      {/* door */}
      <path
        d="M18 40 V33.5 C18 32.7 18.7 32 19.5 32 H24.5 C25.3 32 26 32.7 26 33.5 V40 Z"
        fill="#DFF3E8"
        opacity="0.55"
      />
      {/* plus */}
      <rect x="20.2" y="17" width="3.6" height="11" rx="1" fill="#FFFFFF" />
      <rect x="16.5" y="20.7" width="11" height="3.6" rx="1" fill="#FFFFFF" />
    </svg>
  );
}


// ------------------------------------------------------------
// DISTRICT FIELD ICON (region outline, used inside the select)
// ------------------------------------------------------------

export function DistrictIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.6 8.6 L6.6 6.2 L9.8 6.9 L12.4 4.5 L16 6 L19.6 5.4 L20.6 9.2 L18.8 11.6 L20.6 15 L17.4 18.2 L14 17.2 L11.4 20 L7.8 18.4 L5.6 19.4 L4.6 15.4 L6 12.6 Z" />
    </svg>
  );
}
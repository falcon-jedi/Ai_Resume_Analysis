'use client';

export function DangerZoneSection() {
  return (
    <div
      id="danger"
      className="rounded-xl p-8"
      style={{ background: 'rgba(255,218,214,0.18)', border: '1px solid #fca5a5' }}
    >
      <h3
        className="text-[24px] leading-[32px] font-semibold text-[#ba1a1a] mb-4"
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        Archive &amp; Disposal
      </h3>
      <p
        className="text-[15px] text-[#564240] mb-8 max-w-xl"
        style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
      >
        These actions are permanent. Once your account or history is deleted, it cannot be
        recovered. Please handle with absolute care.
      </p>
      <div className="flex flex-wrap gap-4">
        <button
          className="px-6 py-3 bg-white border border-[#ddc0bd] text-[#564240] rounded-lg text-[14px] font-semibold hover:bg-[#fff0ed] transition-all"
          style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
          onClick={() => alert('Sign out everywhere (placeholder)')}
        >
          Sign Out Everywhere
        </button>
        <button
          className="px-6 py-3 border border-[#ba1a1a] text-[#ba1a1a] rounded-lg text-[14px] font-semibold hover:bg-[#ba1a1a] hover:text-white transition-all"
          style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
          onClick={() => alert('Delete AI history (placeholder)')}
        >
          Delete AI Conversation History
        </button>
        <button
          className="px-6 py-3 bg-[#ba1a1a] text-white rounded-lg text-[14px] font-semibold hover:opacity-90 shadow-sm transition-all"
          style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}
          onClick={() => {
            if (confirm('Are you sure? This cannot be undone.')) {
              alert('Account deletion (placeholder)');
            }
          }}
        >
          Terminate Account
        </button>
      </div>
    </div>
  );
}

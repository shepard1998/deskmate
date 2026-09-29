/** A decorative pencil resting by the sheet. */
export function Pencil({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none flex h-4 w-[280px] drop-shadow-[0_6px_5px_rgb(0_0_0/0.35)] ${className}`}
    >
      <div className="w-6 rounded-l bg-[#e8a0a8]" />
      <div className="w-3.5 bg-[#c0c4c9]" />
      <div className="grow bg-[linear-gradient(180deg,#f6c94c_0%,#f6c94c_50%,#e0ad2c_50%,#e0ad2c_100%)]" />
      <div className="h-0 w-0 border-y-8 border-l-[28px] border-y-transparent border-l-[#e8c9a0]" />
    </div>
  );
}

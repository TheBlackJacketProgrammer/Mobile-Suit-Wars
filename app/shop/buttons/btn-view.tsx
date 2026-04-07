"use client";

export default function BtnView({ onView }: { onView: () => void }) {
  return (
    <button type="button" className="btn-secondary" onClick={onView}>
      View
    </button>
  );
}

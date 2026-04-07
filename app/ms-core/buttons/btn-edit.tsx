"use client";

export default function BtnEdit({ onEdit }: { onEdit: () => void }) {
  return (
    <button type="button" className="btn-secondary" onClick={onEdit}>
      Edit
    </button>
  );
}

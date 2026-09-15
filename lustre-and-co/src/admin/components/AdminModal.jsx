import { X } from "lucide-react";

export default function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  footer
}) {
  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" onMouseDown={onClose}>
      <div
        className="admin-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-modal-header">
          <div>
            <span className="admin-eyebrow">Lustre &amp; Co. admin</span>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>

          <button
            className="admin-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        <div className="admin-modal-body">{children}</div>

        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
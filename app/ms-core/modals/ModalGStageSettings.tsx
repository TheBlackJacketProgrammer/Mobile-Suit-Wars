"use client";

export default function ModalGStageSettings() {

  function handleCloseModal() {
    document.getElementById("modalGStageSettings")?.classList.remove("flex");
    document.getElementById("modalGStageSettings")?.classList.remove("justify-start");
    document.getElementById("modalGStageSettings")?.classList.remove("items-center");
    document.getElementById("modalGStageSettings")?.classList.remove("flex-col");
    document.getElementById("modalGStageSettings")?.classList.add("hidden");
  }
  
  return (
    <>
      <div id="modalGStageSettings" className="modal hidden">
        <div className="modal-dialog-box">
          <div className="modal-header">
            <h4 className="text-3-dark">G-Stage Settings</h4>
            <button type="button" className="btn-close text-3-dark" onClick={handleCloseModal}>
              <span className="sr-only">Close</span>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>G-Stage settings will be implemented here.</p>
          </div>
        </div>
      </div>
    </>
  );
}

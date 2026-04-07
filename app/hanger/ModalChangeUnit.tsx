"use client";

import TableFormContainer from "./TableFormContainer";

export default function ModalChangeUnit() {

  function handleCloseModal() {
    document.getElementById("modalChangeUnit")?.classList.remove("flex");
    document.getElementById("modalChangeUnit")?.classList.remove("justify-start");
    document.getElementById("modalChangeUnit")?.classList.remove("items-center");
    document.getElementById("modalChangeUnit")?.classList.remove("flex-col");
    document.getElementById("modalChangeUnit")?.classList.add("hidden");
  }
  
  return (
    <>
      <div id="modalChangeUnit" className="modal hidden">
        <div className="modal-dialog-box">
          <div className="modal-header">
            <h4 className="text-3-dark">Change Unit</h4>
            <button type="button" className="btn-close text-3-dark" onClick={handleCloseModal}>
              <span className="sr-only">Close</span>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <TableFormContainer />
          </div>
        </div>
      </div>
    </>
  );
}

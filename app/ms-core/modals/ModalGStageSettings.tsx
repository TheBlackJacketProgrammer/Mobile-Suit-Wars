import BtnCloseModal from "../buttons/btn-close-modal";

export default function ModalGStageSettings() {

  return (
    <>
      <div id="modalGStageSettings" className="modal hidden">
        <div className="modal-dialog-box">
          <div className="modal-header">
            <h4 className="text-3-dark">G-Stage Settings</h4>
            <BtnCloseModal />
          </div>
          <div className="modal-body">
            <p>G-Stage settings will be implemented here.</p>
          </div>
        </div>
      </div>
    </>
  );
}

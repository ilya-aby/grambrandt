export function createModal(content) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
      <div class="modal-content">
          ${content}
      </div>
  `;

  // Close modal if clicked on modal or any link inside modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.tagName === 'A') {
      // Dispatch a 'close' event
      const closeEvent = new Event('close');
      modal.dispatchEvent(closeEvent);
      
      modal.remove();
    }
  });

  document.body.appendChild(modal);
  return modal;
}
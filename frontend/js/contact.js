const contactForm = document.querySelector('[data-contact-form]');
const contactStatus = document.querySelector('[data-contact-status]');
const serviceSelect = document.querySelector('[data-service-select]');
const canvasSizeGroup = document.getElementById('canvas-size-group');

// Handle canvas size selector visibility
if (serviceSelect && canvasSizeGroup) {
  serviceSelect.addEventListener('change', (event) => {
    if (event.target.value === 'canvas-paintings') {
      canvasSizeGroup.style.display = 'block';
    } else {
      canvasSizeGroup.style.display = 'none';
    }
  });
}

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(contactForm).entries());

   // WhatsApp message formatting

const waNumber = '918275223989';

const referenceInput =
  document.getElementById('reference');

let imageText = '';

if (
  referenceInput &&
  referenceInput.files.length > 0
) {

  imageText =
    `Reference Images Selected: ${referenceInput.files.length} image(s)\n`;

}

const waMessage =
  `Hello Rachanatmak,\n\n` +

  `Name: ${formData.name}\n` +

  `Phone: ${formData.phone || 'N/A'}\n` +

  `City: ${formData.city || 'N/A'}\n` +

  `Service: ${formData.service || 'N/A'}\n` +

  `Canvas Size: ${formData['canvas-size'] || 'N/A'}\n\n` +

  `${imageText}\n` +

  `Project Details:\n${formData.message}`;


// Open WhatsApp

const waUrl =
  `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

window.open(
  waUrl,
  '_blank',
  'noopener'
);

    contactStatus.textContent = 'Opening WhatsApp...';
  });
}


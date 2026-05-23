const contactForm = document.querySelector('[data-contact-form]');
const contactStatus = document.querySelector('[data-contact-status]');
const serviceSelect = document.querySelector('[data-service-select]');
const canvasSizeGroup = document.getElementById('canvas-size-group');
const isGithubPages = window.location.hostname.endsWith('github.io');

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

    if (isGithubPages) {
      // For demo purposes, open email client
      const formData = Object.fromEntries(new FormData(contactForm).entries());
      const emailBody = `Name: ${formData.name}%0DEmail: ${formData.email}%0DPhone: ${formData.phone}%0DService: ${formData.service}%0DCanvas Size: ${formData['canvas-size'] || 'N/A'}%0D%0DMessage:%0D${formData.message}`;
      window.location.href = `mailto:rachanashirkande28@gmail.com?subject=Contact Form Submission from ${formData.name}&body=${emailBody}`;
      contactStatus.textContent = 'Opening email client...';
      return;
    }

    contactStatus.textContent = 'Sending...';

    const payload = Object.fromEntries(new FormData(contactForm).entries());

    try {
      const response = await fetch('api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Message failed.');
      }

      contactForm.reset();
      if (canvasSizeGroup) canvasSizeGroup.style.display = 'none';
      contactStatus.textContent = 'Thank you. Your message has been sent.';
    } catch (error) {
      contactStatus.textContent = error.message;
    }
  });
}


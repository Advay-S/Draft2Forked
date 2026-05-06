const adminForm = document.querySelector('[data-admin-form]');
const adminStatus = document.querySelector('[data-admin-status]');
const adminWorks = document.querySelector('[data-admin-works]');

window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('is-loaded');
  loadAdminWorks();
});

if (adminForm) {
  adminForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    adminStatus.textContent = 'Uploading image to Cloudinary...';

    try {
      const response = await fetch('/api/works', {
        method: 'POST',
        body: new FormData(adminForm)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed.');
      }

      adminForm.reset();
      adminStatus.textContent = 'Artwork uploaded.';
      loadAdminWorks();
    } catch (error) {
      adminStatus.textContent = error.message;
    }
  });
}

async function loadAdminWorks() {
  try {
    const response = await fetch('/api/works');
    const works = await response.json();

    if (!response.ok) {
      throw new Error('Could not load artworks.');
    }

    renderAdminWorks(works);
  } catch (error) {
    adminWorks.innerHTML = '<p class="empty-state">Artworks could not be loaded.</p>';
  }
}

function renderAdminWorks(works) {
  if (!works.length) {
    adminWorks.innerHTML = '<p class="empty-state">No artworks yet. Upload one from the form.</p>';
    return;
  }

  adminWorks.innerHTML = works
    .map(
      (work) => `
        <article class="admin-work">
          <img src="${work.imageUrl}" alt="${escapeHtml(work.title)}" loading="lazy">
          <div class="admin-work-body">
            <strong>${escapeHtml(work.title)}</strong>
            <span class="work-meta">${escapeHtml(work.category)} · ${work.year}</span>
            <button class="delete-btn" type="button" data-delete-id="${work._id}">Delete</button>
          </div>
        </article>
      `
    )
    .join('');
}

adminWorks.addEventListener('click', async (event) => {
  const deleteButton = event.target.closest('[data-delete-id]');

  if (!deleteButton) {
    return;
  }

  const confirmed = window.confirm('Delete this artwork from the site and Cloudinary?');

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/works/${deleteButton.dataset.deleteId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Delete failed.');
    }

    loadAdminWorks();
  } catch (error) {
    adminStatus.textContent = error.message;
  }
});

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

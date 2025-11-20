// ===== HELPERS =====
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// ===== NAVBAR SCROLL & BACK TO TOP =====
const navbar = $('.navbar');
const backToTop = $('#backToTop');

function onScroll() {
  if (window.scrollY > 80) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');

  backToTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
}
window.addEventListener('scroll', onScroll);
window.addEventListener('load', onScroll);

if (backToTop) backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== SMOOTH SCROLL =====
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const collapse = $('.navbar-collapse');
      if (collapse && collapse.classList.contains('show')) {
        new bootstrap.Collapse(collapse).toggle();
      }
    }
  });
});

// ===== SCROLLSPY ACTIVE LINK =====
const navLinks = $$('.nav-link');
const sections = $$('section');

function updateActiveNav() {
  const offset = window.scrollY + 140;
  let currentId = null;
  sections.forEach(sec => {
    if (sec.offsetTop <= offset && (sec.offsetTop + sec.offsetHeight) > offset) {
      currentId = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => link.classList.remove('active'));
  if (currentId) {
    const activeLink = navLinks.find(l => l.getAttribute('href') === `#${currentId}`);
    if (activeLink) activeLink.classList.add('active');
  }
}
window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// ===== FADE IN =====
const appear = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      appear.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

$$('section, footer').forEach(el => {
  el.classList.add('fade-out');
  appear.observe(el);
});

// ===== CONTACT FORM =====
const contactForm = $('#contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    await new Promise(r => setTimeout(r, 900));
    alert('Message sent successfully!');
    contactForm.reset();
    btn.textContent = 'Get a quote';
    btn.disabled = false;
  });
}

// ===== PROJECT MODAL =====
const projectModalEl = $('#projectModal');
let projectModal;
if (projectModalEl) projectModal = new bootstrap.Modal(projectModalEl);

function openProjectModal(card) {
  const title = card.dataset.name || 'Project';
  const type = card.dataset.type || '';
  const address = card.dataset.address || '';
  const price = card.dataset.price || 'Contact for price';
  const img = card.querySelector('img') ? card.querySelector('img').src : '';

  $('#projectModalTitle').textContent = title;
  $('#projectModalBody').innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <img src="${img}" class="img-fluid rounded mb-3" alt="${title}">
      </div>
      <div class="col-md-6">
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Price:</strong> ${price}</p>
        <p>Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <a href="#contact" class="btn btn-primary mt-2">Contact about this project</a>
      </div>
    </div>
  `;
  projectModal.show();
}

// Attach click event for project cards
function attachProjectButtons(context = document) {
  $$(context.querySelectorAll ? '.view-details' : '.view-details').forEach(btn => {
    btn.removeEventListener?.('click', btn._listener);
    const listener = e => {
      e.preventDefault();
      const card = btn.closest('.project-card');
      if (card) openProjectModal(card);
    };
    btn.addEventListener('click', listener);
    btn._listener = listener;
  });
}
attachProjectButtons(document);

// ===== LOAD MORE PROJECTS =====
const loadMoreBtn = $('#loadMore');
const projectsRow = $('#projectsRow');

if (loadMoreBtn && projectsRow) {
  loadMoreBtn.addEventListener('click', async () => {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch(`https://source.unsplash.com/random/800x600?house&sig=${Date.now()+i}`);
        const imgUrl = res.url;
        const col = document.createElement('div');
        col.className = 'col-sm-6 col-md-4 col-lg-3 project-col';
        const idx = Math.floor(Math.random() * 1000);
        col.innerHTML = `
          <div class="card project-card shadow-sm" data-name="Dynamic #${idx}" data-type="Modern" data-address="Loaded Address" data-price="$${Math.floor(Math.random()*900+100)}k">
            <img src="${imgUrl}" class="card-img-top" alt="Dynamic">
            <div class="card-body">
              <h6 class="card-title">Dynamic Design #${idx}</h6>
              <p class="card-sub">Loaded via Unsplash API</p>
              <p class="card-price">$${Math.floor(Math.random()*900+100)}k</p>
              <a href="#" class="btn btn-outline-primary btn-sm view-details">View Details</a>
            </div>
          </div>
        `;
        projectsRow.appendChild(col);
        attachProjectButtons(col);
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.warn('Failed to load image', err);
      }
    }
    loadMoreBtn.textContent = '✨ Load More Projects';
    loadMoreBtn.disabled = false;
  });
}

// ===== FILTER & SEARCH =====
const searchInput = $('#searchInput');
const filterType = $('#filterType');

function filterProjects() {
  const search = searchInput.value.toLowerCase();
  const type = filterType.value;
  $$('.project-card').forEach(card => {
    const name = card.dataset.name.toLowerCase();
    const t = card.dataset.type;
    if ((name.includes(search) || search === '') && (type === '' || type === t)) {
      card.closest('.project-col').style.display = 'block';
    } else {
      card.closest('.project-col').style.display = 'none';
    }
  });
}

if (searchInput) searchInput.addEventListener('input', filterProjects);
if (filterType) filterType.addEventListener('change', filterProjects);

// ===== LOGIN / REGISTER / LOGOUT =====
const loginToggle = $('#loginToggle');
const loginModalEl = $('#loginModal');
const loginCancel = $('#loginCancel');
const loginSubmit = $('#loginSubmit');
const loginUsername = $('#loginUsername');

function updateLoginStatus(user) {
  if (loginToggle) loginToggle.textContent = user ? `👋 ${user}` : 'Login';
}

loginToggle.addEventListener('click', () => {
  loginModalEl.style.display = 'flex';
});
loginCancel.addEventListener('click', () => {
  loginModalEl.style.display = 'none';
});
loginSubmit.addEventListener('click', () => {
  const user = loginUsername.value.trim();
  if (!user) return alert('Enter username');
  localStorage.setItem('lugarUser', user);
  updateLoginStatus(user);
  loginModalEl.style.display = 'none';
  alert(`Welcome back, ${user}!`);
});

// Auto populate login
const savedUser = localStorage.getItem('lugarUser');
updateLoginStatus(savedUser);

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('[data-category]')];
const search = document.querySelector('#project-search');
let category = 'All';
function updateProjects() {
  const query = (search?.value || '').trim().toLocaleLowerCase();
  let count = 0;
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  cards.forEach(card => {
    card.hidden = !(category === 'All' || card.dataset.category === category) || !card.dataset.search.toLocaleLowerCase().includes(query);
    if (!card.hidden) count++;
  });
  document.querySelector('.project-grid')?.classList.toggle('is-filtered', category !== 'All' || Boolean(query));
  const countLabel = document.querySelector('#project-count');
  if (countLabel) countLabel.textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
  const empty = document.querySelector('#no-results');
  if (empty) empty.hidden = count !== 0;
}
filterButtons.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; updateProjects(); }));
search?.addEventListener('input', updateProjects);
document.querySelector('#reset-filters')?.addEventListener('click', () => { category = 'All'; search.value = ''; updateProjects(); search.focus(); });
const dialog = document.querySelector('.lightbox');
if (dialog) {
  const pages = [...document.querySelectorAll('[data-image]')];
  const image = dialog.querySelector('img');
  const stage = dialog.querySelector('.reader-stage');
  const select = dialog.querySelector('.page-select');
  const previous = dialog.querySelector('.previous-page');
  const next = dialog.querySelector('.next-page');
  let index = 0, zoom = 1, previousFocus;
  pages.forEach((page, i) => { const option = document.createElement('option'); option.value = String(i); option.textContent = String(i + 1); select.append(option); });
  dialog.querySelector('.page-total').textContent = ` of ${pages.length}`;
  function fitImage() {
    const ratio = image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : .707;
    const width = Math.min(stage.clientWidth - 32, (stage.clientHeight - 24) * ratio);
    image.style.width = `${Math.max(80, width) * zoom}px`;
    dialog.querySelector('.zoom-reset').textContent = zoom === 1 ? 'Fit' : `${Math.round(zoom * 100)}%`;
    dialog.querySelector('.zoom-out').disabled = zoom <= 1;
    dialog.querySelector('.zoom-in').disabled = zoom >= 3;
  }
  function showPage(newIndex) {
    index = Math.max(0, Math.min(pages.length - 1, newIndex)); zoom = 1;
    image.src = pages[index].dataset.image;
    image.alt = pages[index].dataset.caption;
    dialog.querySelector('.reader-caption').textContent = pages[index].dataset.caption;
    select.value = String(index); previous.disabled = index === 0; next.disabled = index === pages.length - 1;
    stage.scrollTop = 0; stage.scrollLeft = 0; fitImage();
  }
  function openReader(newIndex, trigger) {
    previousFocus = trigger;
    dialog.showModal(); document.body.style.overflow = 'hidden'; showPage(newIndex);
  }
  image.addEventListener('load', fitImage);
  image.addEventListener('error', () => { dialog.querySelector('.reader-caption').textContent = 'This page could not load. Try another page or download the PDF.'; });
  pages.forEach((button,i) => button.addEventListener('click', () => openReader(i, button)));
  document.querySelector('.open-reader')?.addEventListener('click', event => openReader(0, event.currentTarget));
  previous.addEventListener('click', () => showPage(index - 1)); next.addEventListener('click', () => showPage(index + 1));
  select.addEventListener('change', () => showPage(Number(select.value)));
  dialog.querySelector('.zoom-in').addEventListener('click', () => { zoom = Math.min(3, zoom + .5); fitImage(); });
  dialog.querySelector('.zoom-out').addEventListener('click', () => { zoom = Math.max(1, zoom - .5); fitImage(); });
  dialog.querySelector('.zoom-reset').addEventListener('click', () => { zoom = 1; fitImage(); stage.scrollTop = 0; stage.scrollLeft = 0; });
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.target.matches('select,input')) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPage(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPage(index + 1); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; previousFocus?.focus(); });
  window.addEventListener('resize', () => { if (dialog.open) fitImage(); });
}

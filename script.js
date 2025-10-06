// Small enhancements only, no frameworks.
(function(){
  const nav = document.getElementById('nav');
  const annc = document.querySelector('.announcement');
  const close = document.querySelector('.close-annc');
  const menu = document.querySelector('.menu');
  const toggle = document.querySelector('.menu-toggle');
  const btns = document.querySelectorAll('.aud-btn');
  const panes = document.querySelectorAll('.pane');

  // Sticky shadow
  const onScroll = () => {
    if(window.scrollY > 6) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll);

  // Announcement dismiss
  close?.addEventListener('click', () => {
    annc.style.display = 'none';
  });

  // Mobile menu toggle
  toggle?.addEventListener('click', () => {
    menu.classList.toggle('open');
  });

  // Audience tabs
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panes.forEach(p => p.classList.remove('show'));
      const pane = document.getElementById(btn.dataset.pane);
      pane?.classList.add('show');
    });
  });
})();
// Minimal JS for demo purposes only
(function(){
  const toast = document.querySelector('.toast');
  const providers = document.querySelectorAll('.provider');
  const regionSel = document.getElementById('region');

  function showToast(text){
    toast.textContent = text;
    toast.hidden = false;
    setTimeout(()=> toast.hidden = true, 2200);
  }

  providers.forEach(btn => {
    btn.addEventListener('click', () => {
      const cloud = btn.dataset.cloud;
      const region = regionSel.options[regionSel.selectedIndex].text;
      showToast(`Redirecting to ${cloud.toUpperCase()} in ${region}…`);
    });
  });
})();
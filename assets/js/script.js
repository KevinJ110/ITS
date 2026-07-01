(function(){
  "use strict";

  /* ---------- Sticky header ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if(window.scrollY > 40){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', function(){
    var isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  mainNav.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.15});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters ---------- */
  var statEls = document.querySelectorAll('.stat-num');
  function animateCount(el){
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200;
    var start = null;

    function step(ts){
      if(start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(eased * target);
      el.textContent = value + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
    }
    if(reduceMotion){
      el.textContent = target + suffix;
    } else {
      requestAnimationFrame(step);
    }
  }
  if('IntersectionObserver' in window){
    var statObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, {threshold:0.5});
    statEls.forEach(function(el){ statObserver.observe(el); });
  } else {
    statEls.forEach(animateCount);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function(item){
    var btn = item.querySelector('.faq-q');
    btn.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(openItem){
        openItem.classList.remove('open');
        openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if(!isOpen){
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById('contactForm');
  var successMsg = document.getElementById('formSuccess');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var valid = true;
      var fields = [
        {id:'name', test: function(v){ return v.trim().length > 1; }},
        {id:'email', test: function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }},
        {id:'message', test: function(v){ return v.trim().length > 5; }}
      ];
      fields.forEach(function(f){
        var input = document.getElementById(f.id);
        var row = input.closest('.form-row');
        if(!f.test(input.value)){
          row.classList.add('invalid');
          valid = false;
        } else {
          row.classList.remove('invalid');
        }
      });

      if(valid){
        successMsg.classList.add('show');
        form.reset();
        // NOTE: This form currently only validates client-side.
        // Connect it to a backend or a service (e.g. Formspree, GetForm,
        // or a serverless function) to actually deliver messages,
        // since GitHub Pages cannot process form submissions on its own.
        setTimeout(function(){ successMsg.classList.remove('show'); }, 6000);
      } else {
        successMsg.classList.remove('show');
      }
    });

    form.querySelectorAll('input, textarea').forEach(function(input){
      input.addEventListener('input', function(){
        input.closest('.form-row').classList.remove('invalid');
      });
    });
  }

  /* ---------- Hero network / circuit canvas ---------- */
  var canvas = document.getElementById('networkCanvas');
  if(canvas && !reduceMotion){
    var ctx = canvas.getContext('2d');
    var hero = canvas.closest('.hero');
    var nodes = [];
    var W, H, DPR;

    function resize(){
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.offsetWidth;
      H = hero.offsetHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      var count = Math.max(24, Math.floor((W * H) / 26000));
      nodes = [];
      for(var i = 0; i < count; i++){
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.6 + 1
        });
      }
    }

    function tick(){
      ctx.clearRect(0, 0, W, H);
      var maxDist = Math.min(180, W / 5);

      for(var i = 0; i < nodes.length; i++){
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if(n.x < 0 || n.x > W) n.vx *= -1;
        if(n.y < 0 || n.y > H) n.vy *= -1;
      }

      for(i = 0; i < nodes.length; i++){
        for(var j = i + 1; j < nodes.length; j++){
          var a = nodes[i], b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if(dist < maxDist){
            ctx.strokeStyle = 'rgba(63,169,245,' + (0.22 * (1 - dist / maxDist)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for(i = 0; i < nodes.length; i++){
        var node = nodes[i];
        ctx.fillStyle = 'rgba(0,194,255,0.85)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }

    resize();
    tick();
    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
  }
})();

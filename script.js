// 工具函数
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 滚动动画
const animateOnScroll = () => {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(element => observer.observe(element));
};

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    const navbarHeight = document.querySelector('.navbar').offsetHeight;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    
    // 计算目标位置，使其在视窗中居中
    const windowHeight = window.innerHeight;
    const elementHeight = target.offsetHeight;
    const centerOffset = (windowHeight - elementHeight) / 2;
    const scrollPosition = targetPosition - navbarHeight - Math.max(0, centerOffset);

    window.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });
  });
});

// 视频播放控制
const setupVideoPlayers = () => {
  const videos = document.querySelectorAll('.video-player');
  
  videos.forEach(video => {
    const playBtn = video.querySelector('.play-btn');
    const videoElement = video.querySelector('video');
    
    playBtn?.addEventListener('click', () => {
      if (videoElement.paused) {
        videoElement.play();
        playBtn.classList.add('playing');
      } else {
        videoElement.pause();
        playBtn.classList.remove('playing');
      }
    });
  });
};

// 图片懒加载
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};

// 导航栏滚动效果
const handleNavbarScroll = () => {
  const navbar = document.querySelector('.navbar');
  const scrollThreshold = 100;

  window.addEventListener('scroll', debounce(() => {
    if (window.scrollY > scrollThreshold) {
      navbar?.classList.add('navbar-scrolled');
    } else {
      navbar?.classList.remove('navbar-scrolled');
    }
  }, 100));
};

// 团队滑块控制
const initTeamSlider = () => {
    const slider = document.querySelector('.team-slider');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    
    if (!slider || !prevBtn || !nextBtn) return;
    
    const slideWidth = slider.clientWidth / 2;
    let isDown = false;
    let startX;
    let scrollLeft;
    let isAnimating = false;
    
    // 优化的平滑滚动函数
    const smoothScroll = (target) => {
        if (isAnimating) return;
        isAnimating = true;
        
        const start = slider.scrollLeft;
        const distance = target - start;
        const duration = 1200; // 增加动画时间
        let startTime = null;
        
        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // 使用更平滑的缓动函数
            const easeOutExpo = t => (t === 1) ? 1 : 1 - Math.pow(2, -10 * t);
            
            slider.scrollLeft = start + (distance * easeOutExpo(progress));
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            } else {
                setTimeout(() => {
                    isAnimating = false;
                }, 100); // 添加小延迟，防止连续滑动太快
            }
        };
        
        requestAnimationFrame(animation);
    };
    
    // 优化的滚动处理函数
    const handleScroll = (direction) => {
        const currentScroll = slider.scrollLeft;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        let target = currentScroll + (direction * slideWidth);
        
        // 确保不会过度滚动
        target = Math.max(0, Math.min(target, maxScroll));
        
        smoothScroll(target);
    };
    
    // 触控板滚动事件优化
    let wheelTimeout;
    let lastScrollTime = 0;
    slider.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const now = Date.now();
        if (now - lastScrollTime < 200) return; // 限制滚动频率
        
        lastScrollTime = now;
        
        if (wheelTimeout) clearTimeout(wheelTimeout);
        
        wheelTimeout = setTimeout(() => {
            const direction = Math.sign(e.deltaX || e.deltaY);
            handleScroll(direction);
        }, 50);
    }, { passive: false });

    // 箭头按钮点击事件
    prevBtn.addEventListener('click', () => handleScroll(-1));
    nextBtn.addEventListener('click', () => handleScroll(1));

    // 优化的触摸事件处理
    let touchStartX = 0;
    let touchStartTime = 0;
    
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
        isDown = true;
        startX = e.touches[0].clientX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    }, { passive: true });

    slider.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.touches[0].clientX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
    }, { passive: false });

    slider.addEventListener('touchend', (e) => {
        isDown = false;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndTime = Date.now();
        
        const swipeDistance = touchStartX - touchEndX;
        const swipeTime = touchEndTime - touchStartTime;
        
        // 计算滑动速度和方向
        const velocity = Math.abs(swipeDistance) / swipeTime;
        
        if (Math.abs(swipeDistance) > 50 && velocity > 0.2) {
            const direction = Math.sign(swipeDistance);
            handleScroll(direction);
        } else {
            // 如果滑动不够快或距离不够，回弹到最近的卡片
            const currentPosition = slider.scrollLeft;
            const nearestSlide = Math.round(currentPosition / slideWidth) * slideWidth;
            smoothScroll(nearestSlide);
        }
    }, { passive: true });
};

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
  animateOnScroll();
  setupVideoPlayers();
  lazyLoadImages();
  handleNavbarScroll();
  initTeamSlider();
});
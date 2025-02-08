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

// 团队滑块控制优化
const initTeamSlider = () => {
    const slider = document.querySelector('.team-slider');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');
    
    if (!slider || !prevBtn || !nextBtn) return;
    
    const slideWidth = slider.clientWidth / 4; // 每次滚动一屏的1/4
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    
    // 滚动到指定位置的函数
    const smoothScroll = (target) => {
        const start = slider.scrollLeft;
        const distance = target - start;
        const duration = 500;
        let startTime = null;
        
        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // 使用 easeInOutQuad 缓动函数
            const easeInOutQuad = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            
            slider.scrollLeft = start + (distance * easeInOutQuad(progress));
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    };
    
    // 更新按钮状态
    const updateButtons = () => {
        prevBtn.style.opacity = slider.scrollLeft <= 0 ? '0.5' : '1';
        prevBtn.style.cursor = slider.scrollLeft <= 0 ? 'not-allowed' : 'pointer';
        
        nextBtn.style.opacity = slider.scrollLeft >= maxScroll - 1 ? '0.5' : '1';
        nextBtn.style.cursor = slider.scrollLeft >= maxScroll - 1 ? 'not-allowed' : 'pointer';
    };
    
    // 上一个
    prevBtn.addEventListener('click', () => {
        if (slider.scrollLeft <= 0) return;
        const target = Math.max(0, slider.scrollLeft - slideWidth);
        smoothScroll(target);
    });
    
    // 下一个
    nextBtn.addEventListener('click', () => {
        if (slider.scrollLeft >= maxScroll) return;
        const target = Math.min(maxScroll, slider.scrollLeft + slideWidth);
        smoothScroll(target);
    });
    
    // 监听滚动事件来更新按钮状态
    slider.addEventListener('scroll', updateButtons);
    
    // 初始化按钮状态
    updateButtons();
    
    // 处理窗口大小改变
    window.addEventListener('resize', () => {
        updateButtons();
    });
};

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
  animateOnScroll();
  setupVideoPlayers();
  lazyLoadImages();
  handleNavbarScroll();
  initTeamSlider();
});
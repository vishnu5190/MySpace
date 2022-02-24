//Header fixed

window.onscroll = function () {
    const docScrollTop = document.documentElement.scrollTop;
  
    if (window.innerWidth > 991) {
      if (docScrollTop > 100) {
        document.querySelector("header").classList.add("fixed");
      } else {
        document.querySelector("header").classList.remove("fixed");
      }
    }
  }
  
  //navbar links
  
  const navbar = document.querySelector(".navbar");
  a = navbar.querySelectorAll("a")
  
  a.forEach(function (element) {
    element.addEventListener("click", function () {
      for (let i = 0; i < a.length; i++) {
        a[i].classList.remove("active")
      }
      this.classList.add("active");
      document.querySelector(".navbar").classList.toggle("show");
    })
  })
  
  //Hamburger
  
  const hamBurger = document.querySelector(".hamburger");
  
  hamBurger.addEventListener("click", function () {
    document.querySelector(".navbar").classList.toggle("show");
  })
  
  
  
  const closeLightbox = document.querySelector(".close-lightbox");
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = lightbox.querySelector("img");
  
  lightbox.addEventListener("click", function () {
    if (event.target != lightboxImg) {
      lightbox.classList.remove("show");
      lightbox.classList.add("hide");
    }
  });
  
  closeLightbox.addEventListener("click", function () {
    lightbox.classList.remove("show");
    lightbox.classList.add("hide");
  });
  
  
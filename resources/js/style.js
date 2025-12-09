/* contest-N1 */
(function() {
  $(function() {
    $(".contest-N1[id=\'oYmhjDTROg\']").each(function() {
      const $block = $(this);
      let isMobileMenuInitialized = false;
      let isDesktopMenuInitialized = false;
      // 모바일 메뉴 초기화
      function initMobileMenu() {
        if (isMobileMenuInitialized) return;
        const $btnMomenu = $block.find(".btn-momenu");
        $btnMomenu.off("click").on("click", function() {
          if ($block.hasClass("block-active")) {
            $block.removeClass("block-active");
          } else {
            $block.addClass("block-active");
          }
          $block.find(".header-gnbitem").removeClass("item-active");
          $block.find(".header-sublist").removeAttr("style");
        });
        // header-gnbitem 클릭 이벤트
        $block.find(".header-gnbitem").each(function() {
          const $this = $(this);
          const $thisLink = $this.find(".header-gnblink");
          const $sublist = $this.find(".header-sublist");
          if ($sublist.length) {
            $thisLink.off("click").on("click", function(event) {
              event.preventDefault();
              const $clickedItem = $(this).parents(".header-gnbitem");
              if (!$clickedItem.hasClass("item-active")) {
                $block.find(".header-gnbitem").removeClass("item-active");
                $block.find(".header-sublist").stop().slideUp(300);
              }
              $clickedItem.toggleClass("item-active");
              $sublist.stop().slideToggle(300);
            });
          }
        });
        isMobileMenuInitialized = true;
      }
      // 데스크탑 메뉴 초기화
      function initDesktopMenu() {
        if (isDesktopMenuInitialized) return;
        $block.find(".header-gnbitem").each(function() {
          const $this = $(this);
          const $thisLink = $this.find(".header-gnblink");
          $thisLink.off("click");
        });
        isDesktopMenuInitialized = true;
      }
      // 해상도에 따른 메뉴 처리
      function handleResize() {
        if (window.innerWidth <= 992) {
          if (!isMobileMenuInitialized) {
            initMobileMenu();
          }
          isDesktopMenuInitialized = false;
        } else {
          if (!isDesktopMenuInitialized) {
            initDesktopMenu();
          }
          isMobileMenuInitialized = false;
        }
      }
      // 스크롤 시 메뉴 처리
      function handleScroll() {
        const $headerTop = $block.find(".header-top");
        if ($headerTop.length) {
          $block.addClass("top-menu-active");
        }
        if ($(window).scrollTop() === 0) {
          $block.addClass("header-top-active");
        }
        $(window).scroll(function() {
          if ($(window).scrollTop() > 0) {
            $block.removeClass("header-top-active");
          } else {
            $block.addClass("header-top-active");
          }
        });
      }
      handleScroll();
      // 전체 메뉴 열기/닫기 처리
      function handleFullMenu() {
        $block.find(".btn-allmenu").on("click", function() {
          $block.find(".header-fullmenu").addClass("fullmenu-active");
        });
        $block.find(".fullmenu-close").on("click", function() {
          $block.find(".header-fullmenu").removeClass("fullmenu-active");
        });
        $block.find(".fullmenu-gnbitem").each(function() {
          const $this = $(this);
          $this.on("mouseover", function() {
            if (window.innerWidth > 992) {
              $this.find(".fullmenu-gnblink").addClass("on");
            }
          });
          $this.on("mouseout", function() {
            if (window.innerWidth > 992) {
              $this.find(".fullmenu-gnblink").removeClass("on");
            }
          });
        });
      }
      handleFullMenu();
      // 리사이즈 시마다 메뉴 동작 초기화
      $(window).on("resize", function() {
        handleResize();
      });
      handleResize();
    });
  });
})();
/* contest-N10 */
(function() {
  $(function() {
    $(".contest-N10[id=\'fWMhJdTS20\']").each(function() {
      const $block = $(this);
      const wrapEl = $block.find(".text-wrap").get(0);
      const textEl = $block.find(".text-wrap span").get(0);
      let gsapTween = null;

      function setupRolling() {
        // 기존 복제 제거
        while (wrapEl.children.length > 1) {
          wrapEl.removeChild(wrapEl.lastChild);
        }
        // 텍스트 복제
        const cloneCount = 30;
        for (let i = 0; i < cloneCount; i++) {
          wrapEl.appendChild(textEl.cloneNode(true));
        }
        // gsap 애니메이션 제거
        if (gsapTween) gsapTween.kill();
        // requestAnimationFrame으로 렌더 후 실행 보장
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const totalWidth = wrapEl.scrollWidth;
            if (totalWidth === 0) {
              // fallback으로 setTimeout
              setTimeout(setupRolling, 200);
              return;
            }
            const baseSpeed = 1000;
            const baseDuration = 10;
            const duration = Math.max(
              (totalWidth / baseSpeed) * baseDuration,
              3
            );
            gsapTween = gsap.to(wrapEl, {
              xPercent: -50,
              duration: duration,
              ease: "none",
              repeat: -1,
            });
          });
        });
      }
      setupRolling(); // 첫 실행
      // 내용 변경 감지
      let debounceTimer = null;
      const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(setupRolling, 500);
      });
      observer.observe(textEl, {
        characterData: true,
        childList: true,
        subtree: true,
      });
    });
  });
})();
/* contest-N4 */
(function() {
  $(function() {
    $(".contest-N4[id=\'zdmHjdts7j\']").each(function() {
      const $block = $(this);
      const $footer = $(".footer-container").length ?
        $(".footer-container").parent() :
        $(".th-layout-footer").length ?
        $(".th-layout-footer") :
        $("footer");
      // position 업데이트 함수
      function updatePosition() {
        const scrollPosition = $(window).scrollTop();
        const windowHeight = $(window).height();
        const footerOffset = $footer.offset().top;
        const stopPosition = footerOffset - windowHeight;
        if (scrollPosition > stopPosition) {
          $block.css({
            position: "absolute",
            bottom: $footer.outerHeight() + 20 + "px",
          });
        } else {
          $block.css({
            position: "fixed",
            bottom: "20px",
          });
        }
      }
      // scroll과 resize 이벤트 바인딩
      $(window).on("scroll resize", updatePosition);
      // 초기 위치 설정
      updatePosition();
    });
  });
})();
/* contest-N7 */
(function() {
  $(function() {
    $(".contest-N7[id=\'BSmHjDTsp9\']").each(function() {
      const $block = $(this);
      const mm = gsap.matchMedia();
      // 미디어 쿼리를 사용하여 특정 화면 너비 이상에서만 실행
      mm.add("(min-width: 993px)", () => {
        $block.find(".list li").each(function() {
          const $el = $(this);
          // 텍스트 애니메이션
          gsap.timeline({
            scrollTrigger: {
              trigger: $el[0],
              start: "0% 50%",
              end: "0% 30%",
              onEnter: () => {
                $el.addClass("active");
              },
              onLeaveBack: () => {
                $el.removeClass("active");
              },
            }
          });
        });
      });
    });
  });
})();

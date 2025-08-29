(function($) {
    "use strict";

    function preloader() {
        $('#preloader').delay(0).fadeOut()
    };
    $(window).on('load', function() {
        preloader()
    });
    $("[data-background]").each(function() {
        $(this).css("background-image", "url(" + $(this).attr("data-background") + ")")
    })
    $("[data-bg-color]").each(function() {
        $(this).css("background-color", $(this).attr("data-bg-color"))
    });
    $('.navigation a[href*="#"]:not([href="#"])').on("click", function() {
        console.log("click");
        if (location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=" + this.hash.slice(1) + "]');
            if (target.length) {
                if ($(window).width() < 768) {
                    $("html, body").animate({
                        scrollTop: target.offset().top - 30
                    }, 1000, "easeInOutExpo")
                } else {
                    $("html, body").animate({
                        scrollTop: target.offset().top - 50
                    }, 1000, "easeInOutExpo")
                }
                return !1
            }
        }
    });
    if ($('.tgmobile__menu-outer li.menu-item-has-children ul').length) {
        $('.tgmobile__menu-outer .navigation li.menu-item-has-children').append('<div class="dropdown-btn"><span class="plus-line"></span></div>')
    }
    if ($('.tgmobile__menu').length) {
        $('.tgmobile__menu li.menu-item-has-children .dropdown-btn').on('click', function() {
            $(this).toggleClass('open');
            $(this).prev('ul').slideToggle(300)
        });
        $('.mobile-nav-toggler').on('click', function() {
            $('body').addClass('mobile-menu-visible')
        });
        $('.tgmobile__menu-backdrop, .tgmobile__menu .close-btn, .tgmobile__menu .navigation li a').on('click', function() {
            $('body').removeClass('mobile-menu-visible')
        })
    }
    $(window).on('scroll', function() {
        var scroll = $(window).scrollTop();
        if (scroll < 245) {
            $("#sticky-header").removeClass("sticky-menu");
            $('.scroll-to-target').removeClass('open')
        } else {
            $("#sticky-header").addClass("sticky-menu");
            $('.scroll-to-target').addClass('open')
        }
    });
    if ($('.scroll-to-target').length) {
        $(".scroll-to-target").on('click', function() {
            var target = $(this).attr('data-target');
            $('html, body').animate({
                scrollTop: $(target).offset().top - 50
            }, 1000)
        })
    }
})(jQuery);
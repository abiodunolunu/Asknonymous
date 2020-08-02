const menu = document.querySelector('.menu-icon')
const navList = document.getElementById('nav-list')
const menuSpans = Array.from(menu.children)

function toggle() {

    if (navList.classList.contains('open')) {
        navList.classList.remove('open')
        menuSpans.forEach(span => {
            span.classList.remove('open')
        })
    } else if (!navList.classList.contains('open')) {
        navList.classList.add('open')
        menuSpans.forEach(span => {
            span.classList.add('open')
        })
    }

}
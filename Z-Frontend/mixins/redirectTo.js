export function redirectTo(url) {
    if(window.location.pathname === url) return;
    let el = document.createElement('a');
    el.href = url;
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
}

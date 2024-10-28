let main_content = document.querySelectorAll(".scrolling-animate");

window.onscroll = () => {
    main_content.forEach(content => {
        let top = window.scrollY;
        let offset = content.offsetTop;
        let height = content.offsetHeight;

        if (top >= offset - window.innerHeight*0.6 && top < offset + height - window.innerHeight*0.24) {
            content.classList.remove("deactive");
            content.classList.add("active");
        } else if (top <= offset - window.innerHeight*0.4) {
            content.classList.remove("active");
            content.classList.add("deactive");
        }
    })
}
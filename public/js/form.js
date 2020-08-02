const holdUp = () => {
    const labels = document.querySelectorAll('label')
    labels.forEach(label => {
        const input = label.previousElementSibling
        input.addEventListener('change', function () {
            if (input.value !== "") {
                label.classList.add('up')
            } else {
                label.classList.remove('up')
            }
        })
    })
}

holdUp()
let addButton = document.querySelector('.add-item__button');
let dropdown = document.querySelector('.add-item__dropdown')

addButton.addEventListener('click', () => {
    if (dropdown.classList.contains('add-item__dropdown--hidden')) {
        dropdown.classList.add('add-item__dropdown--expanded')
        dropdown.classList.remove('add-item__dropdown--hidden')
    } else {
        dropdown.classList.remove('add-item__dropdown--expanded')
        dropdown.classList.add('add-item__dropdown--hidden')
    }
})
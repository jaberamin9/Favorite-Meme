const htmlElement = document.documentElement;
const themeList = document.getElementById('theme-list');
const selectedThemeName = document.getElementById('selected-theme-name');
const memeContainer = document.getElementById('meme-container');
const apiKeySaveBtn = document.getElementById('api-key-save-btn');
const favoriteMemeList = document.getElementById('favorite-meme-list');
const favoriteMemeListMobail = document.getElementById('favorite-meme-list-mobail');
const memeSearch = document.getElementById('meme-search');
const favoriteMemesSearch = document.getElementById('favorite-memes-search');
const favoriteMemesSearchMobail = document.getElementById('favorite-memes-search-mobail');
const customizeBtn = document.getElementById('customize-btn');


const errorSearch = document.getElementById('error-search');

let timeoutId;

const themes = [
    { id: 0, theme: "default" },
    { id: 1, theme: "light" },
    { id: 2, theme: "dark" },
    { id: 3, theme: "cupcake" },
    { id: 4, theme: "bumblebee" },
    { id: 5, theme: "emerald" },
    { id: 6, theme: "corporate" },
    { id: 7, theme: "synthwave" },
    { id: 8, theme: "retro" },
    { id: 9, theme: "cyberpunk" },
    { id: 10, theme: "valentine" },
    { id: 11, theme: "halloween" },
    { id: 12, theme: "garden" },
    { id: 13, theme: "forest" },
    { id: 14, theme: "aqua" },
    { id: 15, theme: "lofi" },
    { id: 16, theme: "pastel" },
    { id: 17, theme: "fantasy" },
    { id: 18, theme: "wireframe" },
    { id: 19, theme: "black" },
    { id: 20, theme: "luxury" },
    { id: 21, theme: "dracula" },
    { id: 22, theme: "cmyk" },
    { id: 23, theme: "autumn" },
    { id: 24, theme: "business" },
    { id: 25, theme: "acid" },
    { id: 26, theme: "lemonade" },
    { id: 27, theme: "night" },
    { id: 28, theme: "coffee" },
    { id: 29, theme: "winter" },
    { id: 30, theme: "dim" },
    { id: 31, theme: "nord" },
    { id: 32, theme: "sunset" },
];


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const themeParam = urlParams.get('theme')
if (themeParam != null && themes.find((item) => themeParam === item.theme)) {
    saveTheme(themeParam);
}

themes.map((theme) => {
    const liNode = document.createElement('li');
    const inputNode = document.createElement('input');
    inputNode.setAttribute('type', 'radio');
    inputNode.setAttribute('name', 'theme-dropdown');
    inputNode.setAttribute('id', `theme-${theme.id}`);
    inputNode.setAttribute('class', 'theme-controller m-1 btn text-base-content btn-sm btn-block rounded-md btn-ghost justify-start');
    inputNode.setAttribute('onclick', `saveTheme('${theme.theme}')`);
    inputNode.setAttribute('aria-label', theme.theme.charAt(0).toUpperCase() + theme.theme.slice(1));
    inputNode.setAttribute('value', theme.theme);
    liNode.appendChild(inputNode);
    themeList.appendChild(liNode)
});


const currentTheme = localStorage.getItem('theme');
if (currentTheme != null) {
    const theme = themes.find((item) => currentTheme === item.theme)
    const themeElement = document.getElementById(`theme-${theme.id}`);
    themeElement.setAttribute('class', 'bg-primary theme-controller m-1 btn text-base-100 btn-sm btn-block rounded-md btn-ghost justify-start');
    htmlElement.setAttribute("data-theme", currentTheme);
    selectedThemeName.innerText = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
    updateURLParameter('theme', currentTheme)
}

const focusParam = new URL(window.location).searchParams.get('focused');
if (focusParam === 'true') {
    memeSearch.focus();
} else if (focusParam === 'false') {
    memeSearch.blur();
}


const demoParam = new URLSearchParams(window.location.search).get('demo')

if (localStorage.getItem('api-key') == null && demoParam != 'true') {
    memeContainer.innerHTML = '';

    const divNode = document.createElement('div');
    divNode.setAttribute('class', 'main-text flex flex-col justify-center gap-4 align-middle p-5');

    const pNode = document.createElement('p');
    const pTextNode = document.createTextNode("We could not find the API key. Please provide the API key and enjoy the meme.");
    pNode.appendChild(pTextNode);
    divNode.appendChild(pNode);

    const buttonNode = document.createElement('button');
    buttonNode.setAttribute('class', 'btn btn-primary ');

    const buttonTextNode = document.createTextNode("Provide API key");
    buttonNode.appendChild(buttonTextNode);
    buttonNode.setAttribute('onclick', "api_key_modal.showModal()");
    divNode.appendChild(buttonNode);

    memeContainer.appendChild(divNode);
} else {
    searchMemes("computer");
}

apiKeySaveBtn.addEventListener("click", () => {
    localStorage.setItem('api-key', document.getElementById('api-key-text').value);
    searchMemes("computer");
})

loadFavorite(JSON.parse(localStorage.getItem("favorite-meme")));

function saveTheme(data) {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme != null) {
        const theme = themes.find((item) => currentTheme === item.theme)
        const themeElement = document.getElementById(`theme-${theme.id}`);
        if (themeElement != null) {
            themeElement.setAttribute('class', 'theme-controller m-1 btn text-base-content btn-sm btn-block rounded-md btn-ghost justify-start');
        }
    }
    htmlElement.setAttribute("data-theme", data);
    selectedThemeName.innerText = data.charAt(0).toUpperCase() + data.slice(1);
    localStorage.setItem('theme', data);
    updateURLParameter('theme', data)
}



memeSearch.addEventListener('focus', () => {
    updateURLParameter('focused', 'true');
});

memeSearch.addEventListener('blur', () => {
    updateURLParameter('focused', 'false');
});

memeSearch.addEventListener("input", (event) => {
    const searchTerm = event.target.value.trim().toLowerCase();
    searchMemes(searchTerm);
});
function searchMemes(searchTerm) {
    clearTimeout(timeoutId);

    if (searchTerm.length >= 3) {
        errorSearch.innerText = '';
        if (localStorage.getItem('api-key') == null && demoParam != 'true') {
            api_key_modal.showModal();
            return
        }
        memeContainer.innerHTML = '';
        const loading = document.createElement('span');
        loading.setAttribute('class', 'loading loading-infinity loading-lg');
        memeContainer.appendChild(loading);

        timeoutId = setTimeout(async () => {
            const memes = await fetchMemess(searchTerm);
            memeContainer.innerHTML =
                `<div class="p-5 w-full">
                    <p class="main-text font-semibold mb-5 text-2xl">Memes Feed</p>
                    <div id="meme-list" class="grid grid-cols-3 gap-4 pb-4">
                    </div>
                </div>`;
            if (memes.memes?.length > 0) {
                displayMemes(memes);
            } else if (memes.memes?.length === 0) {
                memeContainer.innerHTML = "";
                errorMsg(memeContainer, "Sorry, we didn't find any memes.", "")
            } else {
                memeContainer.innerHTML = "";
                errorMsg(memeContainer, memes.message, memes.code)
            }
        }, 500);
    } else {
        if (searchTerm.length != 0) {
            errorSearch.innerText = 'min 3 char for search';
        } else {
            errorSearch.innerText = '';
            searchMemes("computer");
        }
    }
}
async function fetchMemess(searchTerm) {
    try {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const demoParam = urlParams.get('demo')
        let response;
        if (demoParam === "true") {
            response = await fetch("apiData.json");
        } else {
            response = await fetch(`https://api.humorapi.com/memes/search?api-key=${localStorage.getItem('api-key')}&number=6&keywords=${encodeURIComponent(searchTerm)}&media-type=image`);
        }
        if (!response.ok) {
            return await response.json();
        }
        const data = await response.json();
        return data;
    } catch (error) {
        return error;
    }
}
function displayMemes(data) {
    const memeList = document.getElementById('meme-list');
    memeList.setAttribute('class', 'grid grid-cols-1 xxs:grid-cols-2 lg:grid-cols-3 gap-4 pb-4');

    memeList.innerHTML = '';

    data.memes.forEach(meme => {
        if (meme.type.length > 6) {
            const memeItem = document.createElement('div');
            //memeItem.classList.add('meme-item', 'p-4', 'bg-white', 'dark:bg-gray-800', 'rounded-md', 'shadow-md');
            memeItem.setAttribute('class', 'relative w-auto h-[300px] bg-base-100 overflow-hidden rounded-lg shadow-lg group');

            const memeImage = document.createElement('img');
            memeImage.src = meme.url;
            memeImage.alt = "img";
            memeImage.setAttribute('referrerpolicy', 'no-referrer');
            memeItem.setAttribute('onclick', `viewImageFullScreen('${meme.url}')`);
            memeImage.setAttribute('class', 'hover:scale-105 cursor-pointer transition-all object-cover w-full h-full');
            memeItem.appendChild(memeImage);

            const divNode = document.createElement('div');
            divNode.setAttribute('class', 'absolute bottom-0 left-0 right-0 flex gap-2 items-center justify-end bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4');
            memeItem.appendChild(divNode);

            const buttonNode = document.createElement('button');
            const convertToString = JSON.stringify(meme);
            buttonNode.setAttribute('onclick', `openMemeModal(${convertToString},event)`);
            buttonNode.setAttribute('class', 'btn rounded-full');
            divNode.appendChild(buttonNode);

            const icon = document.createElement('i');
            icon.setAttribute('class', 'fa-regular fa-heart');
            buttonNode.appendChild(icon);

            const downloadButtonNode = document.createElement('button');
            downloadButtonNode.setAttribute('onclick', `downloadImage('${meme.url}',event)`);
            downloadButtonNode.setAttribute('class', 'btn rounded-full');
            divNode.appendChild(downloadButtonNode);

            const icon2 = document.createElement('i');
            icon2.setAttribute('class', 'fa-regular fa-floppy-disk');
            downloadButtonNode.appendChild(icon2);

            memeList.appendChild(memeItem);
        }
    });
}
function errorMsg(memeList, msg, code) {
    const divNode = document.createElement('div');
    divNode.setAttribute('class', 'w-full flex flex-col justify-center items-center p-5');

    const h1Node = document.createElement('h1');
    h1Node.setAttribute('class', 'text-5xl text-error mb-4');
    divNode.appendChild(h1Node);

    const codeTextNode = document.createTextNode(code);
    h1Node.appendChild(codeTextNode);

    const pNode = document.createElement('p');
    pNode.setAttribute('class', 'text-center main-text');
    divNode.appendChild(pNode);

    const msgTextNode = document.createTextNode(msg);
    pNode.appendChild(msgTextNode);

    if (code == 402 || code == 401) {
        const buttonNode = document.createElement('button');
        buttonNode.setAttribute('class', 'btn btn-primary mt-4');
        buttonNode.setAttribute('onclick', "api_key_modal.showModal()");
        divNode.appendChild(buttonNode);

        const buttonText = document.createTextNode("Change api key");
        buttonNode.appendChild(buttonText);
    }
    memeList.appendChild(divNode);
}
function openMemeModal(meme, e) {
    e.stopPropagation();
    const memeTitleInput = document.getElementById('meme-title-input');
    memeTitleInput.value = meme.description || '';

    const favMemeModal = document.getElementById('fav_meme_modal');

    const saveButton = document.getElementById('save-btn');
    saveButton.onclick = () => {
        meme.description = memeTitleInput.value;
        addToFavorite(meme);
    };

    favMemeModal.showModal();
}



//Favorite Memes

favoriteMemesSearch.addEventListener("input", (event) => {
    const searchTerm = event.target.value.trim().toLowerCase();

    const favoriteMemes = JSON.parse(localStorage.getItem("favorite-meme"));

    let filteredMemes = favoriteMemes.filter(meme =>
        meme.description.toLowerCase().includes(searchTerm)
    );
    loadFavorite(filteredMemes);
});
favoriteMemesSearchMobail.addEventListener("input", (event) => {
    const searchTerm = event.target.value.trim().toLowerCase();

    const favoriteMemes = JSON.parse(localStorage.getItem("favorite-meme"));

    let filteredMemes = favoriteMemes.filter(meme =>
        meme.description.toLowerCase().includes(searchTerm)
    );
    loadFavorite(filteredMemes);
});

function loadFavorite(memes) {
    if (memes != null && memes.length > 0) {
        favoriteMemeList.innerHTML = '';
        favoriteMemeListMobail.innerHTML = '';

        loadFavoriteMemeItem(memes, favoriteMemeList);
        loadFavoriteMemeItem(memes, favoriteMemeListMobail);
    } else {
        notStoreFavoriteMemeItem(favoriteMemeList);
        notStoreFavoriteMemeItem(favoriteMemeListMobail);
    }
}

function loadFavoriteMemeItem(memes, memeList) {
    memes.forEach(meme => {
        var nodeDiv = document.createElement('div');
        nodeDiv.setAttribute('class', 'side-bar-forground flex gap-2 items-center bg-base-100 rounded-md p-2');

        var nodeDiv2 = document.createElement('div');
        nodeDiv2.setAttribute('class', 'w-[100px] h-[70px] rounded-md overflow-clip');
        nodeDiv.appendChild(nodeDiv2);

        var nodeImg = document.createElement('img');
        nodeImg.setAttribute('class', 'object-cover w-full h-full cursor-pointer');
        nodeImg.alt = "img";
        nodeImg.src = meme.url;
        nodeImg.setAttribute('onclick', `viewImageFullScreen('${meme.url}')`);
        nodeImg.setAttribute('referrerpolicy', 'no-referrer');
        nodeDiv2.appendChild(nodeImg);

        var nodeDiv4 = document.createElement('div');
        nodeDiv4.setAttribute('class', 'flex gap-2 w-full items-center');
        nodeDiv.appendChild(nodeDiv4);

        var nodeH4 = document.createElement('h4');
        nodeH4.setAttribute('class', 'side-bar-text font-semibold w-full text-left text-sm line-clamp-2');
        nodeDiv4.appendChild(nodeH4);

        var nodeH4Text = document.createTextNode(limitToFirst12Words(meme.description));
        nodeH4.appendChild(nodeH4Text);

        var nodeDiv7 = document.createElement('div');
        nodeDiv7.setAttribute('class', 'flex flex-col gap-1 justify-end');
        nodeDiv4.appendChild(nodeDiv7);

        var nodeDiv8 = document.createElement('div');
        nodeDiv8.setAttribute('onclick', `downloadImage('${meme.url}',event)`);
        nodeDiv8.setAttribute('class', 'cursor-pointer side-bar-bg hover:bg-base-200 bg-base-300 w-8 h-8 rounded-full flex justify-center items-center');
        nodeDiv7.appendChild(nodeDiv8);

        var nodeI = document.createElement('i');
        nodeI.setAttribute('class', 'side-bar-text fa-regular fa-floppy-disk');
        nodeI.setAttribute('size', '12px');
        nodeDiv8.appendChild(nodeI);

        var nodeDiv10 = document.createElement('div');
        nodeDiv10.setAttribute('onclick', `deleteFavorite('${meme.id}')`);
        nodeDiv10.setAttribute('class', 'cursor-pointer side-bar-bg hover:bg-base-200 bg-base-300 w-8 h-8 rounded-full flex justify-center items-center');
        nodeDiv7.appendChild(nodeDiv10);

        var nodeI2 = document.createElement('i');
        nodeI2.setAttribute('class', 'side-bar-text fa-regular fa-trash-can');
        nodeDiv10.appendChild(nodeI2);

        memeList.appendChild(nodeDiv);
    })
}

function notStoreFavoriteMemeItem(memeList) {
    memeList.innerHTML = '';
    const pNode = document.createElement('p');
    pNode.setAttribute('class', 'side-bar-text flex items-center justify-center h-full');
    const text = document.createTextNode("you have no favorite memes");
    pNode.appendChild(text);
    memeList.appendChild(pNode);
}

function addToFavorite(meme) {
    const memesJSON = localStorage.getItem("favorite-meme");
    let memes = memesJSON ? JSON.parse(memesJSON) : [];

    const memeExists = memes.some(item => item.id === meme.id);

    if (!memeExists) {
        memes.push(meme);
        localStorage.setItem("favorite-meme", JSON.stringify(memes));
        loadFavorite(JSON.parse(localStorage.getItem("favorite-meme")));
        favoriteMemeList.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
}

function deleteFavorite(id) {
    let memes = JSON.parse(localStorage.getItem("favorite-meme"));
    const index = memes.findIndex(meme => meme.id == id);
    if (index !== -1) {
        memes.splice(index, 1);
        localStorage.setItem('favorite-meme', JSON.stringify(memes));
        loadFavorite(JSON.parse(localStorage.getItem("favorite-meme")));
    }
}

function downloadImage(imageUrl, e) {
    e.stopPropagation();
    const uniqueName = `image_${new Date().getTime()}.jpg`;
    const proxyUrl = 'https://corsproxy.io/?';
    if (imageUrl.includes(".jpeg")) {
        imageUrl = proxyUrl + encodeURIComponent(imageUrl);
    }
    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = uniqueName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error downloading image:', error));
}

function limitToFirst12Words(str) {
    const words = str.split(' ');
    const first12Words = words.slice(0, 12);
    const limitedString = first12Words.join(' ');
    return limitedString;
}

function updateURLParameter(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    history.replaceState(null, '', url.toString());
}


function viewImageFullScreen(url) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const imgSrc = url

    modalImg.src = imgSrc;
    modal.classList.add('modal-open');

    document.getElementById('closeModalButton').addEventListener('click', function () {
        modal.classList.remove('modal-open');
    });

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.classList.remove('modal-open');
        }
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            modal.classList.remove('modal-open');
        }
    });
}



//customize theme

customizeBtn.addEventListener("click", () => {
    opencustomizeModal()
})
function opencustomizeModal() {
    const customizeThemeModal = document.getElementById('customize_theme_modal');
    const colorPicker = document.getElementById('fixed')
    const closeBtn = document.getElementById('customize-close-btn')
    const reloadButton = document.getElementById('reload-btn')

    colorPicker.classList.remove('invisible');
    colorPicker.classList.add('visible');

    reloadButton.addEventListener('click', function () {
        location.reload();
    });
    closeBtn.onclick = () => {
        colorPicker.classList.remove('visible');
        colorPicker.classList.add('invisible');
    };
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            colorPicker.classList.remove('visible');
            colorPicker.classList.add('invisible');
        }
    });

    customizeThemeModal.showModal();
}
let radioBtn = 'baground';
let currentSelectedBox = -1;
const parentFixed = document.querySelector("#fixed"),
    pickerFixed = new Picker({
        parent: parentFixed,
        popup: false,
        alpha: true,
        editor: true,
        color: "orangered",
        onChange: function (color) {
            const selectedElement = document.getElementById('selected');
            if (selectedElement) {

                if (radioBtn === 'baground') {
                    selectedElement.style.backgroundColor = color.rgbaString;
                    if (currentSelectedBox === 0) {
                        document.querySelectorAll('.nav-bar-bg').forEach(el => {
                            el.style.backgroundColor = color.rgbaString
                        });
                    } else if (currentSelectedBox === 1) {
                        document.querySelectorAll('.side-bar-bg').forEach(el => {
                            el.style.backgroundColor = color.rgbaString
                        });
                    } else {
                        document.querySelectorAll('.main-bg').forEach(el => {
                            el.style.backgroundColor = color.rgbaString
                        });
                    }
                } else if (radioBtn === 'text') {
                    selectedElement.style.color = color.rgbaString;
                    if (currentSelectedBox === 0) {
                        document.querySelectorAll('.nav-bar-text').forEach(el => {
                            el.style.color = color.rgbaString;
                            el.style.borderColor = color.rgbaString;
                        });
                    } else if (currentSelectedBox === 1) {
                        document.querySelectorAll('.side-bar-text').forEach(el => {
                            el.style.color = color.rgbaString;
                            el.style.borderColor = color.rgbaString;
                        });
                    } else {
                        document.querySelectorAll('.main-text').forEach(el => {
                            el.style.color = color.rgbaString;
                            el.style.borderColor = color.rgbaString;
                        });
                    }
                } else if (radioBtn === 'btn') {
                    document.querySelectorAll('.btn-primary').forEach(el => {
                        el.style.backgroundColor = color.rgbaString;
                        el.style.borderColor = color.rgbaString;
                    });
                } else if (radioBtn === 'forground') {
                    document.querySelectorAll('.side-bar-forground').forEach(el => {
                        el.style.backgroundColor = color.rgbaString;
                    });
                }
            }
        }
    });

document.querySelectorAll('.my-box').forEach((selectedBox, index) => {
    selectedBox.addEventListener('click', function () {
        currentSelectedBox = index;
        const element = document.getElementById('label-id');
        if (element) {
            element.remove();
        }
        if (index !== 0) {
            var nodeLabel = document.createElement('label');
            nodeLabel.setAttribute('class', 'label w-full cursor-pointer');
            nodeLabel.setAttribute('id', 'label-id');

            var nodeSpan = document.createElement('span');
            nodeSpan.setAttribute('class', 'label-text');
            nodeLabel.appendChild(nodeSpan);

            var nodeText;
            if (index === 1) {
                nodeText = document.createTextNode("Forground");
            } else {
                nodeText = document.createTextNode("Button");
            }
            nodeSpan.appendChild(nodeText);

            var nodeInput = document.createElement('input');
            nodeInput.setAttribute('type', 'radio');
            nodeInput.setAttribute('name', 'radio-1');
            if (index === 1) {
                nodeInput.setAttribute('value', 'forground');
            } else {
                nodeInput.setAttribute('value', 'btn');
            }
            nodeInput.setAttribute('class', 'radio checked:bg-primary');
            nodeLabel.appendChild(nodeInput);

            document.getElementById('radio-btn-container').appendChild(nodeLabel)
            getRadioBtn();
        }
        document.querySelectorAll('.my-box').forEach(otherBox => {
            otherBox.classList.remove('border-2', 'border-blue-500');
            otherBox.removeAttribute('id');
        });
        this.classList.add('border-2', 'border-blue-500');
        this.setAttribute('id', 'selected');
    });
});
getRadioBtn();
function getRadioBtn() {
    document.querySelectorAll('.radio').forEach(radio => {
        radio.addEventListener('click', function () {
            radioBtn = this.value
        });
    });
}
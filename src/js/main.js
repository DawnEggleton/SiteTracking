
function toggleMenu(e) {
    e.parentNode.classList.toggle('is-open');
}
function getMonthName(monthNum) {
    switch(monthNum) {
        case 0:
            return 'january';
            break;
        case 1:
            return 'february';
            break;
        case 2:
            return 'march';
            break;
        case 3:
            return 'april';
            break;
        case 4:
            return 'may';
            break;
        case 5:
            return 'june';
            break;
        case 6:
            return 'july';
            break;
        case 7:
            return 'august';
            break;
        case 8:
            return 'september';
            break;
        case 9:
            return 'october';
            break;
        case 10:
            return 'november';
            break;
        case 11:
            return 'december';
            break;
        default:
            break;
    }
}
function capitalize(str, separators) {
    separators = separators || [ ' ' ];
    var regex = new RegExp('(^|[' + separators.join('') + '])(\\w)', 'g');
    return str.replace(regex, function(x) { return x.toUpperCase(); });
}

export async function fetchData(endpoint, baseURL) {
    const data = await fetch(`/api/fetchNotion-${endpoint}`)
        .then(response => response.json())
        .then(data => {
            //organize data into more accessible objects
            let threads = [];
            data.forEach(item => {
                let thread = {
                    status: item.Turn.status ? item.Turn.status.name.toLowerCase().trim() : '',
                    title: item['Thread Title'].title[0] ? item['Thread Title'].title[0].plain_text.toLowerCase().trim() : '',
                    id: item.Link.url ? item.Link.url.split(`?showtopic=`)[1] : 0,
                    character: item.Character.select.name.toLowerCase().trim(),
                    partners: item.Partner.multi_select.map(partner => {return {name: partner.name.split('#')[0].toLowerCase().trim(), id: partner.name.split('#')[1]}}),
                    featuring: item.Featuring.multi_select.map(character => {return {name: character.name.split('#')[0].toLowerCase().trim(), id: character.name.split('#')[1]}}),
                    icDate: item['IC Date'].date ? new Date(item['IC Date'].date.start.replace(/-/g, '\/').replace(/T.+/, '')) : '',
                    type: item.Type.select ? item.Type.select.name.toLowerCase().trim() : '',
                    lastPost: new Date(item['Last edited time'].last_edited_time.replace(/-/g, '\/').replace(/T.+/, '')),
                }
                threads = [...threads, thread];
            });

            //set up objects as visual threads
            let html = ``;

            let owing = threads.filter(thread => thread.status === 'mine' || thread.status === 'start');
            let notOwing = threads.filter(thread => thread.status !== 'mine' && thread.status !== 'start');

            owing.sort((a,b) => {
                if(a.character < b.character) {
                    return -1;
                }  else if(a.character > b.character) {
                    return 1;
                } else {
                    return a.icDate - b.icDate;
                }
            });
            notOwing.sort((a,b) => {
                if(a.character < b.character) {
                    return -1;
                }  else if(a.character > b.character) {
                    return 1;
                } else {
                    return a.icDate - b.icDate;
                }
            });

            let sectionedThreads = [...owing, ...notOwing];

            sectionedThreads.forEach(thread => {
                let charactersArray = thread.featuring.map(character => `<a href="${baseURL}?showuser=${character.id}">${character.name}</a>`);
                let partnersArray = thread.partners.map(partner => `<a href="${baseURL}?showuser=${partner.id}">${partner.name}</a>`);
                let charactersString, partnersString;
                if(charactersArray.length > 2) {
                    charactersString = `${charactersArray.slice(0, -1).join(', ')}, and ${charactersArray.slice(-1)}`;
                } else {
                    charactersString = charactersArray.join(' and ');
                }
                if(partnersArray.length > 2) {
                    partnersString = `${partnersArray.slice(0, -1).join(', ')}, and ${partnersArray.slice(-1)}`;
                } else {
                    partnersString = partnersArray.join(' and ');
                }
                let icMonth = '', icDate = '';
                if(thread.icDate) {
                    icMonth = getMonthName(thread.icDate.getMonth());
                    icDate = `<span class="thread--ic-date">Set ${icMonth} ${thread.icDate.getDate()}, ${thread.icDate.getFullYear()}</span>`;
                }
                let postMonth = '', lastPost = '';
                if(thread.lastPost) {
                    postMonth = getMonthName(thread.lastPost.getMonth());
                    lastPost = `${postMonth} ${thread.lastPost.getDate()}, ${thread.lastPost.getFullYear()}`;
                }

                let elapsed = (new Date() - thread.lastPost) / (1000*60*60*24);
                let delayClass;
                if(elapsed > 7) {
                    delayClass = 'week';
                } else if (elapsed > 30) {
                    delayClass = 'month';
                } else if (elapsed > 90) {
                    delayClass = 'quarter-year';
                } else if (elapsed > 180) {
                    delayClass = 'half-year';
                } else if (elapsed > 365) {
                    delayClass = 'year';
                } else {
                    delayClass = 'okay';
                }

                html += `<div class="thread lux-track status-${thread.status} ${thread.character.split(' ')[0]} delay--${delayClass} type--${thread.type}">
                    <b class="thread--character">${thread.character}</b>
                    <a href="${baseURL}?showtopic=${thread.id}" target="_blank" class="thread--title">${capitalize(thread.title, [`-`, `'`])}</a>
                    <span class="thread--feature">ft. ${charactersString}</span>
                    <span class="thread--partners">Writing with ${partnersString}</span>
                    ${icDate}
                    <span class="thread--last-post">Last Active ${lastPost}</span>
                </div>`
                
            });

            //set html
            document.querySelector('.tracker').innerHTML = html;
        });
}

export async function fetchDataCombined() {
    const data = await fetch(`/api/fetchNotion-Combined`)
        .then(response => response.json())
        .then(data => {
            //organize data into more accessible objects
            let threads = [];
            data.forEach(item => {
                let thread = {
                    status: item.Turn.status ? item.Turn.status.name.toLowerCase().trim() : '',
                    title: item['Thread Title'].title[0] ? item['Thread Title'].title[0].plain_text.toLowerCase().trim() : '',
                    id: item.Link.url ? item.Link.url.split(`?showtopic=`)[1] : 0,
                    character: item.Character.select.name.toLowerCase().trim(),
                    partners: item.Partner.multi_select.map(partner => {return {name: partner.name.split('#')[0].toLowerCase().trim(), id: partner.name.split('#')[1]}}),
                    featuring: item.Featuring.multi_select.map(character => {return {name: character.name.split('#')[0].toLowerCase().trim(), id: character.name.split('#')[1]}}),
                    icDate: item['IC Date'].date ? new Date(item['IC Date'].date.start.replace(/-/g, '\/').replace(/T.+/, '')) : '',
                    type: item.Type.select ? item.Type.select.name.toLowerCase().trim() : '',
                    lastPost: new Date(item['Last edited time'].last_edited_time.replace(/-/g, '\/').replace(/T.+/, '')),
                }
                threads = [...threads, thread];
            });

            //set up objects as visual threads
            let html = ``;

            let owing = threads.filter(thread => thread.status === 'mine' || thread.status === 'start');
            let notOwing = threads.filter(thread => thread.status !== 'mine' && thread.status !== 'start');

            owing.sort((a,b) => {
                if(a.character < b.character) {
                    return -1;
                }  else if(a.character > b.character) {
                    return 1;
                } else {
                    return b.lastPost - a.lastPost;
                }
            });
            notOwing.sort((a,b) => {
                if(a.character < b.character) {
                    return -1;
                }  else if(a.character > b.character) {
                    return 1;
                } else {
                    return a.icDate - b.icDate;
                }
            });

            let sectionedThreads = [...owing, ...notOwing];

            sectionedThreads.forEach(thread => {
                let charactersArray = thread.featuring.map(character => `<a href="?showuser=${character.id}">${character.name}</a>`);
                let partnersArray = thread.partners.map(partner => `<a href="?showuser=${partner.id}">${partner.name}</a>`);
                let charactersString, partnersString;
                if(charactersArray.length > 2) {
                    charactersString = `${charactersArray.slice(0, -1).join(', ')}, and ${charactersArray.slice(-1)}`;
                } else {
                    charactersString = charactersArray.join(' and ');
                }
                if(partnersArray.length > 2) {
                    partnersString = `${partnersArray.slice(0, -1).join(', ')}, and ${partnersArray.slice(-1)}`;
                } else {
                    partnersString = partnersArray.join(' and ');
                }
                let icMonth = '', icDate = '';
                if(thread.icDate) {
                    icMonth = getMonthName(thread.icDate.getMonth());
                    icDate = `<span class="thread--ic-date">Set ${icMonth} ${thread.icDate.getDate()}, ${thread.icDate.getFullYear()}</span>`;
                }
                let postMonth = '', lastPost = '';
                if(thread.lastPost) {
                    postMonth = getMonthName(thread.lastPost.getMonth());
                    lastPost = `${postMonth} ${thread.lastPost.getDate()}, ${thread.lastPost.getFullYear()}`;
                }

                let elapsed = (new Date() - thread.lastPost) / (1000*60*60*24);
                let delayClass;
                if(elapsed > 7) {
                    delayClass = 'week';
                } else if (elapsed > 30) {
                    delayClass = 'month';
                } else if (elapsed > 90) {
                    delayClass = 'quarter-year';
                } else if (elapsed > 180) {
                    delayClass = 'half-year';
                } else if (elapsed > 365) {
                    delayClass = 'year';
                } else {
                    delayClass = 'okay';
                }

                html += `<div class="thread lux-track status-${thread.status} ${thread.character.split(' ')[0]} delay--${delayClass} type--${thread.type}">
                    <b class="thread--character">${thread.character}</b>
                    <a href="?showtopic=${thread.id}" target="_blank" class="thread--title">${capitalize(thread.title, [`-`, `'`])}</a>
                    <span class="thread--feature">ft. ${charactersString}</span>
                    <span class="thread--partners">Writing with ${partnersString}</span>
                    ${icDate}
                    <span class="thread--last-post">Last Active ${lastPost}</span>
                </div>`
                
            });

            //set html
            document.querySelector('.tracker').innerHTML = html;
        });
}
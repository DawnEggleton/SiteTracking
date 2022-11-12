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
            let pageHTML = ``;
            let filtersHTML = `<div class="filters">
            <div class="filter-group" data-filter-group="lastReply">
                <b>Last Reply</b>
                <label class="all is-checked"><input type="checkbox" class="all" value="" checked=""><span>Any Time</span></label>
                <label><input type="checkbox" value=".delay--okay"><span>Less than a week</span></label>
                <label><input type="checkbox" value=".delay--week"><span>More than a week</span></label>
                <label><input type="checkbox" value=".delay--month"><span>More than a month</span></label>
                <label><input type="checkbox" value=".delay--quarter-year"><span>More than three months</span></label>
                <label><input type="checkbox" value=".delay--half-year"><span>More than six months</span></label>
                <label><input type="checkbox" value=".delay--year"><span>More than a year</span></label>
            </div>
            <div class="filter-group" data-filter-group="turn">
                <b>Turn</b>
                <label class="all is-checked"><input type="checkbox" class="all" value="" checked=""><span>Any Turn</span></label>
                <label><input type="checkbox" value=".status-mine"><span>Mine</span></label>
                <label><input type="checkbox" value=".status-start"><span>Mine (Upcoming)</span></label>
                <label><input type="checkbox" value=".status-theirs"><span>Theirs</span></label>
                <label><input type="checkbox" value=".status-upcoming"><span>Theirs (Upcoming)</span></label>
                <label><input type="checkbox" value=".status-done"><span>Completed</span></label>
            </div>
            <div class="filter-group" data-filter-group="type">
                <b>Thread Type</b>
                <label class="all is-checked"><input type="checkbox" class="all" value="" checked=""><span>Any Type</span></label>
                <label><input type="checkbox" value=".type--thread"><span>Thread</span></label>
                <label><input type="checkbox" value=".type--comm"><span>Comm</span></label>
                <label><input type="checkbox" value=".type--oneshot"><span>One-shot</span></label>
            </div>
            <div class="filter-group" data-filter-group="partners">
                <b>Partner</b>
                <label class="all is-checked"><input type="checkbox" class="all" value="" checked=""><span>Any Partner</span></label>`;

            let threadPartners = threads.map(thread => thread.partners);
            let partnerList = [];
            threadPartners.forEach(thread => {
                let partners = thread.map(partner => partner.name);
                partners.forEach(partner => partnerList.push(partner));
            });
            let consolidatedPartners = [...new Set(partnerList)];
            consolidatedPartners.sort();
            consolidatedPartners.forEach(partner => {
                filtersHTML += `<label><input type="checkbox" value=".partner-${partner}"><span>${capitalize(partner, [`'`, `-`])}</span></label>`;
            });
            
            filtersHTML += `</div>
            <div class="filter-group" data-filter-group="characters">
                <b>Character</b>
                <label class="all is-checked"><input type="checkbox" class="all" value="" checked=""><span>Any Character</span></label>`;

            let threadCharacters = threads.map(thread => thread.character.split(' ')[0]);
            let consolidatedCharacters = [...new Set(threadCharacters)];
            consolidatedCharacters.sort();
            consolidatedCharacters.forEach(character => {
                filtersHTML += `<label class="lux-track ${character}"><input type="checkbox" value=".${character}"><span>${capitalize(character, [`'`, `-`])}</span></label>`;
            });
    
            filtersHTML += `</div></div>`;

            pageHTML += filtersHTML;
            pageHTML += `<div class="grid-container">`;

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
                let partnersClasses = thread.partners.map(partner => `partner-${partner.name}`).join(' ');
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

                html += `<div class="thread lux-track status-${thread.status} ${thread.character.split(' ')[0]} delay--${delayClass} type--${thread.type} ${partnersClasses} grid-item">
                    <b class="thread--character">${thread.character}</b>
                    <a href="${baseURL}?showtopic=${thread.id}" target="_blank" class="thread--title">${capitalize(thread.title, [`-`, `'`])}</a>
                    <span class="thread--feature">ft. ${charactersString}</span>
                    <span class="thread--partners">Writing with ${partnersString}</span>
                    ${icDate}
                    <span class="thread--last-post">Last Active ${lastPost}</span>
                </div>`
                
            });

            pageHTML += html;
            pageHTML += `</div>`;

            //set html
            document.querySelector('.tracker').innerHTML = pageHTML;
        }).then(() => {
            setIsotope();
        });
}

export async function fetchDataCombined() {
    const data = await fetch(`/api/fetchNotion-Combined`)
        .then(response => response.json())
        .then(data => {
            //organize data into more accessible objects
            let threads = [];
            data.forEach((site, i) => {
                let siteBase = ``;
                switch (i) {
                    case 0:
                        siteBase = `https://killyourheroeshp.jcink.net/`
                        break;
                    case 1:
                        siteBase = `https://legends.jcink.net/`
                        break;
                    case 2:
                        siteBase = `https://totl.jcink.net/`
                        break;
                    default:
                        break;
                }
                site.forEach(item => {
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
                        siteURL: siteBase
                    }
                    threads = [...threads, thread];
                });
            });

            //set up objects as visual threads
            let html = ``;
            let pageHTML = ``;
            let filtersHTML = `<div class="filters">
            <div class="filter-group" data-filter-group="lastReply">
                <b>Last Reply</b>
                <label class="all is-checked"><input type="checkbox" class="all" value="" checked=""><span>Any Time</span></label>
                <label><input type="checkbox" value=".delay--okay"><span>Less than a week</span></label>
                <label><input type="checkbox" value=".delay--week"><span>More than a week</span></label>
                <label><input type="checkbox" value=".delay--month"><span>More than a month</span></label>
                <label><input type="checkbox" value=".delay--quarter-year"><span>More than three months</span></label>
                <label><input type="checkbox" value=".delay--half-year"><span>More than six months</span></label>
                <label><input type="checkbox" value=".delay--year"><span>More than a year</span></label>
            </div>
            <div class="filter-group" data-filter-group="turn">
                <b>Turn</b>
                <label class="all is-checked"><input type="checkbox" class="all" value="" checked=""><span>Any Turn</span></label>
                <label><input type="checkbox" value=".status-mine"><span>Mine</span></label>
                <label><input type="checkbox" value=".status-start"><span>Mine (Upcoming)</span></label>
                <label><input type="checkbox" value=".status-theirs"><span>Theirs</span></label>
                <label><input type="checkbox" value=".status-upcoming"><span>Theirs (Upcoming)</span></label>
                <label><input type="checkbox" value=".status-done"><span>Completed</span></label>
            </div>
            <div class="filter-group" data-filter-group="type">
                <b>Thread Type</b>
                <label class="all is-checked"><input type="checkbox" class="all" value="" checked=""><span>Any Type</span></label>
                <label><input type="checkbox" value=".type--thread"><span>Thread</span></label>
                <label><input type="checkbox" value=".type--comm"><span>Comm</span></label>
                <label><input type="checkbox" value=".type--oneshot"><span>One-shot</span></label>
            </div>
            <div class="filter-group" data-filter-group="partners">
                <b>Partner</b>
                <label class="all is-checked"><input type="checkbox" class="all" value="" checked=""><span>Any Partner</span></label>`;

            let threadPartners = threads.map(thread => thread.partners);
            let partnerList = [];
            threadPartners.forEach(thread => {
                let partners = thread.map(partner => partner.name);
                partners.forEach(partner => partnerList.push(partner));
            });
            let consolidatedPartners = [...new Set(partnerList)];
            consolidatedPartners.sort();
            consolidatedPartners.forEach(partner => {
                filtersHTML += `<label><input type="checkbox" value=".partner-${partner}"><span>${capitalize(partner, [`'`, `-`])}</span></label>`;
            });
            
            filtersHTML += `</div>
            <div class="filter-group" data-filter-group="characters">
                <b>Character</b>
                <label class="all is-checked"><input type="checkbox" class="all" value="" checked=""><span>Any Character</span></label>`;

            let threadCharacters = threads.map(thread => thread.character.split(' ')[0]);
            let consolidatedCharacters = [...new Set(threadCharacters)];
            consolidatedCharacters.sort();
            consolidatedCharacters.forEach(character => {
                filtersHTML += `<label class="lux-track ${character}"><input type="checkbox" value=".${character}"><span>${capitalize(character, [`'`, `-`])}</span></label>`;
            });
    
            filtersHTML += `</div></div>`;

            pageHTML += filtersHTML;
            pageHTML += `<div class="grid-container">`;

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
                let charactersArray = thread.featuring.map(character => `<a href="${thread.siteURL}?showuser=${character.id}">${character.name}</a>`);
                let partnersArray = thread.partners.map(partner => `<a href="${thread.siteURL}?showuser=${partner.id}">${partner.name}</a>`);
                let partnersClasses = thread.partners.map(partner => `partner-${partner.name}`).join(' ');
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

                html += `<div class="thread lux-track status-${thread.status} ${thread.character.split(' ')[0]} delay--${delayClass} type--${thread.type} ${partnersClasses} grid-item">
                    <b class="thread--character">${thread.character}</b>
                    <a href="${thread.siteURL}?showtopic=${thread.id}" target="_blank" class="thread--title">${capitalize(thread.title, [`-`, `'`])}</a>
                    <span class="thread--feature">ft. ${charactersString}</span>
                    <span class="thread--partners">Writing with ${partnersString}</span>
                    ${icDate}
                    <span class="thread--last-post">Last Active ${lastPost}</span>
                </div>`
                
            });

            pageHTML += html;
            pageHTML += `</div>`;

            //set html
            document.querySelector('.tracker').innerHTML = pageHTML;
        }).then(() => {
            setIsotope();
        });
}
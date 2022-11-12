function toggleMenu(e) {
    e.parentNode.classList.toggle('is-open');
}
function capitalize(str, separators) {
    separators = separators || [ ' ' ];
    var regex = new RegExp('(^|[' + separators.join('') + '])(\\w)', 'g');
    return str.replace(regex, function(x) { return x.toUpperCase(); });
}

export async function fetchChartData(endpoint, baseURL) {
    const data = await fetch(`/api/fetchNotion-${endpoint}`)
    .then(response => response.json())
    .then(data => {
        //organize data into more accessible objects
        let threads = [];
        data.forEach(item => {
            let lastPost = new Date(item['Last edited time'].last_edited_time.replace(/-/g, '\/').replace(/T.+/, ''));
            let elapsed = (new Date() - lastPost) / (1000*60*60*24);
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
            let thread = {
                status: item.Turn.status ? item.Turn.status.name.toLowerCase().trim() : '',
                partners: item.Partner.multi_select.map(partner => {return partner.name.split('#')[0].toLowerCase().trim()}),
                type: item.Type.select ? item.Type.select.name.toLowerCase().trim() : '',
                delay: delayClass,
            }
            threads = [...threads, thread];
        });
        let pageHTML = `<div class="chart">
            <b>Last Reply</b>
            <div class="chart--time"></div>
        </div>
        <div class="chart">
            <b>Status</b>
            <div class="chart--status"></div>
        </div>
        <div class="chart">
            <b>Type</b>
            <div class="chart--type"></div>
        </div>
        <div class="chart">
            <b>Partners</b>
            <div class="chart--partner"></div>
        </div>`;

        //set html
        document.querySelector('.tracker').innerHTML = pageHTML;
        return threads;
    }).then(threads => {
        let recent = threads.filter(thread => thread.delay === 'okay').length;
        let week = threads.filter(thread => thread.delay === 'week').length;
        let month = threads.filter(thread => thread.delay === 'month').length;
        let quarter = threads.filter(thread => thread.delay === 'quarter-year').length;
        let half = threads.filter(thread => thread.delay === 'half-year').length;
        let year = threads.filter(thread => thread.delay === 'year').length;
        let timeConfig = {
            series: [recent, week, month, quarter, half, year],
            labels: ['Recent', 'Over a week', 'Over a month', 'Over 3 months', 'Over 6 months', 'Over a year'],
            colors: ['rgb(146, 172, 125)', 'rgb(174, 176, 121)', 'rgb(196, 179, 131)', 'rgb(193, 160, 135)', 'rgb(193, 138, 135)', 'rgb(189, 112, 112)'],
            chart: {
                type: 'donut',
                height: '400px',
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '50%',
                    }
                }
            },
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0,
                    }
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0,
                    }
                },
            },
            dataLabels: {
                enabled: true,
                formatter: function(value, { seriesIndex, dataPointIndex, w }) {
                    return w.config.series[seriesIndex]
                },
                style: {
                    fontSize: '20px',
                    fontFamily: 'var(--font-accent)',
                    fontWeight: '400'
                },
                dropShadow: {
                    enabled: false,
                }
            }, 
            legend: {
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                fontWeight: '400',
                markers: {
                    width: '10px',
                    height: '10px',
                    offsetX: '-2px',
                },
            },
            stroke: {
                show: true,
                colors: 'var(--bg-body)',
            },
            tooltip: {
                enabled: false,
            },
            theme: {
                palette: 'palette4',
            },
            responsive: [{
                breakpoint: 560,
                options: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };

        let owing = threads.filter(thread => thread.status === 'mine' || thread.status === 'start').length;
        let active = threads.filter(thread => thread.status === 'theirs' || thread.status === 'upcoming').length;
        let complete = threads.filter(thread => thread.status === 'done').length;
        let statusConfig = {
            series: [owing, active, complete],
            labels: ['Mine', 'Theirs', 'Completed'],
            colors: ['rgba(162, 129, 119, 1)', 'rgba(125, 159, 129, 1)', 'rgb(141, 165, 176)'],
            chart: {
                type: 'donut',
                height: '400px',
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '50%',
                    }
                }
            },
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0,
                    }
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0,
                    }
                },
            },
            dataLabels: {
                enabled: true,
                formatter: function(value, { seriesIndex, dataPointIndex, w }) {
                    return w.config.series[seriesIndex]
                },
                style: {
                    fontSize: '20px',
                    fontFamily: 'var(--font-accent)',
                    fontWeight: '400'
                },
                dropShadow: {
                    enabled: false,
                }
            }, 
            legend: {
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                fontWeight: '400',
                markers: {
                    width: '10px',
                    height: '10px',
                    offsetX: '-2px',
                },
            },
            stroke: {
                show: true,
                colors: 'var(--bg-body)',
            },
            tooltip: {
                enabled: false,
            },
            theme: {
                palette: 'palette4',
            },
            responsive: [{
                breakpoint: 560,
                options: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };

        let threadCount = threads.filter(thread => thread.type === 'thread').length;
        let comms = threads.filter(thread => thread.type === 'comm').length;
        let oneshots = threads.filter(thread => thread.type === 'oneshot').length;
        let typeConfig = {
            series: [threadCount, comms, oneshots],
            labels: ['Threads', 'Comms', 'One-shots'],
            colors: ['rgb(141, 165, 176)', 'rgb(174, 140, 161)', 'rgba(189, 173, 133, 1)'],
            chart: {
                type: 'donut',
                height: '400px',
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '50%',
                    }
                }
            },
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0,
                    }
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0,
                    }
                },
            },
            dataLabels: {
                enabled: true,
                formatter: function(value, { seriesIndex, dataPointIndex, w }) {
                    return w.config.series[seriesIndex]
                },
                style: {
                    fontSize: '20px',
                    fontFamily: 'var(--font-accent)',
                    fontWeight: '400'
                },
                dropShadow: {
                    enabled: false,
                }
            }, 
            legend: {
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                fontWeight: '400',
                markers: {
                    width: '10px',
                    height: '10px',
                    offsetX: '-2px',
                },
            },
            stroke: {
                show: true,
                colors: 'var(--bg-body)',
            },
            tooltip: {
                enabled: false,
            },
            theme: {
                palette: 'palette4',
            },
            responsive: [{
                breakpoint: 560,
                options: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };

        let threadPartners = threads.map(thread => thread.partners);
        let partnerList = [];
        threadPartners.forEach(thread => {
            thread.forEach(partner => partnerList.push(partner));
        });
        let consolidatedPartners = [...new Set(partnerList)];
            let partnerCounts = consolidatedPartners.reduce((accumulator, value) => {
                return {...accumulator, [value]: 0};
        }, {});
        threads.forEach(thread => {
            thread.partners.forEach(partner => {
                partnerCounts[partner]++;
            });
        });
        let partners = [], counts = [];
        for (const partnerName in partnerCounts) {
            partners.push(capitalize(partnerName, [`'`, `-`]));
            counts.push(partnerCounts[partnerName]);
        }
        let partnerConfig = {
            series: counts,
            labels: partners,
            colors: ['rgba(189, 173, 133, 1)', 'rgb(134, 123, 155)', 'rgb(174, 140, 161)', 'rgb(141, 165, 176)', 'rgb(152, 159, 125)', 'rgba(125, 159, 129, 1)', 'rgba(162, 129, 119, 1)'],
            chart: {
                type: 'donut',
                height: '400px',
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '50%',
                    }
                }
            },
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0,
                    }
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0,
                    }
                },
            },
            dataLabels: {
                enabled: true,
                formatter: function(value, { seriesIndex, dataPointIndex, w }) {
                    return w.config.series[seriesIndex]
                },
                style: {
                    fontSize: '20px',
                    fontFamily: 'var(--font-accent)',
                    fontWeight: '400'
                },
                dropShadow: {
                    enabled: false,
                }
            }, 
            legend: {
                fontSize: '14px',
                fontFamily: 'var(--font-body)',
                fontWeight: '400',
                markers: {
                    width: '10px',
                    height: '10px',
                    offsetX: '-2px',
                },
            },
            stroke: {
                show: true,
                colors: 'var(--bg-body)',
            },
            tooltip: {
                enabled: false,
            },
            theme: {
                palette: 'palette4',
            },
            responsive: [{
                breakpoint: 560,
                options: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };

        let timeChart = new ApexCharts(document.querySelector(".chart--time"), timeConfig);
        timeChart.render();
        let statusChart = new ApexCharts(document.querySelector(".chart--status"), statusConfig);
        statusChart.render();
        let typeChart = new ApexCharts(document.querySelector(".chart--type"), typeConfig);
        typeChart.render();
        let partnerChart = new ApexCharts(document.querySelector(".chart--partner"), partnerConfig);
        partnerChart.render();
    });
}



export async function fetchChartDataCombined() {
    const data = await fetch(`/api/fetchNotion-Combined`)
        .then(response => response.json())
        .then(data => {
            //organize data into more accessible objects
            let threads = [];
            data.forEach((site) => {
                site.forEach(item => {
                    let lastPost = new Date(item['Last edited time'].last_edited_time.replace(/-/g, '\/').replace(/T.+/, ''));
                    let elapsed = (new Date() - lastPost) / (1000*60*60*24);
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
                    let thread = {
                        status: item.Turn.status ? item.Turn.status.name.toLowerCase().trim() : '',
                        partners: item.Partner.multi_select.map(partner => {return partner.name.split('#')[0].toLowerCase().trim()}),
                        type: item.Type.select ? item.Type.select.name.toLowerCase().trim() : '',
                        delay: delayClass,
                    }
                    threads = [...threads, thread];
                });
            });
            let pageHTML = `<div class="chart">
                <b>Last Reply</b>
                <div class="chart--time"></div>
            </div>
            <div class="chart">
                <b>Status</b>
                <div class="chart--status"></div>
            </div>`;
    
            //set html
            document.querySelector('.tracker').innerHTML = pageHTML;
            return threads;
        }).then(threads => {
            let recent = threads.filter(thread => thread.delay === 'okay').length;
            let week = threads.filter(thread => thread.delay === 'week').length;
            let month = threads.filter(thread => thread.delay === 'month').length;
            let quarter = threads.filter(thread => thread.delay === 'quarter-year').length;
            let half = threads.filter(thread => thread.delay === 'half-year').length;
            let year = threads.filter(thread => thread.delay === 'year').length;
            let timeConfig = {
                series: [recent, week, month, quarter, half, year],
                labels: ['Recent', 'Over a week', 'Over a month', 'Over 3 months', 'Over 6 months', 'Over a year'],
                colors: ['rgb(146, 172, 125)', 'rgb(174, 176, 121)', 'rgb(196, 179, 131)', 'rgb(193, 160, 135)', 'rgb(193, 138, 135)', 'rgb(189, 112, 112)'],
                chart: {
                    type: 'donut',
                    height: '400px',
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '50%',
                        }
                    }
                },
                states: {
                    hover: {
                        filter: {
                            type: 'none',
                            value: 0,
                        }
                    },
                    active: {
                        filter: {
                            type: 'none',
                            value: 0,
                        }
                    },
                },
                dataLabels: {
                    enabled: true,
                    formatter: function(value, { seriesIndex, dataPointIndex, w }) {
                        return w.config.series[seriesIndex]
                    },
                    style: {
                        fontSize: '20px',
                        fontFamily: 'var(--font-accent)',
                        fontWeight: '400'
                    },
                    dropShadow: {
                        enabled: false,
                    }
                }, 
                legend: {
                    fontSize: '14px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: '400',
                    markers: {
                        width: '10px',
                        height: '10px',
                        offsetX: '-2px',
                    },
                },
                stroke: {
                    show: true,
                    colors: 'var(--bg-body)',
                },
                tooltip: {
                    enabled: false,
                },
                theme: {
                    palette: 'palette4',
                },
                responsive: [{
                    breakpoint: 560,
                    options: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }]
            };
    
            let owing = threads.filter(thread => thread.status === 'mine' || thread.status === 'start').length;
            let active = threads.filter(thread => thread.status === 'theirs' || thread.status === 'upcoming').length;
            let complete = threads.filter(thread => thread.status === 'done').length;
            let statusConfig = {
                series: [owing, active, complete],
                labels: ['Mine', 'Theirs', 'Completed'],
                colors: ['rgba(162, 129, 119, 1)', 'rgba(125, 159, 129, 1)', 'rgb(141, 165, 176)'],
                chart: {
                    type: 'donut',
                    height: '400px',
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '50%',
                        }
                    }
                },
                states: {
                    hover: {
                        filter: {
                            type: 'none',
                            value: 0,
                        }
                    },
                    active: {
                        filter: {
                            type: 'none',
                            value: 0,
                        }
                    },
                },
                dataLabels: {
                    enabled: true,
                    formatter: function(value, { seriesIndex, dataPointIndex, w }) {
                        return w.config.series[seriesIndex]
                    },
                    style: {
                        fontSize: '20px',
                        fontFamily: 'var(--font-accent)',
                        fontWeight: '400'
                    },
                    dropShadow: {
                        enabled: false,
                    }
                }, 
                legend: {
                    fontSize: '14px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: '400',
                    markers: {
                        width: '10px',
                        height: '10px',
                        offsetX: '-2px',
                    },
                },
                stroke: {
                    show: true,
                    colors: 'var(--bg-body)',
                },
                tooltip: {
                    enabled: false,
                },
                theme: {
                    palette: 'palette4',
                },
                responsive: [{
                    breakpoint: 560,
                    options: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }]
            };
    
            let timeChart = new ApexCharts(document.querySelector(".chart--time"), timeConfig);
            timeChart.render();
            let statusChart = new ApexCharts(document.querySelector(".chart--status"), statusConfig);
            statusChart.render();
        });
}
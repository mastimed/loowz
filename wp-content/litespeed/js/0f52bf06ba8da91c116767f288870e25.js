{
    const $ = jQuery;
    const typesTesters = {
        string: value => !0,
        number: value => /^-?\d+(\.\d+)?$/.test(value),
        boolean: value => value === 'false' || value === 'true',
    };
    const typesParsers = {
        string: value => value,
        number: value => parseFloat(value),
        boolean: value => value !== 'false',
    };
    const parseDataAttr = (dataAttr, types) => {
        const options = {};
        for (const row of dataAttr.split(';')) {
            const match = row.trim().match(/^(.*?):([\s\S]*)$/);
            if (!match) continue;
            let [key, value] = [match[1], match[2]].map(a => a.trim());
            for (const type in types) {
                if (types[type].includes(key) && typesTesters[type](value)) {
                    value = typesParsers[type](value);
                    break
                }
            }
            if (typeof value === 'string') {
                if (/^(\[|\{|anime\.|"|')/.test(value)) {
                    value = new Function(`return (${value})`)()
                }
            }
            const parts = key.split('-');
            let opts = options;
            parts.forEach((part, i) => {
                if (i < parts.length - 1) {
                    opts[part] = opts[part] || {};
                    opts = opts[part]
                } else {
                    opts[part] = value
                }
            })
        }
        return options
    };
    const dataAnimeAttrType = {
        string: ["targets", ],
        number: ["onview", ],
        boolean: ["loop", "onclick", "onview", "autoplay", ]
    };
    const runInstance = (el, instance, direction = 'restart') => {
        if (direction === 'alternate') {
            if (!el.animeToggleOpen) {
                if (instance.reversed) {
                    instance.reverse()
                }
            } else {
                if (!instance.reversed) {
                    instance.reverse()
                }
            }
            el.animeToggleOpen = !el.animeToggleOpen;
            instance.play()
        } else if (direction === 'restart') {
            instance.restart()
        } else {
            throw 'invalid direction'
        }
    };
    const loadingPromise = new Promise(r => {
        document.addEventListener('DOMContentLoaded', e => {
            setTimeout(() => {
                r()
            }, 1000 + 300)
        })
    });
    const runHelper = async (el, options, instance) => {
        const run = (direction = 'restart') => {
            runInstance(el, instance, direction)
        };
        let autoRun = options.autoplay !== !1;
        if (options.onclick) {
            const toggle = options.onclick === 'alternate';
            el.addEventListener('click', e => {
                e.preventDefault();
                run(toggle ? 'alternate' : 'restart')
            });
            autoRun = !1
        }
        if (options.onhover) {
            $(el).on('mouseenter mouseleave', () => {
                run('alternate')
            });
            autoRun = !1
        }
        await loadingPromise;
        if (typeof options.onview !== 'undefined' && options.onview !== !1) {
            const offset = typeof options.onview === 'number' ? options.onview : 0;
            const handler = () => {
                if (window.innerHeight > el.getBoundingClientRect().top - offset) {
                    window.removeEventListener('scroll', handler);
                    window.removeEventListener('resize', handler);
                    run()
                }
            };
            window.addEventListener('scroll', handler);
            window.addEventListener('resize', handler);
            handler();
            autoRun = !1
        }
        if (autoRun) {
            run()
        }
    };
    const runDataAnime = () => {
        document.querySelectorAll('[data-anime]').forEach(el => {
            const options = parseDataAttr(el.getAttribute('data-anime'), dataAnimeAttrType);
            let targets;
            if (options.targets) {
                targets = [...$(options.targets, el)];
                delete options.targets
            } else {
                targets = el
            }
            const instance = anime({
                targets,
                ...options,
            });
            instance.pause();
            el.animeInstance = instance;
            runHelper(el, options, instance)
        })
    };
    const timelines = {};
    const timelinesPromises = {};
    const timelinesResolvers = {};
    const defineAnimeTimelineHelper = (name, fn) => {
        timelines[name] = fn;
        if (timelinesResolvers[name]) {
            timelinesResolvers[name](fn)
        }
    };
    Object.assign(window, {
        defineAnimeTimelineHelper
    });
    const runDataAnimeTimeline = () => {
        document.querySelectorAll('[data-anime-timeline]').forEach(async el => {
            if (el.animeTimelineHelper) return;
            el.animeTimelineHelper = !0;
            let timelineName = el.getAttribute('data-anime-timeline');
            let options;
            if (timelineName.includes(':')) {
                options = parseDataAttr(timelineName, {});
                timelineName = options.timeline;
                delete options.timeline
            } else {
                options = {}
            }
            let instance;
            if (timelines[timelineName]) {
                instance = timelines[timelineName](el, options);
                instance.pause()
            } else {
                if (!timelinesPromises[timelineName]) {
                    timelinesPromises[timelineName] = new Promise(resolve => {
                        timelinesResolvers[timelineName] = resolve
                    })
                }
                await timelinesPromises[timelineName].then(() => {
                    instance = timelines[timelineName](el, options);
                    instance.pause()
                })
            }
            el.animeTimelineInstance = instance;
            runHelper(el, options, instance)
        })
    };
    const runDataAnimeToggle = () => {
        document.querySelectorAll('[data-anime-toggle]').forEach(async el => {
            if (el.animeToggleHelper) return;
            el.animeToggleHelper = !0;
            const toggleSelector = el.getAttribute('data-anime-toggle');
            el.addEventListener('click', e => {
                e.preventDefault();
                const els = [...$(toggleSelector)];
                els.forEach(other => {
                    const instance = other.animeTimelineInstance || other.animeInstance;
                    if (!instance) return;
                    runInstance(other, instance, 'alternate')
                })
            })
        })
    };
    runDataAnime();
    runDataAnimeTimeline();
    runDataAnimeToggle()
};
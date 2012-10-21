/*
    VLIGHT v1.1.0
    https://github.com/vilic/vlight

    Copyright 2012, VILIC VANE
    Licensed under the MIT license.
*/

(function () {
    var isReady = false;

    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', ready, false);
        window.addEventListener('load', ready, false);
    }
    else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', ready);
        window.attachEvent('onload', ready);
    }

    function ready() {
        if (isReady) return;
        isReady = true;
        onload();
    }

    function onload() {
        setTimeout(function () {
            var className = 'vlight', //define the class name for html elements
                maxLineCount = 15, //maxmum lines
                lineHeight = 16, //line height
                scrollBarWidth = 24, //prediction of scrollbar width
                cssText = (
                    'div.vlight { position: relative; margin: 10px 0px; line-height: ' + lineHeight + 'px; color: #000000; font-size: 12px; font-family: Courier New, monospace; white-space: nowrap; overflow: hidden; }' +
                    'div.vlight div.vlight_top { padding-right: 10px; height: 16px; line-height: 16px; border-radius: 2px 2px 0px 0px; border-bottom: solid 5px #FFE8A6; background-color: #2F4160; font-size: 10px; text-align: right; color: #D6DBE4; }' +
                    'div.vlight a.vlight_link { color: #FFFFFF!important; text-decoration: none!important; }' +
                    'div.vlight a.vlight_link:hover { text-decoration: underline!important; }' +
                    'div.vlight div.vlight_left { position: absolute; width: 65px; left: 0px; text-align: right; color: #2B91AF; overflow: hidden; }' +
                    'div.vlight div.vlight_left div { position: relative; width: 40px; left: 0px; padding-right: 5px; border-left: solid 16px #F0F0F0; border-right: solid 4px #6CE26C; }' +
                    'div.vlight div.vlight_main { position: relative; margin-left: 65px; padding-left: 5px; overflow-x: scroll; overflow-y: auto; }' +
                    'div.vlight div.vlight_bottom { height: 5px; border-radius: 0px 0px 2px 2px; background-color: #FFE8A6; font-size: 0px; }' +
                    'div.vlight span.vlight_cm { color: #008000; }' +
                    'div.vlight span.vlight_re { color: #800000; }' +
                    'div.vlight span.vlight_st { color: #800000; }' +
                    'div.vlight span.vlight_kw { color: #0000FF; }' +
                    'div.vlight span.vlight_mk { color: #0000FF; }' +
                    'div.vlight span.vlight_lb { color: #800000; }' +
                    'div.vlight span.vlight_vn { color: #FF0000; }' +
                    'div.vlight span.vlight_vl { color: #0000FF; }' +
                    'div.vlight span.vlight_sl { color: #800000; }' +
                    'div.vlight span.vlight_bl { color: #0000FF; }' +
                    'div.vlight span.vlight_cn { color: #FF0000; }' +
                    'div.vlight span.vlight_cv { color: #0000FF; }'
                ).replace(/vlight/g, className);

            createStyle(cssText);

            var eles = getElementsByClassName(className);

            var spanl = '<span class="' + className + '_';
            var spanm = '">';
            var spanr = '</span>';

            for (var i = 0; i < eles.length; i++) (function (ele) {
                var div = document.createElement('div');
                div.className = className;
                div.innerHTML = (
                    '<div class="vlight_top">highlighted by <a class="vlight_link" href="https://github.com/vilic/vlight">vlight</a></div>' +
                    '<div class="vlight_left"></div>' +
                    '<div class="vlight_main"></div>' +
                    '<div class="vlight_bottom"></div>'
                    ).replace(/vlight/g, className);

                var top = div.childNodes[0];
                var left = div.childNodes[1];
                var main = div.childNodes[2];

                var oText;
                if (ele.tagName == 'TEXTAREA') oText = ele.value;
                else if (ele.tagName == 'PRE') oText = ele.innerText || ele.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                else oText = htmlToText(ele.innerHTML);

                var text;

                if (/^\s*</.test(oText)) text = convertHTML(oText);
                else {
                    var temp = oText.replace(/(\/\*[\s\S]*?\*\/)/g, '').replace(/((['"])(\2|.*?([^\\]\2|\\\\\2)))/g, '');

                    var cssKeysCount = (temp.match(/[\w.#]+\s*{[\s\S]*?}/g) || []).length;
                    var jsKeysCount = (temp.match(/(^|[^\w])(var|for|if|else|function)[^\w]|=|\+/g) || []).length;

                    text = cssKeysCount > jsKeysCount ? convertCSS(oText) : convertJS(oText);
                }

                var result = finalDeal(text);

                main.innerHTML = result.html;

                var lines = ''
                for (var i = 1; i <= result.count; i++)
                    lines += i + '<br />';
                left.innerHTML = '<div>' + lines + '</div>';

                ele.parentNode.replaceChild(div, ele);

                left.style.height = main.style.height = lineHeight * (result.count > maxLineCount ? maxLineCount : result.count) + scrollBarWidth + 'px';
                left.childNodes[0].style.height = result.count * lineHeight + scrollBarWidth + 'px';

                addEvent(window, 'resize', resize);
                addEvent(main, 'scroll', scroll);

                resize();

                function resize() {
                    try {
                        main.style.width = top.offsetWidth - left.offsetWidth - 5 + 'px';
                    } catch (e) { }
                }

                function scroll() {
                    left.childNodes[0].style.marginTop = -main.scrollTop + 'px';
                }
            })(eles[i]);

            function htmlToText(html) {
                return html.replace(/\r?\n/g, '').replace(/<p(\s[^>]*)?>([\s\S]*?)<\/p>/gi, '$2\r\n\r\n').replace(/<div(\s[^>]*)?>([\s\S]*?)<\/div>/gi, '$2\r\n').replace(/<([a-z]+)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi, '$3').replace(/<br[^>]*>/gi, '\r\n').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
            }

            function textToHTML(text) {
                return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }

            function convertHTML(text) {
                var globalRE = /(<!\-\-[\s\S]*?\-\->)|(<script(\s[^>]*)?>[\s\S]*?<\/script>)|(<style(\s[^>]*)?>[\s\S]*?<\/style>)|(<(!doctype|\/?[a-z_][\w:]*)([^>]*)>)/ig;

                var cmRE = /^<!\-\-[\s\S]*?\-\->$/;
                var scRE = /^(<script(\s[^>]*)?>)([\s\S]*?)(<\/script>)$/i;
                var stRE = /^(<style(\s[^>]*)?>)([\s\S]*?)(<\/style>)$/i;
                var otRE = /^<(!doctype|\/?[a-z_][\w:]*)([^>]*)>$/i;

                var nlRE = /^(<[!\/]?)([a-z_][\w:]*)([^>]*?(?=[\/>]))(\/?>)$/i;

                var vlGlobalRe = /[a-z_]+\s*=\s*(".*?("|(?=$))|'.*?('|(?=$))|[^\s]*)|[a-z_]+ *=|[a-z_]+|(".*?("|(?=$))|'.*?('|(?=$)))/gi;

                var vlfRE = /^([a-z_]+)(\s*=\s*)(".*?("|(?=$))|'.*?('|(?=$))|[^\s]*)$/i;
                var vlneRE = /^([a-z_]+)(\s*=)$/i;
                var vlnRE = /^([a-z_]+)$/i;
                var vlvRE = /^(".*?("|(?=$))|'.*?('|(?=$)))$/;

                text = text.replace(/&/g, '&amp;');
                text = text.replace(globalRE, function (s) {
                    var parts;
                    if (cmRE.test(s))
                        return spanl + 'cm' + spanm + textToHTML(s) + spanr;
                    if (parts = scRE.exec(s))
                        return normalLabel(parts[1]) + convertJS(parts[3]) + normalLabel(parts[4]);
                    if (parts = stRE.exec(s))
                        return normalLabel(parts[1]) + convertCSS(parts[3]) + normalLabel(parts[4]);
                    if (otRE.test(s))
                        return normalLabel(s);
                });

                return text;

                function normalLabel(text) {
                    var parts = nlRE.exec(text);

                    return (
                        spanl + 'mk' + spanm + textToHTML(parts[1]) + spanr +
                        spanl + 'lb' + spanm + parts[2] + spanr +
                        (parts[3] ? a = labelValues(parts[3]) : '') +
                        spanl + 'mk' + spanm + textToHTML(parts[4]) + spanr
                    );
                }

                function labelValues(text) {
                    text = text.replace(vlGlobalRe, function (s) {
                        var parts;
                        if (parts = vlfRE.exec(s))
                            return (
                        spanl + 'vn' + spanm + parts[1] + spanr +
                        spanl + 'mk' + spanm + parts[2] + spanr +
                        spanl + 'vl' + spanm + parts[3] + spanr
                    );
                        if (parts = vlneRE.exec(s))
                            return (
                        spanl + 'vn' + spanm + parts[1] + spanr +
                        spanl + 'mk' + spanm + parts[2] + spanr
                    );
                        if (vlnRE.test(s))
                            return spanl + 'vn' + spanm + s + spanr;
                        if (vlvRE.test(s))
                            return spanl + 'mk' + spanm + s + spanr;
                        return s;
                    });

                    return text;
                }
            }

            function convertCSS(text) {
                var globalRE = /\/\*[\s\S]*?\*\/|@[a-z-]+[\s\S]*?(;|\{|$)|[^\{\}\s,]+|\{[\s\S]*?\}/gi;

                var cmRE = /^\/\*[\s\S]*?\*\/$/;
                var blRE = /^(@[a-z-]+)([\s\S]*?(;|\{|$))$/i;
                var slRE = /^[^\{\}\s,]+$/;
                var ctRE = /^\{([\s\S]+?)\}$/;
                var csRE = /([a-z-]+)( *:\s*)([\s\S]*?)(;|$)/gi;

                text = textToHTML(text);

                text = text.replace(globalRE, function (s) {
                    var parts;
                    if (cmRE.test(s)) return spanl + 'cm' + spanm + s + spanr;
                    if (parts = blRE.exec(s)) return spanl + 'bl' + spanm + parts[1] + spanr + parts[2];
                    if (slRE.test(s)) return spanl + 'sl' + spanm + s + spanr;
                    if (parts = ctRE.exec(s)) return '{' + cssValues(parts[1]) + '}';
                    return s;
                });

                return text;

                function cssValues(text) {
                    text = text.replace(csRE, function (s) {
                        var parts = arguments;
                        return (
                    spanl + 'cn' + spanm + parts[1] + spanr +
                    parts[2] +
                    spanl + 'cv' + spanm + parts[3] + spanr +
                    parts[4]
                );
                    })

                    return text;
                }

            }
            
            function convertJS(text) {
                var names = ["", "cm", "st", "", "re", "kw"];

                var globalRE = /(\/\*[\s\S]*?\*\/|\/\/.*)|((['"])(?:\\[\s\S]|[^\\\r\n])*?\3)|(\/(?:\\.|[^\\\r\n])*?\/[gim]{0,3})|((?:[^\w]|^)(?:break|delete|function|return|typeof|case|do|if|switch|var|catch|else|in|this|void|continue|false|instanceof|throw|while|debugger|finally|new|true|with|default|for|null|try)(?=[^\w]|$))/g;

                text = textToHTML(text);

                text = text.replace(globalRE, function (m, cmt, str, g3, re, kw) {
                    var i, s;
                    for (i = 1; s = arguments[i], i < 5; i++) {
                        if (s)
                            return spanl + names[i] + spanm + s + spanr;
                    }

                    s = s.replace(/\w+/, function (kw) {
                        return spanl + names[i] + spanm + kw + spanr;
                    });

                    return s;
                });

                return text;
            }

            function finalDeal(text) {
                var count = 1;
                text = text.replace(/\t/g, '    ').replace(/  /g, '&nbsp; ').replace(/  /g, ' &nbsp;').replace(/(\r?\n)+$/g, '').replace(/\r?\n/g, function () { count++; return '<br />'; });
                return { html: text, count: count };
            }
        }, 0);
    }

    function addEvent(object, name, handler) {
        if (object.addEventListener) object.addEventListener(name, handler, false);
        else if (object.attachEvent) object.attachEvent('on' + name, handler);
    }

    function createStyle(cssText) {
        if (document.createStyleSheet)
            document.createStyleSheet().cssText = cssText;
        else {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.textContent = cssText;
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    }

    function getElementsByClassName(className) {
        var eles = document.getElementsByTagName('*');
        var arr = [];
        var re = new RegExp('^(.* )?' + className + '( .*)?$');
        for (var i = 0, ele; ele = eles[i]; i++)
            if (re.test(ele.className)) arr.push(ele);
        return arr;
    }
})();
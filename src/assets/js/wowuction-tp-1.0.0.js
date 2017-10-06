try
{
    var $wu =
    {
        initialized: false,
        tooltip: null,
        css: "div.wowuction_tooltip {position:absolute;z-index:999;background-color:#222;opacity: 0.85;filter:alpha(opacity=85);padding:0px;margin:0px;border:2px ridge Yellow;border-radius: 5px;-moz-border-radius: 5px;-webkit-border-radius: 5px;max-width: 250px;min-width:50px;min-height:10px;box-shadow: 3px 3px 15px 2px Black;top:-9000px;left:-9000px;color:white;font-family: Verdana;font-size: 12px; line-height:normal;text-align:left;}",
        css_sig: "span.wowuction_sig {font-size: 10px; color: white; font-style: italic; padding-left: 2px; padding-right:2px; }",
        css_tp_c: "div.wowuction_tp_c {padding: 4px; font-weight: bold;}",
        lastmove: 0,
        lastvisitedel: null,
        visible: false,
        currentmouseoverid: null,
        iscurrentwowhead: false,
        currentwowheadel: null,
        isfreshwowhead: false,
        wowheadenabled: true,
        pattern: new RegExp("^(www\.wowuction\.com/|http://www\.wowuction\.com/).*items/stats/([0-9]+)", "i"),
        patternlocal: new RegExp("^[/]*(.*)items/stats/([0-9]+)", "i"),
        patternwowhead: new RegExp("(\.wowhead\.com)/item=([0-9]+)", "i"),
        items: new Array(),

        create_tooltip: function ()
        {
            var docbody = document.getElementsByTagName("body")[0];
            $wu.tooltip = document.createElement("div");

            $wu.tooltip.appendChild($wu.create_content());
            $wu.tooltip.appendChild($wu.create_sig());

            $wu.tooltip.setAttribute("class", "wowuction_tooltip");
            docbody.appendChild($wu.tooltip);
        },

        create_sig: function ()
        {
            var sig = document.createElement("span");
            sig.innerHTML = "www.wowuction.com";
            sig.setAttribute("class", "wowuction_sig");
            return sig;
        },

        create_content: function ()
        {
            var contentdiv = document.createElement("div");
            contentdiv.setAttribute("class", "wowuction_tp_c");
            return contentdiv;
        },

        pos_tooltip: function (x, y)
        {
            $wu.tooltip.style.top = y.toString() + "px";
            $wu.tooltip.style.left = x.toString() + "px";
            visible = true;
        },

        hide_tooltip: function ()
        {
            $wu.pos_tooltip(-9000, -9000);
            $wu.visible = false;
        },

        init_insertcss: function ()
        {
            var cssel = document.createElement("style");
            cssel.setAttribute("type", "text/css");
            var cssall = $wu.css + $wu.css_sig + $wu.css_tp_c;
            if (cssel.styleSheet)
            {
                cssel.styleSheet.cssText = cssall;
            }
            else
            {
                cssel.innerHTML = cssall;
            }
            document.getElementsByTagName("head")[0].appendChild(cssel);
        },

        is_myanchor: function (a)
        {
            var href = a.getAttribute("href");
            $wu.iscurrentwowhead = false; $wu.currentwowheadel = null;
            if (href == null) return null;
            var res = null;
            if ((document.domain == "www.wowuction.com") || (document.domain == "localhost"))
            {
                res = $wu.pattern.exec(href);
                if (res == null) res = $wu.patternlocal.exec(href);
            }
            else
            {
                res = $wu.pattern.exec(href);
            }

            if ((res == null) && ($wu.wowheadenabled))
            {
                res = $wu.patternwowhead.exec(href);
                if (res != null)
                {
                    $wu.iscurrentwowhead = true;
                }
            }

            if (res == null) return null;
            else
            {
                if (res.length == 3) return res[2];
                else return null;
            }
        },

        find_myanchor: function (el)
        {
            var found = null;
            var count = 0;
            while ((count < 3) && (el != null))
            {
                if (el.nodeName == "A")
                {
                    found = el;
                    break;
                }
                el = el.parentNode;
                count++;
            }
            if (found != null)
            {
                return $wu.is_myanchor(found);
            }
            else return null;
        },

        load_new: function (id)
        {
            if ($wu.currentmouseoverid != id) return;

            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "http://www.wowuction.com/API/GetItemInfo/" + id;
            document.body.appendChild(script);
        },

        check_showhide: function (el)
        {
            var a = $wu.find_myanchor(el);
            if (a != null)
            {
                if ($wu.currentmouseoverid != a)
                {
                    $wu.currentmouseoverid = a;
                    if (!(a in $wu.items))
                    {
                        $wu.items[a] = null;
                    }

                    if ($wu.items[a] == null)
                    {
                        $wu.tooltip.childNodes[0].innerHTML = "Loading...";
                        $wu.update_wowhead_pos(false);
                        setTimeout('$wu.load_new(' + a.toString() + ')', 50);
                    }
                    else
                    {
                        $wu.tooltip.childNodes[0].innerHTML = $wu.items[a];
                    }
                }
                $wu.visible = true;
                $wu.isfreshwowhead = true;
                setTimeout("$wu.update_wowhead_pos(true)", 50);
            }
            else
            {
                if ($wu.visible == true)
                {
                    $wu.currentmouseoverid = -1;
                    $wu.hide_tooltip();
                }
            }
        },

        update_wowhead_pos: function (istimed)
        {
            if ($wu.visible && $wu.iscurrentwowhead)
            {
                var wpos = $wu.get_wowhead_pos();
                var h = $wu.tooltip.offsetHeight;
                if (wpos != null) $wu.pos_tooltip(wpos.left + 2, wpos.top - h - 2);
                $wu.isfreshwowhead = false;
                if (istimed) setTimeout("$wu.update_wowhead_pos(true)", 300);
            }
        },

        event_mousemoveold: null,
        event_mousemove: function (e)
        {
            var target;

            if (typeof e != 'undefined') target = e.target;
            else target = event.srcElement;

            if (target != $wu.lastvisitedel)
            {
                $wu.check_showhide(target);
                $wu.lastvisitedel = target;
            }

            var time = new Date().getTime();
            if ($wu.visible && (time - $wu.lastmove > 20))
            {
                var px, py;
                if (typeof e != 'undefined')
                {
                    px = e.pageX;
                    py = e.pageY;
                }
                else
                {
                    px = event.clientX;
                    py = event.clientY;
                }

                if ($wu.iscurrentwowhead)
                {
                    if (!$wu.isfreshwowhead) $wu.update_wowhead_pos(false);
                }
                else
                {
                    $wu.pos_tooltip(px + 25, py + 15);
                }
                $wu.lastmove = time;
            }

            if ($wu.event_mousemoveold) return $wu.event_mousemoveold(e);
        },

        get_wowhead_pos: function ()
        {
            if ($wu.currentwowheadel == null)
            {
                f = document.getElementsByTagName("body")[0].getElementsByTagName("div");
                for (var i = 0; i < f.length; i++)
                {
                    if (f[i].getAttribute("class") == "wowhead-tooltip")
                    {
                        if (f[i].style.visibility == "visible")
                        {
                            $wu.currentwowheadel = f[i];
                        }
                    }
                }
            }

            if ($wu.currentwowheadel != null)
            {
                var res = {};
                res.top = parseInt($wu.currentwowheadel.style.top);
                res.left = parseInt($wu.currentwowheadel.style.left);
                return res;
            }
            return null;
        },

        init_events: function ()
        {
            $wu.event_mousemoveold = document.onmousemove;
            document.onmousemove = $wu.event_mousemove;
        },

        datacallback: function (id, s)
        {
            $wu.items[id] = s;
            if ($wu.currentmouseoverid == id)
            {
                $wu.tooltip.childNodes[0].innerHTML = s;
                $wu.update_wowhead_pos(false);
            }
        },

        init: function ()
        {
            try
            {
                if (!$wu.initialized)
                {
                    $wu.init_insertcss();
                    $wu.create_tooltip();
                    $wu.init_events();
                    $wu.initialized = true;
                }
            }
            catch (err)
            {
            }
        }
    };
    try
    {
        document.addEventListener("DOMContentLoaded", $wu.init, false);
    }
    catch (err)
    {
        /*@cc_on@*/
        /*@if (@_win32)
        document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
        var script = document.getElementById("__ie_onload");
        script.onreadystatechange = function ()
        {
            if (this.readyState == "complete")
            {
                $wu.init(); // call the onload handler
            }
        };
        /*@end@*/
    }
}
catch (err)
{
}

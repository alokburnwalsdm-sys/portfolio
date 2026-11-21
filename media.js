/* Shows any kind of uploaded content: image, SVG, GIF, video, PDF, YouTube/Vimeo/Figma/Loom links, or any download file. */
(function () {
  var IMG = /^(png|jpe?g|gif|webp|avif|svg|bmp|ico)$/, VID = /^(mp4|webm|mov|m4v|ogv|ogg)$/;
  function ext(u) { u = String(u || '').split('#')[0].split('?')[0]; var m = u.match(/\.([a-z0-9]+)$/i); return m ? m[1].toLowerCase() : ''; }
  function fname(u) { try { return decodeURIComponent(String(u).split('#')[0].split('?')[0].split('/').pop()); } catch (e) { return String(u); } }
  function safe(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^data:(image|video)\//i.test(u)) return u;
    if (/^[a-z][a-z0-9+.\-]*:/i.test(u)) return /^https?:\/\//i.test(u) ? u : '';
    if (/^\/\//.test(u)) return '';
    return u;
  }
  function embedUrl(u) {
    var m;
    if ((m = u.match(/^https:\/\/(?:www\.)?youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]{6,})/)) || (m = u.match(/^https:\/\/youtu\.be\/([\w-]{6,})/)) || (m = u.match(/^https:\/\/(?:www\.)?youtube\.com\/(?:embed|shorts)\/([\w-]{6,})/))) return 'https://www.youtube.com/embed/' + m[1];
    if ((m = u.match(/^https:\/\/(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)/))) return 'https://player.vimeo.com/video/' + m[1];
    if ((m = u.match(/^https:\/\/(?:www\.)?loom\.com\/(?:share|embed)\/(\w+)/))) return 'https://www.loom.com/embed/' + m[1];
    if (/^https:\/\/(?:www\.)?figma\.com\/(file|design|proto|board)\//.test(u)) return 'https://www.figma.com/embed?embed_host=share&url=' + encodeURIComponent(u);
    return '';
  }
  function kind(u) {
    u = safe(u);
    if (!u) return '';
    if (/^data:image\//i.test(u)) return 'image';
    if (/^data:video\//i.test(u)) return 'video';
    if (/^https?:\/\//i.test(u) && embedUrl(u)) return 'embed';
    var e = ext(u);
    if (IMG.test(e)) return 'image';
    if (VID.test(e)) return 'video';
    if (e === 'pdf') return 'pdf';
    return /^https?:\/\//i.test(u) ? 'link' : 'file';
  }
  function btn(href, label, sub) {
    var a = document.createElement('a');
    a.href = href; a.target = '_blank'; a.rel = 'noopener';
    a.style.cssText = 'display:inline-flex;align-items:center;gap:12px;padding:14px 20px;border-radius:16px;border:1px solid rgba(128,128,128,.35);background:rgba(128,128,128,.12);color:inherit;text-decoration:none;font:600 15px system-ui,sans-serif;max-width:100%';
    if (sub) { var b = document.createElement('b'); b.textContent = sub; b.style.cssText = 'background:#c8342b;color:#fff;border-radius:8px;padding:4px 9px;font-size:12px;letter-spacing:.05em'; a.appendChild(b); }
    var s = document.createElement('span'); s.textContent = label; s.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap'; a.appendChild(s);
    return a;
  }
  function make(u, o) {
    o = o || {};
    var k = kind(u), s = safe(u), n;
    if (!k) return null;
    if (k === 'image') {
      n = new Image(); n.src = s; n.alt = o.alt || ''; n.loading = 'lazy';
      n.style.cssText = o.cover ? 'width:100%;height:100%;object-fit:cover;display:block' : 'width:100%;height:auto;display:block';
    } else if (k === 'video') {
      n = document.createElement('video'); n.src = s; n.setAttribute('playsinline', '');
      if (o.cover) { n.muted = true; n.loop = true; n.autoplay = true; n.preload = 'auto'; n.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'; }
      else { n.controls = true; n.preload = 'metadata'; n.style.cssText = 'width:100%;height:auto;display:block;background:#000;border-radius:20px'; }
    } else if (k === 'embed') {
      n = document.createElement('div'); n.style.cssText = 'position:relative;width:100%;padding-top:56.25%;border-radius:20px;overflow:hidden;background:#000';
      var f = document.createElement('iframe'); f.src = embedUrl(s); f.title = o.alt || 'Embedded content'; f.loading = 'lazy';
      f.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write'; f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0'; n.appendChild(f);
    } else if (k === 'pdf') {
      if (o.cover) { n = document.createElement('div'); n.textContent = 'PDF'; n.style.cssText = 'width:100%;height:100%;display:grid;place-items:center;font:800 2rem system-ui,sans-serif;color:#bbb'; }
      else {
        n = document.createElement('div'); n.style.cssText = 'width:100%';
        var fr = document.createElement('iframe'); fr.src = s + '#view=FitH'; fr.title = o.alt || 'PDF document'; fr.loading = 'lazy';
        fr.style.cssText = 'width:100%;height:min(80vh,760px);border:1px solid rgba(128,128,128,.35);border-radius:20px;background:#fff;display:block';
        n.appendChild(fr);
        var w = document.createElement('div'); w.style.cssText = 'margin-top:12px'; w.appendChild(btn(s, 'Open PDF in new tab', 'PDF')); n.appendChild(w);
      }
    } else if (k === 'link') {
      n = btn(s, o.label || 'Open link', '\u2197');
    } else {
      n = btn(s, fname(s), (ext(s) || 'file').toUpperCase().slice(0, 5)); n.setAttribute('download', '');
    }
    if (o.caption && !o.cover) {
      var fg = document.createElement('figure'); fg.style.cssText = 'margin:0;width:100%'; fg.appendChild(n);
      var c = document.createElement('figcaption'); c.textContent = o.caption; c.style.cssText = 'margin-top:10px;font-size:.92rem;opacity:.7'; fg.appendChild(c); return fg;
    }
    return n;
  }
  window.AMedia = { kind: kind, el: make, ext: ext, embedUrl: embedUrl };
})();

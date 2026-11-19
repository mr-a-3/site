// Shared photo controls and optional photos tied to a product colour.
(() => {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const previewUrl = url => url.startsWith('photo-') ? 'https://images.unsplash.com/'+url+'?auto=format&fit=crop&w=160&q=75' : url;
  const colorList = value => [...new Set(value.split(',').map(color=>color.trim().toLowerCase()).filter(color=>/^#[0-9a-f]{6}$/.test(color)))].slice(0,6);

  function photoRow({key, name, label, url='', required=false}) {
    const preview = url ? 'src="'+escape(previewUrl(url))+'"' : 'hidden';
    return `<div class="gallery-editor-row">
      <img data-gallery-preview="${key}" ${preview} alt="">
      <label class="field"><span>${label}</span><input type="text" name="${name}" data-gallery-url="${key}" value="${escape(url)}" ${required?'required':''} maxlength="2000"></label>
      <label class="small-button gallery-upload">Upload<input type="file" data-gallery-upload="${key}" accept="image/png,image/jpeg,image/webp,image/gif"></label>
      ${required?'':`<button type="button" class="small-button" data-gallery-clear="${key}">Remove</button>`}
    </div>`;
  }

  window.productGalleryFields = p => '<fieldset class="wide gallery-editor"><legend>Product photos · up to 4</legend>'+
    [p.image,...(p.images||[]),'','',''].slice(0,4).map((url,index)=>photoRow({
      key:index, name:index?'gallery'+index:'image', label:index?'Photo '+(index+1)+' · optional':'Cover photo', url, required:index===0
    })).join('')+'</fieldset>';

  window.mountColorGalleryEditor = (form, saved = {}) => {
    const colors = form.elements.namedItem('colors');
    const section = form.querySelector('[data-color-gallery-editor]');
    const groups = new Map();
    const hint = section.querySelector('p');

    function syncGroups() {
      const active = colorList(colors.value);
      for (const [color, group] of groups) group.hidden = !active.includes(color);
      hint.hidden = active.length > 0;
      for (const color of active) {
        if (groups.has(color)) continue;
        const group = document.createElement('details');
        group.dataset.photoColor = color;
        const photos = saved[color] || [];
        group.innerHTML = `<summary>Photos for <span style="display:inline-block;width:1em;height:1em;border:1px solid #888;border-radius:50%;vertical-align:middle;background:${color}" aria-hidden="true"></span> ${color}</summary>`+
          [0,1].map(index=>photoRow({
            key:'color-'+color.slice(1)+'-'+index, name:'colorPhoto-'+color.slice(1)+'-'+index,
            label:'Photo '+(index+1)+' · optional', url:photos[index]
          })).join('');
        groups.set(color,group);
        section.append(group);
      }
    }

    // The form persists across dialog sessions, so attach to the current colour input.
    colors.addEventListener('input',syncGroups);
    syncGroups();
  };

  window.readColorGallery = form => Object.fromEntries(colorList(form.elements.namedItem('colors').value).flatMap(color=>{
    const group = form.querySelector('[data-photo-color="'+color+'"]');
    const photos = Array.from(group?.querySelectorAll('[data-gallery-url]')||[], input=>input.value.trim()).filter(Boolean);
    return photos.length ? [[color,photos]] : [];
  }));

  window.updateGalleryPreview = (key,value) => {
    const image = document.querySelector('[data-gallery-preview="'+key+'"]');
    if (!image) return;
    image.hidden = !value;
    if (value) image.src = previewUrl(value);
    else image.removeAttribute('src');
  };

  document.addEventListener('input',event=>{
    const input = event.target;
    if (input.matches('[data-gallery-url]')) window.updateGalleryPreview(input.dataset.galleryUrl,input.value.trim());
  });

  document.addEventListener('click',event=>{
    const button = event.target.closest('[data-gallery-clear]');
    if (!button) return;
    const key = button.dataset.galleryClear;
    button.closest('.gallery-editor-row').querySelector('[data-gallery-url]').value = '';
    window.updateGalleryPreview(key,'');
  });
})();

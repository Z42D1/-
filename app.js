const byId = id => document.getElementById(id);
const number = value => value.toLocaleString('ar-SA');
const asset = id => 'assets/' + id + '.webp';
const viewer = byId('viewer');
const catalogue = [
  ['الكل', works.map(work => work.key)],
  ['الحملات الرقمية', ['rimaq','riza','pure','try','khotwa','wardi','ghadeer','khalid']],
  ['الهويات والمطبوعات', ['rimaq','khotwa','masar','expo','independent']],
  ['صور المنتجات', ['rimaq','manrella','fragrance']]
];
const scenes = [
  {scene:'sound',image:'headphones',title:'رمّاق · دراسة لون المنتج',alt:'دراسة لونية لسماعة مرجانية بوسائد بنفسجية',code:'RIMAQ / PRODUCT STUDY',key:'rimaq'},
  {scene:'leaves',image:403,title:'ريزا · العناية بالنبات',alt:'منشور للعناية بالنبات بخلفية خضراء',code:'RIZA / SOCIAL CAMPAIGN',key:'riza',group:1},
  {scene:'jewel',image:1006,title:'مانريلا · عرض المجوهرات',alt:'قطعة مجوهرات على خلفية قماشية',code:'MANRELLA / JEWELLERY',key:'manrella'}
];
let selectedScene = 0;
let project, groupIndex = 0, imageIndex = 0, opener;
const make = (tag, cls, label) => {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (label) node.textContent = label;
  return node;
};
function image(id, cls, alt = '') {
  const node = make('img', cls);
  node.src = asset(id); node.alt = alt; node.loading = 'lazy';
  return node;
}
function press(container, selected) {
  [...container.children].forEach((btn, index) => btn.setAttribute('aria-pressed', String(index === selected)));
}
function selectScene(index) {
  selectedScene = index;
  const scene = scenes[index];
  document.querySelector('.stage').dataset.scene = scene.scene;
  byId('featureImage').src = asset(scene.image);
  byId('featureImage').alt = scene.alt;
  byId('stageCode').textContent = scene.code;
  byId('featureTitle').textContent = scene.title;
  byId('featureOpen').setAttribute('aria-label', 'فتح ' + scene.title);
  press(byId('featureChoices'), index);
}
scenes.forEach((scene, i) => {
  const btn = make('button'); btn.setAttribute('aria-label', scene.title); btn.title = scene.title;
  btn.onclick = () => selectScene(i); byId('featureChoices').append(btn);
});
selectScene(0);
byId('featureOpen').onclick = event => {
  const scene = scenes[selectedScene];
  openProject(scene.key, scene.group || 0, event.currentTarget, scene.image === 'headphones' ? 382 : scene.image);
};
function filter(index) {
  const keys = catalogue[index][1];
  const cards = byId('cards'); cards.replaceChildren(); press(byId('filters'), index);
  byId('total').textContent = number(keys.length) + (keys.length >= 3 && keys.length <= 10 ? ' مشاريع' : ' مشروعًا');
  works.filter(work => keys.includes(work.key)).forEach(work => {
    const card = make('button','card');
    card.setAttribute('aria-label','عرض أعمال ' + work.title);
    const art = make('span','art' + (work.cover.length === 1 ? ' only' : ''));
    art.style.setProperty('--tint',work.color);
    if (work.cover[1]) art.append(image(work.cover[1],'rear'));
    art.append(image(work.cover[0],'front'));
    const info = make('span','cardinfo');
    info.append(make('strong','',work.title),make('small','',work.tag));
    card.append(art,info); card.onclick = () => openProject(work.key,0,card);
    cards.append(card);
  });
}
catalogue.forEach(([label], i) => {
  const btn = make('button','',label); btn.onclick = () => filter(i); byId('filters').append(btn);
});
filter(0);
function openProject(key, index, trigger, startingImage) {
  project = works.find(work => work.key === key);
  if (!project) return;
  opener = trigger;
  byId('projectName').textContent = project.title;
  const series = byId('series'); series.replaceChildren();
  project.groups.forEach((group, i) => {
    const btn = make('button','',group.title);
    btn.onclick = () => selectGroup(i); series.append(btn);
  });
  selectGroup(index, startingImage);
  viewer.showModal(); viewer.scrollTop = 0; byId('closeCase').focus();
}
function selectGroup(index, startingImage) {
  groupIndex = index;
  const group = project.groups[index];
  byId('groupName').textContent = group.title; byId('groupDesc').textContent = group.desc;
  press(byId('series'),index);
  const thumbs = byId('thumbs'); thumbs.replaceChildren();
  group.imgs.forEach((id, i) => {
    const btn = make('button'); btn.setAttribute('aria-label','عرض الصورة ' + number(i+1));
    btn.append(image(id,'')); btn.onclick = () => selectImage(i); thumbs.append(btn);
  });
  selectImage(Math.max(0,group.imgs.indexOf(startingImage)));
}
function selectImage(index) {
  const group = project.groups[groupIndex];
  if (index < 0 || index >= group.imgs.length) return;
  imageIndex = index;
  byId('fullImage').src = asset(group.imgs[index]);
  byId('fullImage').alt = project.title + '، ' + group.title + '، الصورة ' + number(index+1);
  byId('position').textContent = 'صورة ' + number(index+1) + ' من ' + number(group.imgs.length);
  byId('prev').disabled = index === 0; byId('next').disabled = index === group.imgs.length - 1;
  press(byId('thumbs'),index);
}
byId('next').onclick = () => selectImage(imageIndex+1);
byId('prev').onclick = () => selectImage(imageIndex-1);
byId('closeCase').onclick = () => viewer.close();
viewer.addEventListener('close', () => opener?.focus({preventScroll:true}));
viewer.addEventListener('click', e => {
  if (e.target !== viewer) return;
  const r = viewer.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) viewer.close();
});
viewer.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault(); selectImage(imageIndex + (e.key === 'ArrowLeft' ? 1 : -1));
  }
});

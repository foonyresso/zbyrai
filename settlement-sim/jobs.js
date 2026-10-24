/* Професії 20 мешканців: назва, клас бою (механіка combat), де працює (ключ зі spots розкладки), анімація роботи, деталі вигляду. */
const JOBS=[
  {title:'Староста',cls:'knight',work:'mayor',anim:'look',look:{robe:true,outfit:'#7a2e3a',trim:'#e9c24a',sash:'#e9c24a',hat:'crown',hair:'#d8d8d8',beard:true,weapon:'sword'}},
  {title:'Корчмар',cls:'berserker',work:'tavern',anim:'work',look:{outfit:'#d8d0b8',tabard:'#f4f0e6',bare:false,hat:'none',warpaint:false,horned:false,weapon:'club',beard:true,hair:'#6b4423'}},
  {title:'Крамарка',cls:'rogue',work:'shop',anim:'wave',look:{outfit:'#c0392b',hat:'band',hatC:'#f4f0e6',cape:null,off:null,weapon:'dagger',hairStyle:'long'}},
  {title:'Священник',cls:'healer',work:'church',anim:'look',look:{}},
  {title:'Коваль',cls:'berserker',work:'smithy',anim:'work',look:{hat:'none',weapon:'club',warpaint:false,beard:true,hair:'#2b1d12'}},
  {title:'Фермер',cls:'militia',work:'field',anim:'work'},
  {title:'Фермерка',cls:'militia',work:'field',anim:'work',look:{hairStyle:'long',outfit:'#c9a26a'}},
  {title:'Фермер',cls:'militia',work:'field',anim:'work'},
  {title:'Садівник',cls:'militia',work:'park',anim:'work',look:{outfit:'#6a9a5a'}},
  {title:'Рибалка',cls:'archer',work:'pond',anim:'look',look:{hat:'band',hatC:'#cdb98a',quiver:false,feather:false}},
  {title:'Вартовий',cls:'knight',work:'gate',anim:'look'},
  {title:'Вартова',cls:'knight',work:'gate',anim:'look',look:{hairStyle:'long'}},
  {title:'Мисливець',cls:'archer',work:'wall',anim:'look'},
  {title:'Мисливиця',cls:'archer',work:'wall',anim:'look',look:{hairStyle:'long'}},
  {title:'Мудрець',cls:'mage',work:'well',anim:'look'},
  {title:'Лікарка',cls:'healer',work:'church',anim:'wave',look:{outfit:'#e6f0e0',sash:'#c0392b'}},
  {title:'Пекар',cls:'militia',work:'shop',anim:'work',look:{outfit:'#f4f0e6',hat:'none'}},
  {title:'Тесля',cls:'militia',work:'barn',anim:'work',look:{outfit:'#9a7a4a'}},
  {title:'Бродяга',cls:'rogue',work:'plaza',anim:'wave',look:{outfit:'#6a5a7a'}},
  {title:'Менестрель',cls:'mage',work:'plaza',anim:'dance',look:{outfit:'#b04a7a',robe:false,hat:'band',hatC:'#e9c24a'}},
];
const NAMES=['Ярема','Орися','Захар','Мирослава','Тарас','Лада','Богдан','Рута','Остап','Зоряна','Данко','Ліна','Мирон','Оксана','Влад','Яна','Гордій','Соломія','Левко','Дарина'];
